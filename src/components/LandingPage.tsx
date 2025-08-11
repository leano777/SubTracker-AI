import {
  Brain,
  BarChart3,
  Zap,
  Shield,
  Users,
  ChevronRight,
  Play,
  Star,
  Info,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

// import { useAuth } from "../contexts/AuthContext"; // Removed to prevent circular dependency

import { AuthModal } from "./AuthModal";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Remove useAuth dependency to prevent circular dependency
  const googleAuthAvailable = true; // Default to true, AuthModal will handle the actual state

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description:
        "Get intelligent recommendations to optimize your subscription spending and reduce costs automatically.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Visualize your spending patterns with comprehensive charts and forecasting tools.",
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description:
        "Set up intelligent rules to automatically manage renewals, cancellations, and budget alerts.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and security measures to protect your financial data.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Share and manage subscriptions with team members or family with role-based permissions.",
    },
    {
      icon: ChevronRight,
      title: "Real-time Sync",
      description: "Access your data anywhere with real-time synchronization across all devices.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Startup Founder",
      avatar: "👩‍💼",
      content:
        "SubTracker AI helped me reduce our monthly SaaS costs by 35%. The AI insights are incredibly accurate!",
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager",
      avatar: "👨‍💻",
      content:
        "The automation features are game-changing. I never miss a renewal or overpay for unused services anymore.",
    },
    {
      name: "Emily Johnson",
      role: "Finance Director",
      avatar: "👩‍💼",
      content:
        "Perfect for enterprise use. The collaboration features and security give us complete peace of mind.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SubTracker AI</span>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              >
                Beta
              </Badge>
            </div>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Google OAuth Notice */}
      {!googleAuthAvailable && (
        <div className="container mx-auto px-4 pt-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Google Sign-in Configuration Needed
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Email/password authentication is available. To enable Google sign-in, configure
                    OAuth in Supabase.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-100 shrink-0 ml-4"
                  onClick={() =>
                    window.open(
                      "https://supabase.com/docs/guides/auth/social-login/auth-google",
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Setup Guide
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            >
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Subscription Management
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Take Control of Your Subscriptions
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stop overpaying for unused subscriptions. SubTracker AI uses advanced analytics and
              automation to help you optimize costs, prevent overspend, and never miss important
              renewals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8"
                onClick={() => setShowAuthModal(true)}
              >
                Start Free Trial
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>

              <Button variant="outline" size="lg" className="h-12 px-8">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-background"></div>
                  <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-background"></div>
                  <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <span>10,000+ users</span>
              </div>
              <div className="flex items-center">
                <div className="flex mr-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Teams</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage subscriptions efficiently and reduce costs with
              AI-driven insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-background/60 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Loved by Teams Worldwide</h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their experience with SubTracker AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-background/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{testimonial.avatar}</span>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Subscriptions?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who have reduced their subscription costs by an average of 32%
              with SubTracker AI.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => setShowAuthModal(true)}
            >
              Start Your Free Trial
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-sm text-blue-100 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-background border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">SubTracker AI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 SubTracker AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
