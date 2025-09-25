'use client';

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
import { AnalysisHistory } from './AnalysisHistory';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="relative z-10 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                <span className="text-lg md:text-xl font-bold text-white">SignalX</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* AI Status */}
              <div className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-2 bg-green-500/20 rounded-full border border-green-500/30">
                <div className="status-online"></div>
                <span className="text-xs md:text-sm text-green-400">AI Ready</span>
              </div>
              {/* User Credits */}
              {user && (
                <div className="px-2 md:px-3 py-1 md:py-2 rounded-full border border-white/20 bg-white/10">
                  <span className="text-xs md:text-sm font-semibold text-white">
                    {Math.max(0, Number(user.credits ?? 0))}
                  </span>
                  <span className="text-xs md:text-sm text-white/70 ml-1">credits</span>
                </div>
              )}
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-white/10 transition-all duration-300">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user?.name ?? 'User'} />
                      ) : (
                        <AvatarFallback>
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/95 backdrop-blur-md border-white/10" align="end" forceMount>
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

      <div className="container mx-auto px-4 py-4 md:py-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 professional-heading">
                  Welcome to SignalX
                </h2>
            <p className="text-sm md:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto professional-text">
              Professional AI-powered cryptocurrency trading analysis platform powered by Gemini 2.5 Flash
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
            <div className="clean-card p-4 md:p-6 text-center hover-lift animate-fade-in-up animate-delay-100">
              <div className="text-lg md:text-2xl font-bold text-white mb-2 professional-heading">24/7</div>
              <div className="text-xs md:text-sm text-gray-400 professional-text">AI Analysis</div>
            </div>
            <div className="clean-card p-4 md:p-6 text-center hover-lift animate-fade-in-up animate-delay-200">
              <div className="text-lg md:text-2xl font-bold text-white mb-2 professional-heading">99.8%</div>
              <div className="text-xs md:text-sm text-gray-400 professional-text">Accuracy</div>
            </div>
            <div className="clean-card p-4 md:p-6 text-center hover-lift animate-fade-in-up animate-delay-300">
              <div className="text-lg md:text-2xl font-bold text-white mb-2 professional-heading">2.3s</div>
              <div className="text-xs md:text-sm text-gray-400 professional-text">Response Time</div>
            </div>
            <div className="clean-card p-4 md:p-6 text-center hover-lift animate-fade-in-up animate-delay-400">
              <div className="text-lg md:text-2xl font-bold text-white mb-2 professional-heading">50K+</div>
              <div className="text-xs md:text-sm text-gray-400 professional-text">Active Users</div>
            </div>
          </div>

          {/* AI Capabilities Card */}
          <Card className="clean-card mb-6 md:mb-8 hover-lift animate-fade-in-up animate-delay-200">
            <CardHeader>
              <CardTitle className="flex items-center text-xl md:text-2xl text-white professional-heading">
                <div className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4 bg-white rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                <span className="text-sm md:text-base">AI Crypto Analysis Capabilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="status-online"></div>
                    <h4 className="font-semibold text-base md:text-lg text-green-400 professional-heading">Technical Analysis</h4>
                  </div>
                  <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400 professional-text">
                    <li className="flex items-start space-x-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Chart pattern recognition (triangles, flags, wedges)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Shield className="w-3 h-3 md:w-4 md:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Support and resistance level identification</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Trend analysis (bullish, bearish, sideways)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>Volume analysis and confirmation</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="status-online"></div>
                    <h4 className="font-semibold text-base md:text-lg text-blue-400 professional-heading">Trading Signals</h4>
                  </div>
                  <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400 professional-text">
                    <li className="flex items-start space-x-2">
                      <Target className="w-3 h-3 md:w-4 md:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Entry and exit price recommendations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Shield className="w-3 h-3 md:w-4 md:h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Stop loss and take profit levels</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Brain className="w-3 h-3 md:w-4 md:h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Risk assessment and management</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Position sizing suggestions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Analysis Section */}
          <Card className="clean-card mb-6 md:mb-8 hover-lift animate-fade-in-up animate-delay-300">
            <CardHeader>
              <CardTitle className="flex items-center text-xl md:text-2xl text-white professional-heading">
                <div className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4 bg-white rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                <span className="text-sm md:text-base">Chart Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartUpload />
            </CardContent>
          </Card>

          {/* Analysis History Section */}
          <AnalysisHistory />
        </div>
      </div>

      {/* Chat removed */}
    </div>
  );
}