'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Menu, X, LogOut, User, Upload, Settings } from 'lucide-react';
import { AuthModal } from './AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
  const { user, logout, refreshUser } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Listen once for credit refresh events
  useEffect(() => {
    const handler = () => {
      refreshUser();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('credits:refresh', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('credits:refresh', handler);
      }
    };
  }, [refreshUser]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
        <nav className="fixed top-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-xl border-b border-white/20 animate-slide-in-down">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo (left side) */}
            <div className="flex items-center space-x-3 hover-lift">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover-lift">
                <Brain className="w-5 h-5 text-black" />
              </div>
                  <span className="text-xl font-bold text-white professional-heading">SignalX</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors hover-lift">
                Features
              </a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors hover-lift">
                How It Works
              </a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors hover-lift">
                Pricing
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* AI Status + Credits (right side) */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-emerald-300">AI Ready</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full border border-white/20 bg-white/10">
                      <span className="text-xs font-semibold text-white">{Math.max(0, Number(user.credits ?? 0))}</span>
                      <span className="text-xs text-white/70 ml-1">credits</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-white/10 text-white">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload className="mr-2 h-4 w-4" />
                          <span>My Analysis</span>
                        </DropdownMenuItem>
                        {user.isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.location.href = '/?admin=true'}>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Admin Dashboard</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAuth(true)}
                    className="text-white hover:text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowAuth(true)}
                    className="professional-button"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#pricing"
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                
                <div className="pt-4 border-t border-white/10">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-white/10 text-white">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                          <p className="text-xs text-white/60">{user.email}</p>
                        </div>
                      </div>
                      {/* Mobile: AI Status + Credits */}
                      <div className="flex items-center space-x-2 px-3">
                        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-xs font-medium text-emerald-300">AI Ready</span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-full border border-white/20 bg-white/10">
                          <span className="text-xs font-semibold text-white">{Math.max(0, Number(user.credits ?? 0))}</span>
                          <span className="text-xs text-white/70 ml-1">credits</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-white hover:text-white hover:bg-white/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowAuth(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-white hover:text-white hover:bg-white/10"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAuth(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full professional-button"
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}

