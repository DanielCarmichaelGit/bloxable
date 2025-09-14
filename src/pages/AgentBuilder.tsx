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
import AuthModal from "@/components/auth/AuthModal";
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

export default function AgentBuilder() {
  const { user, showAuthModal, setShowAuthModal } = useAuth();
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { currentSession, messages, sessionName, isLoading, isTyping } =
    useAppSelector((state) => state.session);

  // Local state
  const [inputMessage, setInputMessage] = useState("");
  const isCreatingSession = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Convert ChatMessage to Message format
  const convertChatMessage = (chatMessage: ChatMessage) => ({
    id: chatMessage.id,
    role: chatMessage.role,
    content: chatMessage.content,
    timestamp: new Date(chatMessage.created_at),
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
      setShowAuthModal(true);
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

    // Send chat data to webhook
    if (savedMessage && user) {
      webhookUtils.sendChatData(
        currentSession.id,
        user.id,
        inputMessage,
        userMessage.timestamp
      );
    }

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

    // Simulate AI response
    setTimeout(async () => {
      const aiResponse =
        "I understand you want to create an AI agent. Let me help you build something amazing! What specific task would you like your agent to handle?";

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date(),
      };

      dispatch(addMessage(aiMessage));

      // Save AI message to database
      const savedAiMessage = await chatApi.saveMessage(
        currentSession.id,
        "assistant",
        aiResponse
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

      dispatch(setIsTyping(false));
    }, 1500);
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
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 border-t bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2">
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
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In to Build Agents"
        description="Please sign in to create and manage your AI agents."
      />
    </div>
  );
}
