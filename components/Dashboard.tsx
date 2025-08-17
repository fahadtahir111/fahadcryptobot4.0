'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Brain, 
  Upload, 
  LogOut, 
  TrendingUp, 
  Target,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';
import { ChartUpload } from './ChartUpload';
import { useAuth } from '@/contexts/AuthContext';
import { 
  animateCard3D, 
  animateText, 
  animateOnScroll, 
  animateFloating,
  animatePulse,
  initializeAnimations 
} from '@/lib/animations';

export function Dashboard() {
  const { user, logout } = useAuth();
  const headerRef = useRef<HTMLElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const aiCardRef = useRef<HTMLDivElement>(null);
  const chartCardRef = useRef<HTMLDivElement>(null);
  const floatingIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize all animations
    initializeAnimations();

    // Add 3D effects to cards
    const aiCard = aiCardRef.current;
    const chartCard = chartCardRef.current;
    
    if (aiCard) {
      const cleanupAI = animateCard3D(aiCard);
      if (cleanupAI) {
        return () => cleanupAI();
      }
    }
    
    if (chartCard) {
      const cleanupChart = animateCard3D(chartCard);
      if (cleanupChart) {
        return () => cleanupChart();
      }
    }

    // Animate welcome text
    if (welcomeRef.current) {
      animateText(welcomeRef.current, 'stagger');
    }

    // Animate floating elements
    if (floatingIconRef.current) {
      animateFloating(floatingIconRef.current, 15);
    }

    // Animate specific elements on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animateOnScroll(animatedElements, 'fadeInUp');

    // Add pulse animation to AI status
    const aiStatus = document.querySelector('.ai-status');
    if (aiStatus) {
      animatePulse(aiStatus as HTMLElement, 1.1);
    }

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-green-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header ref={headerRef} className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div ref={floatingIconRef} className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CryptoBot Pro</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* AI Status */}
              <div className="ai-status flex items-center space-x-2 px-3 py-2 bg-green-500/20 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400">AI Ready</span>
              </div>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 transition-all duration-300">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user?.avatar ?? "/avatars/01.png"} 
                        alt={user?.name ?? 'User'} 
                      />
                      <AvatarFallback>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-md border-white/20" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onClick={logout} className="hover:bg-white/10 text-white">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section with Text Animation */}
          <div ref={welcomeRef} className="text-center mb-12 animate-on-scroll">
            <h2 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              Welcome to CryptoBot Pro
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Upload your cryptocurrency trading charts and get instant AI-powered analysis with professional trading signals
            </p>
          </div>

          {/* AI Capabilities Card with 3D Effect */}
          <Card ref={aiCardRef} className="trading-card mb-8 bg-black/40 backdrop-blur-md border-white/20 hover:border-purple-500/50 transition-all duration-500 animate-on-scroll">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-white">
                <div className="w-8 h-8 mr-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                AI Crypto Analysis Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-lg text-green-400">Technical Analysis</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span>Chart pattern recognition (triangles, flags, wedges)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Support and resistance level identification</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span>Trend analysis (bullish, bearish, sideways)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>Volume analysis and confirmation</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-500"></div>
                    <h4 className="font-semibold text-lg text-blue-400">Trading Signals</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span>Entry and exit price recommendations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span>Stop loss and take profit levels</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span>Risk assessment and management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span>Position sizing suggestions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Analysis Section with 3D Effect */}
          <Card ref={chartCardRef} className="trading-card bg-black/40 backdrop-blur-md border-white/20 hover:border-blue-500/50 transition-all duration-500 animate-on-scroll">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-white">
                <div className="w-8 h-8 mr-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                Chart Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartUpload />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}