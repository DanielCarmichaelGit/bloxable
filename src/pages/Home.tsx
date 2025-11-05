import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { contactApi } from "@/lib/supabase";
import {
  ArrowRight,
  Zap,
  MessageCircle,
  FileText,
  CheckCircle,
  MessageSquare,
  MapPin,
  Shield,
  Lock,
  DollarSign,
  Plug,
  Code,
  Server,
  Package,
  LayoutDashboard,
  Settings,
  Eye,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle anchor scrolling when hash changes
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, [location.hash]);

  const tabContent = {
    ocr: {
      icon: FileText,
      title: "OCR & Document Analysis",
      subtitle: "Intelligent document processing for your business",
      description:
        "Automate document processing with OCR technology, extract text from images and PDFs, and analyze documents for key information.",
      example:
        "Upload invoice → OCR extracts details → Auto-categorize expenses → Update accounting system",
      features: [
        "Multi-format support",
        "Text extraction",
        "Document classification",
        "Data extraction",
      ],
    },
    compliance: {
      icon: CheckCircle,
      title: "Record Audits & Compliance",
      subtitle: "Automated compliance and record keeping",
      description:
        "Maintain comprehensive audit trails, monitor compliance requirements, and generate reports automatically to keep your business in good standing.",
      example:
        "Transaction occurs → Auto-record in audit log → Check compliance rules → Generate compliance report",
      features: [
        "Automated record keeping",
        "Compliance monitoring",
        "Audit trail generation",
        "Report automation",
      ],
    },
    messaging: {
      icon: MessageSquare,
      title: "Customer Messaging Automation",
      subtitle: "Automate customer communications",
      description:
        "Automate customer follow-ups, send personalized messages, manage customer engagement, and improve satisfaction with intelligent messaging workflows.",
      example:
        "Customer inquiry → Auto-respond with info → Schedule follow-up → Track engagement metrics",
      features: [
        "Automated follow-ups",
        "Personalized messaging",
        "Engagement tracking",
        "Multi-channel support",
      ],
    },
  };

  const [activeTab, setActiveTab] = useState<keyof typeof tabContent>("ocr");

  const features = [
    {
      icon: FileText,
      title: "OCR & Document Analysis",
      description:
        "Automated document processing, text extraction, and intelligent document analysis for your business needs.",
    },
    {
      icon: CheckCircle,
      title: "Record Audits & Compliance",
      description:
        "Automated record keeping, compliance monitoring, and audit trail generation to keep your business compliant.",
    },
    {
      icon: MessageSquare,
      title: "Customer Messaging Automation",
      description:
        "Automate customer communications, follow-ups, and engagement to improve customer satisfaction and retention.",
    },
    {
      icon: Zap,
      title: "Hundreds of Integrations",
      description:
        "Connect with 400+ platforms through simple OAuth, reducing build time and accelerating your automation setup.",
    },
  ];

  const stats = [
    { value: "400+", label: "Platform Integrations" },
    { value: "Bespoke", label: "Custom Solutions" },
    { value: "Northern MI", label: "Currently Serving" },
    { value: "Inexpensive", label: "Affordable Pricing" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        {/* Background visual elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">
                <span className="text-brand">Custom AI Solutions</span>{" "}
                <span className="hidden sm:inline">for Local Businesses</span>
                <span className="sm:hidden">Made Simple</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                <span className="hidden sm:inline">
                  We create custom AI solutions for local companies, reducing
                  build time with hundreds of integrations. Currently serving{" "}
                  <span className="font-semibold text-foreground">
                    Northern Michigan
                  </span>
                  .
                </span>
                <span className="sm:hidden">
                  Custom AI solutions for local businesses. Serving{" "}
                  <span className="font-semibold text-foreground">
                    Northern Michigan
                  </span>
                  .
                </span>
              </p>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 hidden sm:block">
                Direct sales platform specializing in OCR, document analysis,
                record audits, compliance, customer messaging automation, and
                more.
              </p>
              <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
                <Shield className="h-5 w-5 text-brand" />
                <span className="text-sm font-medium text-muted-foreground">
                  Enterprise-grade security &amp; compliance
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-brand hover:bg-brand/90 text-brand-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById("contact");
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById("pricing");
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                >
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Right side - SVG Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg">
                <svg
                  viewBox="0 0 600 500"
                  className="w-full h-auto"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background gradient */}
                  <defs>
                    <linearGradient
                      id="gradient1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--brand))"
                        stopOpacity="0.1"
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--brand))"
                        stopOpacity="0.3"
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradient2"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--brand))"
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--brand))"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>

                  {/* Animated circles */}
                  <circle
                    cx="300"
                    cy="250"
                    r="180"
                    fill="url(#gradient1)"
                    className="animate-pulse"
                  />
                  <circle
                    cx="300"
                    cy="250"
                    r="120"
                    fill="url(#gradient2)"
                    className="animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />

                  {/* Main geometric shapes - representing AI/automation */}
                  <g transform="translate(150, 100)">
                    {/* Central node */}
                    <circle
                      cx="150"
                      cy="150"
                      r="40"
                      fill="hsl(var(--brand))"
                      opacity="0.8"
                    />
                    <circle
                      cx="150"
                      cy="150"
                      r="30"
                      fill="hsl(var(--brand-foreground))"
                    />

                    {/* Connected nodes */}
                    <circle
                      cx="50"
                      cy="80"
                      r="25"
                      fill="hsl(var(--brand))"
                      opacity="0.6"
                    />
                    <line
                      x1="150"
                      y1="150"
                      x2="50"
                      y2="80"
                      stroke="hsl(var(--brand))"
                      strokeWidth="2"
                      opacity="0.3"
                    />

                    <circle
                      cx="250"
                      cy="80"
                      r="25"
                      fill="hsl(var(--brand))"
                      opacity="0.6"
                    />
                    <line
                      x1="150"
                      y1="150"
                      x2="250"
                      y2="80"
                      stroke="hsl(var(--brand))"
                      strokeWidth="2"
                      opacity="0.3"
                    />

                    <circle
                      cx="50"
                      cy="220"
                      r="25"
                      fill="hsl(var(--brand))"
                      opacity="0.6"
                    />
                    <line
                      x1="150"
                      y1="150"
                      x2="50"
                      y2="220"
                      stroke="hsl(var(--brand))"
                      strokeWidth="2"
                      opacity="0.3"
                    />

                    <circle
                      cx="250"
                      cy="220"
                      r="25"
                      fill="hsl(var(--brand))"
                      opacity="0.6"
                    />
                    <line
                      x1="150"
                      y1="150"
                      x2="250"
                      y2="220"
                      stroke="hsl(var(--brand))"
                      strokeWidth="2"
                      opacity="0.3"
                    />

                    {/* Additional small nodes */}
                    <circle
                      cx="80"
                      cy="150"
                      r="15"
                      fill="hsl(var(--brand))"
                      opacity="0.4"
                    />
                    <line
                      x1="150"
                      y1="150"
                      x2="80"
                      y2="150"
                      stroke="hsl(var(--brand))"
                      strokeWidth="1.5"
                      opacity="0.2"
                    />

                    <circle
                      cx="220"
                      cy="150"
                      r="15"
                      fill="hsl(var(--brand))"
                      opacity="0.4"
                    />
                    <line
                      x1="150"
                      y1="150"
                      x2="220"
                      y2="150"
                      stroke="hsl(var(--brand))"
                      strokeWidth="1.5"
                      opacity="0.2"
                    />

                    {/* Data flow lines */}
                    <path
                      d="M 150 110 L 150 150 L 190 150"
                      stroke="hsl(var(--brand))"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.4"
                      strokeDasharray="5,5"
                    />
                    <path
                      d="M 110 150 L 150 150 L 150 190"
                      stroke="hsl(var(--brand))"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.4"
                      strokeDasharray="5,5"
                    />
                  </g>

                  {/* Floating particles */}
                  <circle
                    cx="100"
                    cy="100"
                    r="4"
                    fill="hsl(var(--brand))"
                    opacity="0.5"
                    className="animate-pulse"
                  />
                  <circle
                    cx="500"
                    cy="150"
                    r="5"
                    fill="hsl(var(--brand))"
                    opacity="0.4"
                    className="animate-pulse"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <circle
                    cx="450"
                    cy="350"
                    r="4"
                    fill="hsl(var(--brand))"
                    opacity="0.5"
                    className="animate-pulse"
                    style={{ animationDelay: "0.6s" }}
                  />
                  <circle
                    cx="80"
                    cy="380"
                    r="5"
                    fill="hsl(var(--brand))"
                    opacity="0.4"
                    className="animate-pulse"
                    style={{ animationDelay: "0.9s" }}
                  />
                </svg>
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
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 break-words px-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground px-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        {/* Background visual elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-brand/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-brand/5 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Why Choose Bloxable?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                <span className="hidden sm:inline">
                  We specialize in creating inexpensive, bespoke AI solutions
                  for local businesses. Every solution is tailored to solve your
                  specific business problems. Our hundreds of integrations
                  reduce build time, delivering custom solutions faster and more
                  affordably.
                </span>
                <span className="sm:hidden">
                  Custom AI solutions tailored to your business. Hundreds of
                  integrations for faster, more affordable delivery.
                </span>
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

      {/* Integrations Section */}
      <section
        id="integrations"
        className="py-20 border-t bg-muted/30 relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--brand)) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 text-brand mb-4">
                <Plug className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                400+ Platform Integrations
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
                Connect with the tools your business already uses.
              </p>
              <p className="text-base text-brand font-semibold max-w-2xl mx-auto">
                Can't find your service? We can integrate with any service
                provider important to your business.
              </p>
            </motion.div>
          </div>

          {/* Company Logos Grid */}
          <div className="mb-12">
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {[
                "Salesforce",
                "HubSpot",
                "QuickBooks",
                "Stripe",
                "Slack",
                "Google",
                "Microsoft",
                "Shopify",
                "Mailchimp",
                "Xero",
                "Square",
                "Dropbox",
                "Notion",
                "Zapier",
                "Pipedrive",
                "PayPal",
              ].map((company) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center h-20 bg-background rounded-lg border-2 border-border/50 hover:border-brand hover:shadow-md transition-all group"
                >
                  <span className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
                    {company}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Integration Categories - Simplified */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {[
              {
                category: "CRM & Sales",
                examples: ["Salesforce", "HubSpot", "Pipedrive"],
                showOnMobile: true,
              },
              {
                category: "Accounting",
                examples: ["QuickBooks", "Xero", "FreshBooks"],
                showOnMobile: true,
              },
              {
                category: "Communication",
                examples: ["Slack", "Microsoft Teams", "Email"],
                showOnMobile: true,
              },
              {
                category: "Productivity",
                examples: ["Google Workspace", "Microsoft 365", "Notion"],
                showOnMobile: true,
              },
              {
                category: "Payment Processing",
                examples: ["Stripe", "PayPal", "Square"],
                showOnMobile: false,
              },
              {
                category: "Cloud Storage",
                examples: ["Google Drive", "Dropbox", "OneDrive"],
                showOnMobile: false,
              },
              {
                category: "Marketing",
                examples: ["Mailchimp", "SendGrid", "Meta Ads"],
                showOnMobile: false,
              },
              {
                category: "E-commerce",
                examples: ["Shopify", "WooCommerce", "Amazon"],
                showOnMobile: false,
              },
            ].map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className={category.showOnMobile ? "" : "hidden md:block"}
              >
                <Card className="h-full border border-border/50 hover:border-brand/50 transition-colors">
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-foreground mb-2 text-xs">
                      {category.category}
                    </h3>
                    <ul className="space-y-0.5">
                      {category.examples.map((example) => (
                        <li
                          key={example}
                          className="text-xs text-muted-foreground"
                        >
                          {example}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 border-t relative">
        {/* Background visual elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 text-brand mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Secure & Compliant
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                <span className="hidden sm:inline">
                  Your data security is our top priority. We implement
                  enterprise-grade security measures to protect your business
                  information.
                </span>
                <span className="sm:hidden">
                  Enterprise-grade security measures to protect your business
                  information.
                </span>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  description:
                    "Bank-level encryption, secure OAuth connections, and regular security audits to protect your data.",
                },
                {
                  icon: Lock,
                  title: "Data Compliance",
                  description:
                    "Compliant with industry standards and regulations. Your data is handled with the utmost care and privacy.",
                },
                {
                  icon: CheckCircle,
                  title: "Reliable Infrastructure",
                  description:
                    "Hosted on secure, scalable infrastructure with 99.9% uptime guarantee and automated backups.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-sm">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brand/10 text-brand mb-4">
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
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 border-t bg-muted/30 relative overflow-hidden"
      >
        {/* Background visual elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 text-brand mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Simple, Competitive Pricing
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 sm:mb-4 px-4">
                <span className="hidden sm:inline">
                  Transparent pricing that's a fraction of the market rate. Most
                  AI development projects cost $50K-$150K for setup and tens of
                  thousands of dollars monthly. We deliver custom solutions with
                  flexible pricing that scales with your needs.
                </span>
                <span className="sm:hidden">
                  Transparent pricing that's a fraction of the market rate.
                  Flexible pricing that scales with your needs.
                </span>
              </p>
              <p className="text-sm sm:text-base text-brand font-semibold px-4">
                Starting costs shown below • Prices scale based on project
                complexity • No hidden fees
              </p>
            </motion.div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Development Costs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="h-full border-2 border-brand/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brand/10 text-brand">
                        <Code className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        Development Costs
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground mb-1">
                          Starting at $600/week
                        </p>
                        <p className="text-sm text-muted-foreground">
                          During active development phase
                        </p>
                        <p className="text-xs text-brand font-medium mt-2">
                          *Costs increase based on project complexity and
                          requirements
                        </p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-foreground mb-2">
                          How Development Costs Scale:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                            <span>
                              <strong className="text-foreground">
                                Starting point:
                              </strong>{" "}
                              $600/week for standard development
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                            <span>
                              <strong className="text-foreground">
                                Complex features:
                              </strong>{" "}
                              Additional costs based on scope and technical
                              requirements
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                            <span>
                              Pricing is transparent and discussed upfront
                              before work begins
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Ongoing Costs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="h-full border-2 border-brand/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brand/10 text-brand">
                        <Server className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        Ongoing Costs
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">
                              1. Compute Costs
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Pass-through pricing. If your solution costs
                            $400/month in tokens, you pay $400. Any cost savings
                            we see, you see.{" "}
                            <strong className="text-foreground">
                              No markup.
                            </strong>
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">
                              2. Monthly Service
                            </span>
                            <span className="text-lg font-bold text-brand">
                              <span className="text-sm sm:text-lg">
                                Starting at{" "}
                              </span>
                              $300/month
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Base rate for hosting and maintaining your solution.
                            <span className="text-brand font-medium">
                              {" "}
                              Scales with usage and features.
                            </span>
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">
                              3. Additional Modules
                            </span>
                            <span className="text-lg font-bold text-brand">
                              $150/month
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Each new module requires development time (starting
                            at $600/week) during creation, then additional
                            monthly fees based on complexity.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Pricing Example */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 border-brand/30 bg-brand/5">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Package className="h-6 w-6 text-brand" />
                    <h3 className="text-xl font-bold text-foreground">
                      Example Pricing Scenario
                    </h3>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-foreground mb-2">
                          Initial Setup:
                        </p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>
                            • Simple OCR solution:{" "}
                            <strong className="text-foreground">
                              Starting at $600
                            </strong>{" "}
                            (1 week dev)
                          </li>
                          <li>
                            • Monthly service:{" "}
                            <strong className="text-foreground">
                              <span className="text-xs sm:text-sm">
                                Starting at{" "}
                              </span>
                              $300/month
                            </strong>
                          </li>
                          <li>
                            • Compute (example):{" "}
                            <strong className="text-foreground">
                              $200/month
                            </strong>
                          </li>
                        </ul>
                        <p className="mt-3 font-semibold text-foreground">
                          Starting Total:{" "}
                          <span className="text-brand">$500/month</span> after
                          setup (scales with needs)
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-2">
                          Adding a Module:
                        </p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>
                            • Compliance module dev:{" "}
                            <strong className="text-foreground">$1,600</strong>{" "}
                            (2 weeks)
                          </li>
                          <li>
                            • Additional module fee:{" "}
                            <strong className="text-foreground">
                              $150/month
                            </strong>
                          </li>
                        </ul>
                        <p className="mt-3 font-semibold text-foreground">
                          New Total:{" "}
                          <span className="text-brand">$650/month</span> +
                          compute
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Compare:</strong>{" "}
                        Traditional AI development costs $50,000-$150,000+ for
                        similar solutions. We deliver custom, production-ready
                        solutions at a fraction of the cost.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is a Module Section */}
      <section className="py-20 border-t relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 text-brand mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What is a Module?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A module is an additional feature or capability that extends
                your initial solution. Think of it as adding new functionality
                to your existing system.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 border-brand/20">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Example: Document Processing System
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                          <h4 className="font-semibold text-foreground mb-2">
                            Initial Solution (SOW)
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            A system that extracts fields from home insurance
                            documents before allowing a mortgage to be signed.
                            This initial solution processes documents, validates
                            required fields, and ensures all necessary
                            information is present before proceeding with the
                            mortgage signing process.
                          </p>
                        </div>

                        <div className="flex items-center justify-center py-2">
                          <ArrowRight className="h-6 w-6 text-brand rotate-90" />
                        </div>

                        <div className="bg-brand/5 rounded-lg p-4 border-2 border-brand/20">
                          <h4 className="font-semibold text-foreground mb-2">
                            Additional Module Example
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            After the initial solution is deployed, you might
                            want to add a chatbot module. This chatbot allows
                            users to communicate and fill in fields they
                            accidentally left out during document signing. The
                            chatbot can:
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                            <li>Guide users through missing information</li>
                            <li>Answer questions about required fields</li>
                            <li>Help complete documents interactively</li>
                            <li>Reduce errors and improve user experience</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        How Modules Work
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">
                            Initial Development
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Each module requires development time (starting at
                            $600/week) during creation. The complexity and scope
                            determine the exact development cost.
                          </p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">
                            Ongoing Costs
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            After launch, modules have additional monthly fees
                            based on their complexity, usage, and resource
                            requirements. This covers hosting, maintenance, and
                            updates.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Key Point:</strong>{" "}
                        Modules are flexible additions that expand your
                        solution's capabilities. You can add them at any time
                        based on your evolving business needs. Each module
                        integrates seamlessly with your existing system.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Showcase Section */}
      <section className="py-20 border-t bg-muted/30 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(45deg, transparent 25%, hsl(var(--brand)) 25%, hsl(var(--brand)) 50%, transparent 50%, transparent 75%, hsl(var(--brand)) 75%, hsl(var(--brand)))`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 text-brand mb-4">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Business Dashboard
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Monitor costs, view executions, and manage your bespoke AI
                solution—all in one simple, intuitive dashboard.
              </p>
            </motion.div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Cost Tracking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="h-full border-2 border-brand/20 hover:border-brand/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brand/10 text-brand">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Cost Tracking
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      See exactly what you're spending with transparent,
                      real-time cost breakdowns.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Monthly Service
                        </span>
                        <span className="font-semibold text-foreground">
                          $300
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Compute Costs
                        </span>
                        <span className="font-semibold text-foreground">
                          $200
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Modules</span>
                        <span className="font-semibold text-foreground">
                          $150
                        </span>
                      </div>
                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          Total
                        </span>
                        <span className="text-sm font-bold text-brand">
                          $650/mo
                        </span>
                      </div>
                    </div>
                    {/* Visual chart placeholder */}
                    <div className="mt-4 h-20 bg-muted rounded-md flex items-end justify-around gap-1 p-2">
                      {[0.6, 0.8, 0.4, 0.9, 0.7, 0.5].map((height, index) => (
                        <div
                          key={`chart-bar-${height}-${index}`}
                          className="flex-1 bg-brand rounded-t"
                          style={{ height: `${height * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Execution Records */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="h-full border-2 border-brand/20 hover:border-brand/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brand/10 text-brand">
                        <Eye className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Execution Records
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      View all executions, track performance, and monitor your
                      solution's activity in real-time.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-muted-foreground">
                            OCR Processing
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          2m ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-muted-foreground">
                            Document Analysis
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          15m ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-muted-foreground">
                            Compliance Check
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          1h ago
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>1,247 executions this month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Configuration Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="h-full border-2 border-brand/20 hover:border-brand/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brand/10 text-brand">
                        <Settings className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Configuration
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Easily modify settings, update integrations, and customize
                      your solution without code.
                    </p>
                    <div className="space-y-2">
                      <div className="p-2 rounded-md bg-muted/50 border border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">
                            OCR Module
                          </span>
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Configured
                        </span>
                      </div>
                      <div className="p-2 rounded-md bg-muted/50 border border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">
                            Compliance Module
                          </span>
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Configured
                        </span>
                      </div>
                      <div className="p-2 rounded-md bg-muted/50 border border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">
                            Messaging Module
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Inactive
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Not configured
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Dashboard Visual Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8"
            >
              <Card className="border-2 border-brand/20 bg-background overflow-hidden shadow-xl">
                <CardContent className="p-0">
                  {/* Dashboard mockup header */}
                  <div className="bg-muted/50 border-b p-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="flex-1"></div>
                    <div className="text-xs text-muted-foreground font-medium">
                      dashboard.bloxable.io
                    </div>
                  </div>

                  {/* Dashboard mockup content */}
                  <div className="p-3 sm:p-4 lg:p-6 bg-background overflow-x-auto">
                    {/* Header section */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1">
                        Acme INC
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Dashboard Overview • Last updated 2 minutes ago
                      </p>
                    </div>

                    {/* Stats cards row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      {/* Cost Card */}
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 lg:p-4 border border-border/50">
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">
                          Monthly Cost
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-brand mb-0.5 sm:mb-1">
                          $650
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          +$50 from last month
                        </div>
                      </div>

                      {/* Executions Card */}
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 lg:p-4 border border-border/50">
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">
                          Executions
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-brand mb-0.5 sm:mb-1">
                          1,247
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          This month
                        </div>
                      </div>

                      {/* Modules Card */}
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 lg:p-4 border border-border/50">
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">
                          Active Modules
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-brand mb-0.5 sm:mb-1">
                          2
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          of 3 configured
                        </div>
                      </div>
                    </div>

                    {/* Main content area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left: Cost breakdown */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Cost chart */}
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
                          <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">
                            Cost Breakdown (Last 7 Days)
                          </h4>
                          <div className="relative">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 h-32 sm:h-40 flex flex-col justify-between text-[10px] sm:text-xs text-muted-foreground pr-1 sm:pr-2">
                              <span>$350</span>
                              <span>$262</span>
                              <span>$175</span>
                              <span>$87</span>
                              <span>$0</span>
                            </div>
                            {/* Chart area */}
                            <div className="h-32 sm:h-40 flex items-end justify-between gap-1 sm:gap-2 ml-8 sm:ml-10">
                              {[
                                { day: "Mon", value: 185 },
                                { day: "Tue", value: 245 },
                                { day: "Wed", value: 220 },
                                { day: "Thu", value: 295 },
                                { day: "Fri", value: 265 },
                                { day: "Sat", value: 210 },
                                { day: "Sun", value: 180 },
                              ].map((item) => {
                                // Increase max value to prevent overflow, add padding for top value
                                const maxValue = 350;
                                // Use a conservative height that works for both mobile and desktop
                                // The container uses h-32 sm:h-40, so we use 128px (mobile) as base
                                // This ensures it works on mobile and scales up on larger screens via CSS
                                const containerHeight = 128;
                                // Add 10px padding at top to prevent overflow
                                const usableHeight = containerHeight - 10;
                                const barHeight = Math.max(
                                  (item.value / maxValue) * usableHeight,
                                  4
                                );
                                return (
                                  <div
                                    key={`chart-${item.day}`}
                                    className="flex-1 flex flex-col items-center justify-end gap-1 relative"
                                  >
                                    <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-medium text-foreground whitespace-nowrap">
                                      ${item.value}
                                    </div>
                                    <div
                                      className="w-full bg-brand/30 rounded-t border border-brand/50"
                                      style={{ height: `${barHeight}px` }}
                                    ></div>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                      {item.day}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-4 flex flex-wrap gap-3 sm:gap-6 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-brand/30 border border-brand/50"></div>
                              <span className="text-muted-foreground">
                                Compute
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-muted"></div>
                              <span className="text-muted-foreground">
                                Service
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-muted/50"></div>
                              <span className="text-muted-foreground">
                                Modules
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Recent executions table */}
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                          <h4 className="text-sm font-semibold text-foreground mb-4">
                            Recent Executions
                          </h4>
                          <div className="space-y-2">
                            {[
                              { task: "OCR Processing", time: "2m ago" },
                              { task: "Document Analysis", time: "15m ago" },
                              { task: "Compliance Check", time: "1h ago" },
                              { task: "Invoice Processing", time: "2h ago" },
                            ].map((exec) => (
                              <div
                                key={`exec-${exec.task}`}
                                className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-foreground flex-1">
                                  {exec.task}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {exec.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Module status */}
                      <div className="space-y-4">
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                          <h4 className="text-sm font-semibold text-foreground mb-4">
                            Module Status
                          </h4>
                          <div className="space-y-3">
                            {[
                              { name: "OCR", status: true, cost: "$150/mo" },
                              {
                                name: "Compliance",
                                status: true,
                                cost: "$150/mo",
                              },
                              {
                                name: "Messaging",
                                status: false,
                                cost: "Not active",
                              },
                            ].map((module) => (
                              <div
                                key={`module-${module.name}`}
                                className="flex items-center justify-between p-2 bg-background rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      module.status
                                        ? "bg-green-500"
                                        : "bg-muted-foreground"
                                    }`}
                                  ></div>
                                  <span className="text-sm text-foreground">
                                    {module.name}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {module.cost}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                          <h4 className="text-sm font-semibold text-foreground mb-4">
                            Quick Actions
                          </h4>
                          <div className="space-y-2">
                            <button className="w-full h-8 bg-brand/10 rounded border border-brand/20 text-xs font-medium text-brand hover:bg-brand/20 transition-colors">
                              Configure Module
                            </button>
                            <button className="w-full h-8 bg-muted rounded text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
                              View Reports
                            </button>
                            <button className="w-full h-8 bg-muted rounded text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
                              Export Data
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabbed Content Section */}
      <section id="solutions" className="py-20 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Solutions
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Bespoke AI solutions designed specifically for your business
                problems. Each solution is custom-built to address the unique
                challenges you face.
              </p>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 sm:mb-12 px-4">
            <div className="inline-flex bg-muted rounded-lg p-1 overflow-x-auto w-full sm:w-auto justify-center">
              <div className="flex gap-1">
                {Object.entries(tabContent).map(([key, content]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as keyof typeof tabContent)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <content.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{content.title}</span>
                    <span className="sm:hidden">
                      {content.title.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
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
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                    {React.createElement(tabContent[activeTab].icon, {
                      className: "h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8",
                    })}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    {tabContent[activeTab].title}
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                    {tabContent[activeTab].subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                    {tabContent[activeTab].description}
                  </p>
                </div>

                {/* Example */}
                <div className="bg-muted/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 uppercase tracking-wide">
                    Example
                  </h4>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex-1 text-center">
                      {tabContent[activeTab].example}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  {tabContent[activeTab].features.map(
                    (feature: string, index: number) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="text-center p-2 sm:p-3 lg:p-4 rounded-lg bg-background/50"
                      >
                        <div className="text-xs sm:text-sm font-medium text-foreground">
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

      {/* Contact Form Section */}
      <section id="contact" className="py-20 border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 text-brand mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get in Touch
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                Ready to transform your local business? Let's discuss your
                bespoke AI solution needs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 border-brand/20">
                <CardContent className="p-8">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSubmitting(true);
                      setSubmitStatus({ type: null, message: "" });

                      const formData = new FormData(e.currentTarget);
                      const name = formData.get("name") as string;
                      const email = formData.get("email") as string;
                      let phone = formData.get("phone") as string;
                      const company_name = formData.get("company") as string;
                      const message = formData.get("message") as string;

                      // Format phone number with +1 prefix
                      phone = phone.replace(/\D/g, ""); // Remove all non-digits
                      if (phone) {
                        if (phone.startsWith("1") && phone.length === 11) {
                          phone = `+${phone}`;
                        } else {
                          phone = `+1${phone}`;
                        }
                      }

                      try {
                        const submission = await contactApi.submitContactForm({
                          name,
                          email,
                          phone,
                          company_name,
                          message,
                        });

                        if (submission) {
                          setSubmitStatus({
                            type: "success",
                            message:
                              "Thank you for your interest! We'll be in touch soon.",
                          });
                          // Don't clear form - just show success message
                        } else {
                          throw new Error(
                            "Failed to submit contact form. Please try again."
                          );
                        }
                      } catch (error: any) {
                        console.error("Error submitting contact form:", error);
                        setSubmitStatus({
                          type: "error",
                          message:
                            error.message ||
                            "Failed to send message. Please try again later.",
                        });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your name"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            +1
                          </span>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            pattern="^\(?\d{3}\)?\s?\d{3}-?\d{4}$"
                            className="pl-10"
                            required
                            disabled={isSubmitting}
                            onInput={(e) => {
                              // Format phone number as user types
                              const input = e.currentTarget;
                              let value = input.value.replace(/\D/g, "");
                              if (value.length > 10) value = value.slice(0, 10);

                              if (value.length > 6) {
                                value = `(${value.slice(0, 3)}) ${value.slice(
                                  3,
                                  6
                                )}-${value.slice(6)}`;
                              } else if (value.length > 3) {
                                value = `(${value.slice(0, 3)}) ${value.slice(
                                  3
                                )}`;
                              } else if (value.length > 0) {
                                value = `(${value}`;
                              }

                              input.value = value;
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          placeholder="Your company name"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your business needs and how we can help..."
                        rows={6}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    {submitStatus.type && (
                      <div
                        className={`p-4 rounded-md ${
                          submitStatus.type === "success"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                        }`}
                      >
                        <p className="text-sm font-medium">
                          {submitStatus.message}
                        </p>
                      </div>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-2">Sending...</span>
                          <div className="h-4 w-4 border-2 border-brand-foreground border-t-transparent rounded-full animate-spin"></div>
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      We typically respond within 24 hours. Serving Northern
                      Michigan businesses.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
              <div className="flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5 text-brand mr-2" />
                <span className="text-sm font-semibold text-brand">
                  Currently Serving Northern Michigan
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Transform Your Local Business?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Get an inexpensive, bespoke AI solution tailored to solve your
                specific business problems. Our hundreds of integrations reduce
                build time, delivering custom solutions faster and more
                affordably than traditional development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-brand hover:bg-brand/90 text-brand-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById("contact");
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById("pricing");
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                >
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
