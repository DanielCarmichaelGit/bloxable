import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  Settings,
  BarChart3,
  Package,
  Star,
  Calendar,
  ArrowUpRight,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

// Mock data - in real app, this would come from API
const mockStats = {
  totalRevenue: 12450.0,
  totalSales: 156,
  activeWorkflows: 8,
  monthlyRevenue: 3240.0,
  monthlyGrowth: 12.5,
  totalViews: 2840,
  conversionRate: 5.5,
};

const mockWorkflows = [
  {
    id: 1,
    title: "Slack to Notion Integration",
    price: 29.99,
    sales: 45,
    revenue: 1349.55,
    status: "active",
    views: 320,
    rating: 4.8,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Email to Trello Automation",
    price: 19.99,
    sales: 32,
    revenue: 639.68,
    status: "active",
    views: 280,
    rating: 4.6,
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    title: "Google Sheets to Slack Reports",
    price: 39.99,
    sales: 28,
    revenue: 1119.72,
    status: "paused",
    views: 190,
    rating: 4.9,
    createdAt: "2024-02-01",
  },
  {
    id: 4,
    title: "CRM Lead Processing",
    price: 49.99,
    sales: 15,
    revenue: 749.85,
    status: "active",
    views: 150,
    rating: 4.7,
    createdAt: "2024-02-10",
  },
];

const mockRecentActivity = [
  {
    id: 1,
    type: "sale",
    workflow: "Slack to Notion Integration",
    amount: 29.99,
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    type: "view",
    workflow: "Email to Trello Automation",
    timestamp: "4 hours ago",
  },
  {
    id: 3,
    type: "sale",
    workflow: "Google Sheets to Slack Reports",
    amount: 39.99,
    timestamp: "6 hours ago",
  },
  {
    id: 4,
    type: "review",
    workflow: "CRM Lead Processing",
    rating: 5,
    timestamp: "1 day ago",
  },
];

export default function SellerDashboardNew() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredWorkflows, setFilteredWorkflows] = useState(mockWorkflows);

  useEffect(() => {
    let filtered = mockWorkflows;

    if (searchTerm) {
      filtered = filtered.filter((workflow) =>
        workflow.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (workflow) => workflow.status === statusFilter
      );
    }

    setFilteredWorkflows(filtered);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return DollarSign;
      case "view":
        return Eye;
      case "review":
        return Star;
      default:
        return Package;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Seller Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.full_name || user?.email}!
                Manage your workflows and track your earnings.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" asChild>
                <Link to="/seller/workflows">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Workflows
                </Link>
              </Button>
              <Button asChild>
                <Link to="/seller/workflows/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ${mockStats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  +{mockStats.monthlyGrowth}% this month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockStats.totalSales}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {mockStats.conversionRate}% conversion rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Workflows
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockStats.activeWorkflows}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {mockStats.totalViews} total views
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ${mockStats.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  Current month revenue
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Workflows Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle>Your Workflows</CardTitle>
                    <CardDescription>
                      Manage and track performance of your automation workflows
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search workflows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {workflow.title}
                          </h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span>${workflow.price}</span>
                          <span>{workflow.sales} sales</span>
                          <span>{workflow.views} views</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{workflow.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${workflow.revenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates on your workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="p-2 bg-accent rounded-lg">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.type === "sale" &&
                              `New sale: ${activity.workflow}`}
                            {activity.type === "view" &&
                              `New view: ${activity.workflow}`}
                            {activity.type === "review" &&
                              `New ${activity.rating}-star review: ${activity.workflow}`}
                          </p>
                          {activity.amount && (
                            <p className="text-sm text-green-600 font-medium">
                              +${activity.amount}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/seller/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/seller/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
