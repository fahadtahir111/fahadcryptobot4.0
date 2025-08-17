'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Shield, 
  Zap, 
  BarChart3,
  ArrowRight,
  Star,
  Users,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  animateCard3D, 
  animateText, 
  animateOnScroll, 
  animateFloating,
  animatePulse,
  animateMorphingBackground 
} from '@/lib/animations';

export function LandingPage() {
  const { login } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize animations
    if (heroRef.current) {
      animateText(heroRef.current, 'stagger');
    }

    // Animate floating elements
    if (floatingIconRef.current) {
      animateFloating(floatingIconRef.current, 20);
    }

    // Animate on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animateOnScroll(animatedElements, 'fadeInUp');

    // Add 3D effects to cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card) => {
      animateCard3D(card as HTMLElement);
    });

    // Animate morphing background
    const backgroundElement = document.querySelector('.morphing-bg');
    if (backgroundElement) {
      animateMorphingBackground(backgroundElement as HTMLElement);
    }

    // Add pulse animation to stats
    const statElements = document.querySelectorAll('.stat-item');
    statElements.forEach((stat, index) => {
      animatePulse(stat as HTMLElement, 1.05 + (index * 0.02));
    });

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="morphing-bg absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-36 h-36 bg-green-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div ref={heroRef} className="space-y-8 animate-on-scroll">
            <div ref={floatingIconRef} className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Zap className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              CryptoBot Pro
              </span>
            </h1>
            
            <p className="text-5xl md:text-5xl lg:text-5xl text-muted-foreground max-w-5xl mx-auto leading-relaxed">
              Advanced AI-powered cryptocurrency chart analysis with professional trading signals. 
              Get instant insights from GPT-5 technology.
            </p> */}
            
            {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
              <Button 
                onClick={() => login('demo@example.com', 'demo123')}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 text-xl px-10 py-6"
              >
                Get Started Free
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 transition-all duration-300 text-xl px-10 py-6"
              >
                Watch Demo
              </Button>
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto">
              Experience the future of crypto trading with our cutting-edge AI analysis platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature Card 1 */}
            <Card className="feature-card bg-black/40 backdrop-blur-md border-white/20 hover:border-purple-500/50 transition-all duration-500 animate-on-scroll">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-white">GPT-5 AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Advanced AI technology analyzes your charts with human-like precision, 
                  identifying patterns and trends you might miss.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card className="feature-card bg-black/40 backdrop-blur-md border-white/20 hover:border-blue-500/50 transition-all duration-500 animate-on-scroll">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-white">Trading Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Get precise entry/exit points, stop-loss levels, and risk management 
                  recommendations for every trade.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card className="feature-card bg-black/40 backdrop-blur-md border-white/20 hover:border-green-500/50 transition-all duration-500 animate-on-scroll">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-white">Technical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Comprehensive analysis including support/resistance levels, 
                  volume analysis, and technical indicators.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 4 */}
            <Card className="feature-card bg-black/40 backdrop-blur-md border-white/20 hover:border-pink-500/50 transition-all duration-500 animate-on-scroll">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-white">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Advanced risk assessment and position sizing recommendations 
                  to protect your capital and maximize returns.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 5 */}
            <Card className="feature-card bg-black/40 backdrop-blur-md border-white/20 hover:border-orange-500/50 transition-all duration-500 animate-on-scroll">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-white">Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Deep market context analysis including market cycles, 
                  institutional activity, and macro trends.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 6 */}
            <Card className="feature-card bg-black/40 backdrop-blur-md border-white/20 hover:border-cyan-500/50 transition-all duration-500 animate-on-scroll">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-white">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Get instant analysis results in seconds. No waiting, 
                  no delays - just pure speed and accuracy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="relative z-10 py-24 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="stat-item text-center animate-on-scroll">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-3">99.8%</div>
              <div className="text-xl text-muted-foreground">Accuracy Rate</div>
            </div>

            <div className="stat-item text-center animate-on-scroll">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-3">50K+</div>
              <div className="text-xl text-muted-foreground">Active Traders</div>
            </div>

            <div className="stat-item text-center animate-on-scroll">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-3">2.3s</div>
              <div className="text-xl text-muted-foreground">Average Response</div>
            </div>

            <div className="stat-item text-center animate-on-scroll">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-3">$2.1B</div>
              <div className="text-xl text-muted-foreground">Trading Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative z-10 py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto animate-on-scroll">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-10 leading-relaxed">
              Join thousands of successful traders who are already using CryptoBot Pro 
              to make smarter, more profitable trading decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                onClick={() => login('demo@example.com', 'demo123')}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 text-xl px-12 py-6"
              >
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 transition-all duration-300 text-xl px-12 py-6"
              >
                Learn More
              </Button>
            </div>

            <div className="mt-10 text-lg text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}