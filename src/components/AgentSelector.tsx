import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ChevronDown,
  Plus,
  MessageSquare,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { chatApi, ChatSession } from "@/lib/supabase";

interface AgentSelectorProps {
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession | null) => void;
  onNewSession: () => void;
}

export default function AgentSelector({
  currentSession,
  onSessionSelect,
  onNewSession,
}: AgentSelectorProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadSessions();
    }
  }, [user, isOpen]);

  const loadSessions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userSessions = await chatApi.getSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    onSessionSelect(session);
    setIsOpen(false);
  };

  const handleNewSession = () => {
    onNewSession();
    setIsOpen(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;

    try {
      await chatApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // If we deleted the current session, clear it
      if (currentSession?.id === sessionId) {
        onSessionSelect(null);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Bot className="h-4 w-4" />
        <span className="hidden sm:inline">
          {currentSession ? currentSession.agent_name : "Select Agent"}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 z-50"
          >
            <Card className="shadow-lg border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Your Agents & Sessions</span>
                </CardTitle>
                <CardDescription>
                  Continue previous conversations or start new ones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* New Session Button */}
                <Button
                  variant="outline"
                  onClick={handleNewSession}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Agent
                </Button>

                {/* Sessions List */}
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Loading sessions...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No previous sessions found
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${
                          currentSession?.id === session.id ? "bg-accent" : ""
                        }`}
                        onClick={() => handleSessionSelect(session)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {session.agent_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(session.updated_at)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
