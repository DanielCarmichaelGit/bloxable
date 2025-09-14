import { motion } from "framer-motion";
import { MessageCircle, Users, Zap } from "lucide-react";

export default function AnimatedFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto lg:mx-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-muted/50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">Small Teams</p>
          <p className="text-xs text-muted-foreground">Perfect for startups</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-muted/50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">Local Business</p>
          <p className="text-xs text-muted-foreground">Built for SMBs</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-muted/50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">Personal Use</p>
          <p className="text-xs text-muted-foreground">Individual projects</p>
        </div>
      </motion.div>
    </div>
  );
}
