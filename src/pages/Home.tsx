import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Users,
  Bot,
  Workflow,
  Settings,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const tabContent = {
    automations: {
      icon: Settings,
      title: "Automations",
      subtitle: "Extend and enhance your existing workflows",
      description:
        "Connect 400+ platforms to create powerful automations that work with your current systems and processes.",
      example:
        "New contact in CRM → send welcome email → wait 3 days → send coupon workflow",
      features: [
        "400+ platform integrations",
        "OAuth-based connections",
        "Time-based triggers",
        "Multi-step processes",
      ],
    },
    workflows: {
      icon: Workflow,
      title: "Workflows",
      subtitle: "Process data between platforms seamlessly",
      description:
        "Create input-output systems that transform and move data across your favorite platforms and tools.",
      example:
        "New lead in form → add to CRM → send welcome email → notify team",
      features: [
        "Data transformation",
        "Cross-platform integration",
        "Real-time processing",
        "Custom logic flows",
      ],
    },
    agents: {
      icon: Bot,
      title: "Agents",
      subtitle: "Set alerts and let AI handle the rest",
      description:
        "Create intelligent agents that monitor your platforms and take action when specific events occur. Perfect for personal and business use.",
      example:
        "New Instagram comment → AI analyzes sentiment → sends personalized DM to increase engagement",
      features: [
        "Smart event monitoring",
        "AI-powered responses",
        "400+ platform support",
        "Set it and forget it",
      ],
    },
  };

  const [activeTab, setActiveTab] =
    useState<keyof typeof tabContent>("automations");

  const features = [
    {
      icon: Zap,
      title: "400+ Platform Integrations",
      description:
        "Connect with social media, gaming, productivity, and business tools through simple OAuth.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with reliable automation that works when you need it most.",
    },
    {
      icon: Globe,
      title: "For Everyone",
      description:
        "Perfect for individuals, freelancers, small teams, and large enterprises.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Connect with builders and creators who understand your specific automation needs.",
    },
  ];

  const stats = [
    { value: "400+", label: "Platform Integrations" },
    { value: "10K+", label: "Active Users" },
    { value: "98%", label: "Customer Satisfaction" },
    { value: "24hr", label: "Response Time" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Automate Your{" "}
                <span className="text-foreground">Digital Life</span> & Business
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Connect 400+ platforms with simple OAuth. Set alerts, create
                workflows, and build agents that work for individuals and
                businesses alike.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link to="/marketplace">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {import.meta.env.VITE_SHOW_AI_FEATURES === "true" && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8"
                    asChild
                  >
                    <Link to="/agent">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Build Agent with AI
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Bloxable?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We make automation accessible, powerful, and profitable for
                individuals, creators, and businesses of all sizes.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-sm transition-shadow duration-200 border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-muted text-muted-foreground mb-4">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabbed Content Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Three Ways to Automate
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the right automation approach for your personal or
                business needs
              </p>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-muted rounded-lg p-1">
              {Object.entries(tabContent).map(([key, content]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as keyof typeof tabContent)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <content.icon className="h-4 w-4" />
                  <span>{content.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    {React.createElement(tabContent[activeTab].icon, {
                      className: "h-8 w-8",
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {tabContent[activeTab].title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {tabContent[activeTab].subtitle}
                  </p>
                  <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                    {tabContent[activeTab].description}
                  </p>
                </div>

                {/* Example */}
                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Example
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="flex-1 text-center">
                      {tabContent[activeTab].example}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tabContent[activeTab].features.map(
                    (feature: string, index: number) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="text-center p-4 rounded-lg bg-background/50"
                      >
                        <div className="text-sm font-medium text-foreground">
                          {feature}
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Automate Your Digital Life?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of individuals, creators, and businesses who are
                already saving time and money with Bloxable's 400+ integrations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link to="/marketplace">
                    Browse Workflows
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {import.meta.env.VITE_SHOW_AI_FEATURES === "true" && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8"
                    asChild
                  >
                    <Link to="/agent">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Build Agent with AI
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
