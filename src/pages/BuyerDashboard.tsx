import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  MessageSquare,
  Plus,
  Clock,
  Activity,
  TrendingUp,
  Zap,
  Trash2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { clearSession, setForceNewSession } from "@/store/slices/sessionSlice";
import { agentApi, chatApi, Agent, ChatSession } from "@/lib/supabase";
import { cacheUtils } from "@/lib/utils";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Clear cache when returning to dashboard
      cacheUtils.clearCache();
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [userAgents, userSessions] = await Promise.all([
        agentApi.getAgents(user.id),
        chatApi.getSessions(user.id),
      ]);
      setAgents(userAgents);
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSession = (session: ChatSession) => {
    console.log("🔄 Resuming session:", session);

    // Navigate directly to the session URL
    navigate(`/agent/${session.id}`);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;

    try {
      await chatApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!user) return;

    try {
      await agentApi.deleteAgent(agentId);
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  const handleCreateAgent = async () => {
    if (!user) return;

    try {
      const agent = await agentApi.createAgent(
        user.id,
        `Agent ${agents.length + 1}`,
        "A new AI agent"
      );
      if (agent) {
        setAgents((prev) => [agent, ...prev]);
      }
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  };

  const handleStartNewChat = () => {
    console.log("🆕 Starting new chat");
    // Clear ALL state completely and force new session
    dispatch(clearSession());
    dispatch(setForceNewSession(true));
    cacheUtils.clearCache(); // Clear cache for fresh start
    console.log("🧹 State and cache cleared completely, forcing new session");

    // Navigate immediately - AgentBuilder will create new session
    navigate("/agent");
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

  const getSessionStatus = (session: ChatSession) => {
    const now = new Date();
    const lastUpdate = new Date(session.updated_at);
    const diffInHours =
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return { label: "Active", variant: "default" as const };
    } else if (diffInHours < 24) {
      return { label: "Recent", variant: "secondary" as const };
    } else {
      return { label: "Inactive", variant: "outline" as const };
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please sign in to view your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/agent">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back,{" "}
              {user.user_metadata?.full_name || user.email?.split("@")[0]}!
            </h1>
            <p className="text-muted-foreground">
              Manage your AI agents and continue your conversations
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Agents
                </CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agents.filter((a) => a.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {agents.length} total agents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Chat Sessions
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time conversations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Activity
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    sessions.filter((s) => {
                      const diffInHours =
                        (new Date().getTime() -
                          new Date(s.updated_at).getTime()) /
                        (1000 * 60 * 60);
                      return diffInHours < 24;
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Sessions in last 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">
                  Agent completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleCreateAgent} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create New Agent
              </Button>
              <Button variant="outline" size="lg" onClick={handleStartNewChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/marketplace">
                  <Zap className="h-4 w-4 mr-2" />
                  Browse Templates
                </Link>
              </Button>
            </div>
          </div>

          {/* Active Agents */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Agents</h2>
              <Button variant="ghost" size="sm" onClick={handleCreateAgent}>
                <Plus className="h-4 w-4 mr-1" />
                New Agent
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : agents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No agents yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first AI agent to get started
                  </p>
                  <Button onClick={handleCreateAgent}>
                    Create Your First Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.slice(0, 6).map((agent) => (
                  <Card
                    key={agent.id}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-sm font-medium truncate">
                            {agent.name}
                          </CardTitle>
                        </div>
                        <Badge
                          variant={
                            agent.status === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {agent.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          className="flex-1 mr-2"
                          onClick={() => {
                            dispatch(clearSession());
                            dispatch(setForceNewSession(true));
                            navigate("/agent");
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Use Agent
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Conversations</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  dispatch(clearSession());
                  dispatch(setForceNewSession(true));
                  window.location.href = "/agent";
                }}
              >
                View All
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start a new chat session to see it here
                  </p>
                  <Button
                    onClick={() => {
                      dispatch(clearSession());
                      dispatch(setForceNewSession(true));
                      navigate("/agent");
                    }}
                  >
                    Start New Chat
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.slice(0, 6).map((session) => {
                  const status = getSessionStatus(session);
                  return (
                    <Card
                      key={session.id}
                      className="group hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium truncate">
                              {session.session_name}
                            </CardTitle>
                          </div>
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center space-x-1 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(session.updated_at)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            onClick={() => handleResumeSession(session)}
                            className="flex-1 mr-2"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Resume
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Getting Started */}
          {sessions.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="text-center py-8">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Ready to get started?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI agent and start automating your workflows
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => {
                      dispatch(clearSession());
                      dispatch(setForceNewSession(true));
                      navigate("/agent");
                    }}
                  >
                    Build Your First Agent
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/marketplace">Explore Templates</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
