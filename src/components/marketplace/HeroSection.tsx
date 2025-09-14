import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedFeatures from "./AnimatedFeatures";
import WorkflowIconsScroll from "./WorkflowIconsScroll";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-muted/20 to-background backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex items-center gap-12">
          {/* Left Side - Infinite Scrolling Icons */}
          <div className="flex-1 text-center lg:text-left max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Find Your Perfect{" "}
                <span className="text-foreground">Workflow</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Chat with our AI agent to discover workflows for your small
                team, local business, or personal projects. If we don't have it,
                connect with a builder to create it.
              </p>

              {/* AI Chat CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link to="#chat">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with AI Agent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-8"
                >
                  <Link to="#builder">
                    <Users className="mr-2 h-4 w-4" />
                    Connect with Builder
                  </Link>
                </Button>
              </div>

              {/* Animated Features */}
              <AnimatedFeatures />
            </motion.div>
          </div>

          {/* Right Side - Workflow Icons Scroll */}
          <WorkflowIconsScroll />
        </div>
      </div>
    </section>
  );
}
