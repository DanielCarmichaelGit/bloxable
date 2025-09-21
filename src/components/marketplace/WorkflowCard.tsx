import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Workflow } from "@/lib/api";

interface WorkflowCardProps {
  workflow: Workflow;
  index: number;
}

interface SetupTimePillProps {
  setupTime: string;
}

function SetupTimePill({ setupTime }: SetupTimePillProps) {
  const getTimeColor = (time: string) => {
    if (
      time.includes("30s") ||
      time.includes("1min") ||
      time.includes("5min")
    ) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (time.includes("1hr") || time.includes("2hr") || time.includes("4hr")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    if (
      time.includes("1day") ||
      time.includes("2day") ||
      time.includes("1week")
    ) {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    if (
      time.includes("2week") ||
      time.includes("1mo") ||
      time.includes("2mo")
    ) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Badge
      variant="outline"
      className={`text-xs px-2 py-1 ${getTimeColor(setupTime)}`}
    >
      <Clock className="h-3 w-3 mr-1" />
      {setupTime}
    </Badge>
  );
}

export default function WorkflowCard({ workflow, index }: WorkflowCardProps) {
  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price}`;
  };

  const getWorkflowCardVariants = (index: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
  });

  return (
    <motion.div
      variants={getWorkflowCardVariants(index)}
      initial="hidden"
      animate="visible"
    >
      <Card className="h-full flex flex-col border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {workflow.title}
            </CardTitle>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>4.8</span>
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {workflow.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {workflow.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {workflow.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{workflow.tags.length - 2}
                  </Badge>
                )}
              </div>
              <SetupTimePill setupTime={workflow.setupTime || "1hr"} />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>by {workflow.seller.name}</span>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold text-foreground">
                  {formatPrice(workflow.price)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button asChild className="w-full h-11 text-sm font-medium">
            <Link to={`/workflow/${workflow.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
