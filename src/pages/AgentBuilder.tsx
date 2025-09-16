import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  MessageCircle,
  Loader2,
  Edit3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCurrentSession,
  setMessages,
  addMessage,
  setSessionName,
  setIsLoading,
  setIsTyping,
  updateSessionName,
} from "@/store/slices/sessionSlice";
import { chatApi, ChatMessage } from "@/lib/supabase";
import { cacheUtils, webhookUtils } from "@/lib/utils";
import Nango from "@nangohq/frontend";

// Types for webhook response
interface IntegrationAction {
  step: number;
  integrationDisplayName: string;
  integration: string;
  stepMessage: string;
  token: string;
  expires_at: string;
}

interface WebhookResponse {
  didRequestAgent: boolean;
  actions: IntegrationAction[];
  unsupportedIntegrations: string[];
  supportedAgent: boolean;
  modifiedPrompt: string;
  assistantResponse: string;
}

export default function AgentBuilder() {
  const { user } = useAuth();
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { currentSession, messages, sessionName, isLoading, isTyping } =
    useAppSelector((state) => state.session);

  // Local state
  const [inputMessage, setInputMessage] = useState("");
  const [webhookResponse, setWebhookResponse] =
    useState<WebhookResponse | null>(null);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [completedAuths, setCompletedAuths] = useState<Set<number>>(new Set());
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [agentCreated, setAgentCreated] = useState(false);
  const isCreatingSession = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Convert ChatMessage to Message format
  const convertChatMessage = (chatMessage: ChatMessage) => ({
    id: chatMessage.id,
    role: chatMessage.role,
    content: chatMessage.content,
    timestamp: new Date(chatMessage.created_at),
  });

  // Check if a session token is expired
  const isSessionExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) <= new Date();
  };

  // Check if all authentications are complete
  const areAllAuthsComplete = (): boolean => {
    if (!webhookResponse) return false;
    return webhookResponse.actions.every((action) =>
      completedAuths.has(action.step)
    );
  };

  // Send agent creation request
  const createAgent = async () => {
    if (!currentSession || !user || !webhookResponse) return;

    setIsCreatingAgent(true);
    setWebhookError(null);

    try {
      // Send a special message indicating all auths are complete
      const response = await webhookUtils.sendChatData(
        currentSession.id,
        user.id,
        "All authentications completed - please create the agent",
        new Date(),
        user.email
      );

      if (response && response.assistantResponse) {
        // Handle the final agent creation response
        const finalMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: response.assistantResponse,
          timestamp: new Date(),
        };

        dispatch(addMessage(finalMessage));

        // Save final message to database
        await chatApi.saveMessage(
          currentSession.id,
          "assistant",
          response.assistantResponse
        );

        // Mark agent as created but keep everything visible
        setAgentCreated(true);
      } else {
        setWebhookError("Failed to create agent. Please try again.");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      setWebhookError(
        "An error occurred while creating the agent. Please try again."
      );
    } finally {
      setIsCreatingAgent(false);
    }
  };

  // Handle Nango authentication
  const handleNangoAuth = async (action: IntegrationAction) => {
    try {
      const nango = new Nango();

      // Check if session is expired
      if (isSessionExpired(action.expires_at)) {
        setWebhookError(
          `The authentication session for ${action.integrationDisplayName} has expired. Please try again.`
        );
        return;
      }

      const connect = nango.openConnectUI({
        onEvent: (event) => {
          if (event.type === "close") {
            console.log("Nango auth modal closed");
          } else if (event.type === "connect") {
            console.log("Nango auth successful:", event);
            // Mark this authentication as completed
            setCompletedAuths((prev) => new Set([...prev, action.step]));
            setWebhookError(null);

            // Check if all authentications are now complete
            setTimeout(() => {
              if (areAllAuthsComplete()) {
                console.log(
                  "All authentications complete - ready to create agent"
                );
              }
            }, 100);
          }
        },
      });

      // Set the session token from the action
      connect.setSessionToken(action.token);
    } catch (error) {
      console.error("Error opening Nango auth:", error);
      setWebhookError(
        `Failed to open authentication for ${action.integrationDisplayName}. Please try again.`
      );
    }
  };

  // Smooth auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 100;

      // Only auto-scroll if user is near the bottom (not scrolled up)
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, isTyping]);

  // Smooth scroll to bottom when typing starts
  useEffect(() => {
    if (isTyping && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isTyping]);

  // Note: Agent creation is now manual - triggered by user when all info is collected

  // Initialize session logic - SIMPLE VERSION
  useEffect(() => {
    if (!user) return;

    const initializeSession = async () => {
      const startTime = Date.now();

      try {
        if (sessionId) {
          // Session exists - check cache first
          console.log("🔄 Loading session:", sessionId);

          // Check if we have valid cached data
          if (cacheUtils.isCacheValid(sessionId)) {
            console.log("📦 Using cached data for session:", sessionId);

            const cachedSession = cacheUtils.getSession(sessionId);
            const cachedMessages = cacheUtils.getMessages(sessionId);

            if (cachedSession && cachedMessages) {
              const convertedMessages = cachedMessages.map(convertChatMessage);

              dispatch(setMessages(convertedMessages));
              dispatch(setSessionName(cachedSession.session_name));
              dispatch(setCurrentSession(cachedSession));

              // No loading screen for cached data - instant load
              dispatch(setIsLoading(false));
              return;
            }
          }

          // Cache miss or invalid - show loading and fetch from API
          console.log(
            "🌐 Fetching fresh data from API for session:",
            sessionId
          );
          dispatch(setIsLoading(true));
          const chatMessages = await chatApi.getMessages(sessionId);
          const convertedMessages = chatMessages.map(convertChatMessage);

          // Create session object
          const session = {
            id: sessionId,
            user_id: user.id,
            session_name: `Session ${sessionId.slice(0, 8)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          dispatch(setMessages(convertedMessages));
          dispatch(setSessionName(session.session_name));
          dispatch(setCurrentSession(session));

          // Cache the fresh data
          cacheUtils.saveSession(sessionId, session);
          cacheUtils.saveMessages(sessionId, chatMessages);
        } else if (!isCreatingSession.current) {
          // No session - create one (only if not already creating)
          console.log("🆕 Creating new session");
          dispatch(setIsLoading(true));
          isCreatingSession.current = true;

          const newSession = await chatApi.createSession(
            user.id,
            "New Agent Session"
          );
          if (newSession) {
            dispatch(setCurrentSession(newSession));
            dispatch(setSessionName(newSession.session_name));
            dispatch(setMessages([]));
            navigate(`/agent/${newSession.id}`, { replace: true });
          }

          isCreatingSession.current = false;
        }
      } catch (error) {
        console.error("❌ Error:", error);
        isCreatingSession.current = false;
      } finally {
        // Minimum 2.5s loading
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 2500 - elapsed);
        setTimeout(() => dispatch(setIsLoading(false)), remaining);
      }
    };

    initializeSession();
  }, [user, sessionId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    if (!user) {
      // Redirect to buyer auth page with current page as redirect
      navigate(
        `/auth?redirect=${encodeURIComponent(
          `/agent-builder${sessionId ? `/${sessionId}` : ""}`
        )}`
      );
      return;
    }

    // Add user message to Redux
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: inputMessage,
      timestamp: new Date(),
    };

    dispatch(addMessage(userMessage));

    // Save message to database
    const savedMessage = await chatApi.saveMessage(
      currentSession.id,
      "user",
      inputMessage
    );

    // Note: Webhook call is now handled in the response section below

    // Update cache with new message
    if (savedMessage) {
      const currentMessages = messages.concat(userMessage);
      cacheUtils.saveMessages(
        currentSession.id,
        currentMessages.map((msg) => ({
          id: msg.id,
          session_id: currentSession.id,
          role: msg.role,
          content: msg.content,
          created_at: msg.timestamp.toISOString(),
        }))
      );
    }

    setInputMessage("");
    dispatch(setIsTyping(true));
    setWebhookError(null);
    setWebhookResponse(null);
    setAgentCreated(false);
    setCompletedAuths(new Set());

    // Get webhook response
    try {
      const response = await webhookUtils.sendChatData(
        currentSession.id,
        user.id,
        inputMessage,
        userMessage.timestamp,
        user.email
      );

      if (response && response.assistantResponse) {
        setWebhookResponse(response);

        // Create AI message with the response
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: response.assistantResponse,
          timestamp: new Date(),
        };

        dispatch(addMessage(aiMessage));

        // Save AI message to database (this preserves the full response)
        const savedAiMessage = await chatApi.saveMessage(
          currentSession.id,
          "assistant",
          response.assistantResponse
        );

        // Update cache with AI message
        if (savedAiMessage) {
          const currentMessages = messages.concat(userMessage, aiMessage);
          cacheUtils.saveMessages(
            currentSession.id,
            currentMessages.map((msg) => ({
              id: msg.id,
              session_id: currentSession.id,
              role: msg.role,
              content: msg.content,
              created_at: msg.timestamp.toISOString(),
            }))
          );
        }
      } else {
        // No response or invalid response - show error
        setWebhookError(
          "The agent builder is taking longer than expected to respond. Please try again."
        );

        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content:
            "I'm sorry, but I'm having trouble processing your request right now. Please try again in a moment.",
          timestamp: new Date(),
        };

        dispatch(addMessage(errorMessage));

        // Save error message to database
        await chatApi.saveMessage(
          currentSession.id,
          "assistant",
          errorMessage.content
        );
      }
    } catch (error) {
      console.error("Error getting webhook response:", error);
      setWebhookError(
        "An error occurred while processing your request. Please try again."
      );

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content:
          "I'm sorry, but an error occurred while processing your request. Please try again.",
        timestamp: new Date(),
      };

      dispatch(addMessage(errorMessage));

      // Save error message to database
      await chatApi.saveMessage(
        currentSession.id,
        "assistant",
        errorMessage.content
      );
    } finally {
      dispatch(setIsTyping(false));
    }
  };

  const handleSessionNameChange = async (newName: string) => {
    dispatch(updateSessionName(newName));

    if (currentSession) {
      const success = await chatApi.updateSessionName(
        currentSession.id,
        newName
      );

      // Update cache with new session name
      if (success) {
        const updatedSession = { ...currentSession, session_name: newName };
        cacheUtils.saveSession(currentSession.id, updatedSession);
      }
    }
  };

  // Loading state component
  if (isLoading) {
    return (
      <div
        style={{ height: "calc(100vh - 65px)" }}
        className="bg-background flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
            />
            <Sparkles className="h-8 w-8 text-primary absolute" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {sessionId ? "Loading Session" : "Creating New Session"}
            </h2>
            <p className="text-muted-foreground">
              {sessionId
                ? "Fetching your conversation history..."
                : "Setting up your AI agent workspace..."}
            </p>
          </div>

          <div className="flex space-x-1 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{ height: "calc(100vh - 65px)" }}
      className="bg-background flex flex-col"
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 group">
              <MessageCircle className="h-5 w-5" />
              <div className="relative flex-1">
                <Input
                  value={sessionName}
                  onChange={(e) => handleSessionNameChange(e.target.value)}
                  className="text-lg font-semibold border-dashed border-2 border-muted-foreground/30 hover:border-muted-foreground/50 focus:border-primary focus:border-solid bg-transparent transition-all duration-200 group-hover:border-muted-foreground/50"
                  placeholder="Enter session name..."
                />
                <Edit3 className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors duration-200" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Click above to edit your session name • Describe what you want
              your agent to do and I'll help you build it step by step.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Welcome to AI Agent Builder
                </h3>
                <p className="text-muted-foreground">
                  Tell me what kind of agent you'd like to create and I'll help
                  you build it step by step.
                </p>
              </div>
            )}
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: index * 0.1, // Stagger animation for multiple messages
                }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className="text-sm"
                  >
                    {message.content}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                    className="text-xs opacity-70 mt-1"
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-muted text-foreground rounded-lg px-4 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="text-sm"
                    >
                      AI is thinking...
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Webhook Response Steps */}
            {webhookResponse && webhookResponse.actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Agent Setup Required
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Complete the authentication steps below to set up your
                        agent
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      {agentCreated
                        ? "Agent has been created successfully! You can continue chatting or create another agent."
                        : areAllAuthsComplete()
                        ? "All authentications complete! Click 'Create Agent' below to finalize your agent setup."
                        : webhookResponse.actions.some(
                            (action) => !isSessionExpired(action.expires_at)
                          )
                        ? "Complete these authentication steps to set up your agent:"
                        : "Some authentication sessions have expired. Please send a new message to get fresh tokens:"}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-muted-foreground">
                            {
                              webhookResponse.actions.filter(
                                (action) => !isSessionExpired(action.expires_at)
                              ).length
                            }{" "}
                            Active
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-muted-foreground">
                            {
                              webhookResponse.actions.filter((action) =>
                                isSessionExpired(action.expires_at)
                              ).length
                            }{" "}
                            Expired
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-muted-foreground">
                            {completedAuths.size} Completed
                          </span>
                        </div>
                      </div>

                      {areAllAuthsComplete() && !agentCreated && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={createAgent}
                          disabled={isCreatingAgent}
                        >
                          {isCreatingAgent ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Creating Agent...
                            </>
                          ) : (
                            "Create Agent"
                          )}
                        </Button>
                      )}
                      {agentCreated && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            Agent Created Successfully!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {webhookResponse.actions.map((action, index) => (
                      <motion.div
                        key={action.step}
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.2 + index * 0.1,
                          ease: "easeOut",
                        }}
                        className={`group relative overflow-hidden rounded-lg border transition-all duration-200 ${
                          completedAuths.has(action.step)
                            ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800"
                            : isSessionExpired(action.expires_at)
                            ? "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800"
                            : "bg-muted/30 border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                  completedAuths.has(action.step)
                                    ? "bg-green-100 dark:bg-green-900"
                                    : isSessionExpired(action.expires_at)
                                    ? "bg-red-100 dark:bg-red-900"
                                    : "bg-primary/10"
                                }`}
                              >
                                <span
                                  className={`font-semibold text-sm ${
                                    completedAuths.has(action.step)
                                      ? "text-green-600 dark:text-green-400"
                                      : isSessionExpired(action.expires_at)
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-primary"
                                  }`}
                                >
                                  {action.step}
                                </span>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-foreground">
                                  {action.integrationDisplayName}
                                </h4>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    completedAuths.has(action.step)
                                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                      : isSessionExpired(action.expires_at)
                                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {completedAuths.has(action.step)
                                    ? "Completed"
                                    : isSessionExpired(action.expires_at)
                                    ? "Expired"
                                    : "Pending"}
                                </span>
                              </div>

                              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                {isSessionExpired(action.expires_at)
                                  ? `⚠️ ${action.stepMessage} (Session expired - please refresh)`
                                  : action.stepMessage}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {completedAuths.has(action.step) ? (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        Authentication completed
                                      </span>
                                    </div>
                                  ) : isSessionExpired(action.expires_at) ? (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                      <span className="text-xs text-red-600 dark:text-red-400">
                                        Session expired
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                      <span className="text-xs text-muted-foreground">
                                        Expires:{" "}
                                        {new Date(
                                          action.expires_at
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  {completedAuths.has(action.step) ? (
                                    <Button
                                      size="sm"
                                      disabled
                                      className="bg-green-600 text-white cursor-not-allowed opacity-75"
                                    >
                                      ✓ Authenticated
                                    </Button>
                                  ) : isSessionExpired(action.expires_at) ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
                                      onClick={() => {
                                        setWebhookError(
                                          `The authentication session for ${action.integrationDisplayName} has expired. Please send a new message to get fresh authentication tokens.`
                                        );
                                      }}
                                    >
                                      Refresh Session
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                      onClick={() => handleNangoAuth(action)}
                                    >
                                      Authenticate
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Error Display */}
            {webhookError && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.2, type: "spring" }}
                    className="w-5 h-5 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center"
                  >
                    <span className="text-red-600 dark:text-red-400 text-sm">
                      !
                    </span>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                    className="text-red-700 dark:text-red-300 text-sm"
                  >
                    {webhookError}
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0 border-t bg-background"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div
            className="flex space-x-2"
            animate={{ scale: isTyping ? 0.98 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              placeholder="Describe what you want your agent to do..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-h-[60px] resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
