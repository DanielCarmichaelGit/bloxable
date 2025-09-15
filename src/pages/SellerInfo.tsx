import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Users,
  Shield,
  Zap,
  TrendingUp,
  Headphones,
  CheckCircle,
  ArrowRight,
  Clock,
  Settings,
  BarChart3,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SellerInfo() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Low Commission Rates",
      description:
        "Only 3% on one-time purchases, 1% on recurring subscriptions",
    },
    {
      icon: Users,
      title: "Global Marketplace",
      description: "Reach customers worldwide with your automation workflows",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Built-in security and payment processing handled for you",
    },
    {
      icon: Zap,
      title: "Easy Publishing",
      description: "Publish workflows in minutes with our simple tools",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Track performance and optimize your offerings",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated support team to help you succeed",
    },
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Seller Dashboard",
      description:
        "Complete analytics and management tools for your automation business",
      items: [
        "Real-time sales and income tracking",
        "Customer analytics and insights",
        "Workflow performance metrics",
        "Revenue forecasting and trends",
        "Customer support ticket management",
        "Downloadable reports and exports",
      ],
    },
    {
      icon: Package,
      title: "Marketplace & Pricing",
      description:
        "Flexible pricing models and marketplace visibility for maximum revenue",
      items: [
        "Marketplace listing on Bloxable platform",
        "Usage-based pricing for recurring subscriptions",
        "One-time purchase options",
        "Custom pricing tiers and packages",
        "Automated invoice generation for clients",
        "Payment processing and collection",
      ],
    },
    {
      icon: Settings,
      title: "Seller Account & Support",
      description:
        "Dedicated seller account and comprehensive support resources",
      items: [
        "Public seller profile page to share with customers",
        "Branded seller dashboard and tools",
        "Dedicated seller support team",
        "Marketing and promotion assistance",
        "Technical documentation and guides",
        "Regular seller community events",
      ],
    },
  ];

  const stats = [
    { value: "500+", label: "Active Sellers" },
    { value: "$2M+", label: "Total Revenue" },
    { value: "10K+", label: "Workflows Sold" },
    { value: "50+", label: "Countries" },
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
                Turn Your{" "}
                <span className="text-foreground">Automation Skills</span> Into
                Income
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Create, sell, and monetize automation workflows on the world's
                leading no-code platform. Start earning from day one.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link to="/seller/auth">
                    Start Selling Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Learn More
                </Button>
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

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Sell on Bloxable?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the most successful automation marketplace and start
                earning from your technical expertise
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-sm transition-shadow duration-200 border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-muted text-muted-foreground mb-4">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From creation to customer support, we provide all the tools and
                resources you need
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-muted text-muted-foreground">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start space-x-3"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {item}
                          </span>
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
                Ready to Start Earning?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of successful sellers and start monetizing your
                automation skills today. No upfront costs, no monthly fees.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link to="/seller/auth">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8">
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
