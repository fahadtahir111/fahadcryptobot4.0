'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Header1 } from '@/components/ui/header';
import { Button } from './ui/button';
import { 
  Zap, 
  BarChart3, 
  Shield, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Play, 
  Brain, 
  Target, 
  Clock,
  CheckCircle,
  Star,
  Code,
  Database,
  Cpu,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import { HeroScrollDemo } from '@/components/ui/demo';
import { FeatureStepsDemo } from '@/components/ui/demo';
import { Features } from '@/components/ui/features-8';
import { Pricing } from '@/components/ui/pricing';
import { Timeline, TimelineItem } from '@/components/ui/modern-timeline';
import { motion } from 'framer-motion';
import { LampContainer } from '@/components/ui/lamp';
import { SignalXTimelineDemo } from '@/components/ui/demo';
import { SiteBackground } from '@/components/ui/site-background';

export function LandingPage() {
  const { login } = useAuth();
  const [activeSection, setActiveSection] = useState('hero');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'how-it-works', 'pricing', 'testimonials', 'cta'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteBackground />
      {/* Header */}
      <Header1 />

      {/* Hero Section */}
      <section id="hero" className="relative pt-16 md:pt-24 px-4">
        <HeroGeometric
          badge="SignalX"
          title1="AI-Powered Crypto"
          title2="Trading Intelligence"
          description="Advanced chart analysis, real-time signals, and professional trading insights—built for serious traders on every device."
        />
        <div className="px-2 md:px-0">
          <HeroScrollDemo />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 px-4 bg-transparent">
        <div className="container mx-auto">
          <FeatureStepsDemo />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 px-4 bg-transparent">
        <div className="container mx-auto">
          <Features />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 px-4 bg-transparent">
        <div className="container mx-auto">
          <Pricing
            plans={[
              {
                name: 'FREE',
                price: '0',
                yearlyPrice: '0',
                period: 'per month',
                features: [
                  '3 free analysis credits',
                  'Basic AI signals',
                  'Community support',
                ],
                description: 'Try SignalX with 3 free credits. No card required.',
                buttonText: 'Get Started Free',
                href: '/signup',
                isPopular: false,
              },
              {
                name: 'TRADER CREDITS',
                price: '19',
                yearlyPrice: '15',
                period: 'per month',
                features: [
                  '50 analysis credits',
                  'Advanced AI signals',
                  'Priority in queue',
                ],
                description: 'For active traders who need reliable signals and enough credits.',
                buttonText: 'Buy Credits',
                href: '/buy-credits',
                isPopular: true,
              },
              {
                name: 'PRO CREDITS',
                price: '49',
                yearlyPrice: '39',
                period: 'per month',
                features: [
                  '200 analysis credits',
                  'Real-time notifications',
                  'Priority support',
                ],
                description: 'For power users and small teams who need more throughput.',
                buttonText: 'Upgrade to Pro',
                href: '/buy-credits',
                isPopular: false,
              },
            ]}
          />
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-12 px-4 bg-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              SignalX Roadmap
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our journey from AI research to institutional-grade trading intelligence
            </p>
          </div>
          <SignalXTimelineDemo />
        </div>
      </section>

      {/* Reviews (as timeline) */}
      <section id="reviews" className="py-12 px-4 bg-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">What Traders Say</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Real stories from traders who use SignalX daily</p>
          </div>
          <Timeline
            items={[
              {
                title: '“Accuracy that pays.”',
                description:
                  'SignalX helped me catch trend reversals earlier. I grew my account 18% in 6 weeks with disciplined risk.',
                date: '2025-07-01',
                category: 'Pro Trader',
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
                status: 'completed',
              },
              {
                title: '“Great for entries and exits.”',
                description:
                  'The AI levels align with my manual analysis. I use the credits on high-conviction setups only.',
                date: '2025-08-15',
                category: 'Swing Trader',
                image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
                status: 'current',
              },
              {
                title: '“Perfect for busy schedules.”',
                description:
                  'As a part‑time trader, the quick AI read keeps me from overanalyzing. Credits model fits my usage.',
                date: '2025-09-05',
                category: 'Part‑time',
                image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
                status: 'upcoming',
              },
            ] as TimelineItem[]}
          />
        </div>
      </section>

      {/* CTA Section - Replaced with Lamp */}
      <section id="cta" className="py-8 md:py-12 px-4 bg-transparent">
        <div className="container mx-auto">
          <LampContainer className="bg-transparent">
            <motion.h2
              className="mt-6 md:mt-8 bg-gradient-to-br from-white to-white/70 py-2 bg-clip-text text-center text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight text-transparent px-4"
              initial={{ opacity: 0.5, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Ready to Transform Your Trading?
            </motion.h2>
            <motion.p
              className="text-center text-base sm:text-lg md:text-xl text-white/70 mt-3 md:mt-4 max-w-3xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Join thousands of successful traders using SignalX. Start your free trial today and experience AI-driven trading intelligence.
            </motion.p>
            <motion.div
              className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 px-4"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Button
                onClick={() => login('demo@example.com', 'demo123')}
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border border-gray-700 text-gray-200 bg-transparent hover:bg-gray-900/60 hover:border-gray-600 px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg"
              >
                <Play className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                Watch Demo
              </Button>
            </motion.div>
          </LampContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 bg-transparent border-t border-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">SignalX</h3>
              <p className="text-sm md:text-base text-gray-400 mb-4">
                AI-powered cryptocurrency trading intelligence for smart traders.
              </p>
              <div className="flex gap-3 md:gap-4">
                <Github className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-gray-400">
            <p className="text-sm md:text-base">&copy; 2024 SignalX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}