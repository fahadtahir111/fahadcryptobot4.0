import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  BarChart3,
  History,
  Server,
  LayoutDashboard
} from 'lucide-react';
import { ChartUpload } from './ChartUpload';
import { AnalysisHistory } from './AnalysisHistory';
import { TradingNodes } from './TradingNodes';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analyze');

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 md:fixed md:inset-y-0 md:left-0 border-r border-white/10 bg-black z-20 flex flex-col">
        <div className="p-6 flex items-center space-x-2 border-b border-white/10 flex-shrink-0">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white uppercase tracking-tighter">SignalX</span>
        </div>

        <nav className="p-4 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'analyze' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'history' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <History className="w-5 h-5" />
            <span className="font-medium">History</span>
          </button>

          <button
            onClick={() => setActiveTab('nodes')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'nodes' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Server className="w-5 h-5" />
            <span className="font-medium">Market Nodes</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 hidden md:block flex-shrink-0 bg-black">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <Avatar className="h-8 w-8">
              {user?.avatar ? <AvatarImage src={user.avatar} /> : <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>}
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white truncate max-w-[120px]">{user?.name}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{user?.credits} Credits</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-gray-500 hover:text-red-400 hover:bg-red-400/10 h-9 transition-colors" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-white/10 p-4 flex items-center justify-between bg-black z-10 sticky top-0">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-white" />
            <span className="font-bold text-white uppercase tracking-tight">SignalX</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full"><Avatar className="h-7 w-7"><AvatarFallback>U</AvatarFallback></Avatar></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black border-white/10 text-white">
              <div className="p-2 border-b border-white/5 text-[10px] text-gray-400 uppercase tracking-widest px-3">
                {user?.credits} Credits
              </div>
              <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          {activeTab === 'analyze' && (
            <div className="space-y-10">
              <div className="animate-fade-in-up">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Technical Analysis</h1>
                <p className="text-gray-400 text-lg">Professional-grade AI signals and market scanning.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="clean-card p-6 flex flex-col items-center hover-lift border-glow transition-all">
                  <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
                  <span className="text-3xl font-black text-white">99.8%</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">AI Accuracy</span>
                </div>
                <div className="clean-card p-6 flex flex-col items-center hover-lift border-glow transition-all">
                  <Zap className="w-8 h-8 text-yellow-500 mb-3" />
                  <span className="text-3xl font-black text-white">2.3s</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Processing</span>
                </div>
                <div className="clean-card p-6 flex flex-col items-center text-center hover-lift border-glow transition-all">
                  <Brain className="w-8 h-8 text-purple-500 mb-3" />
                  <span className="text-lg font-black text-white">Gemini 2.5</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Flash Model</span>
                </div>
                <div className="clean-card p-6 flex flex-col items-center hover-lift border-glow transition-all">
                  <Shield className="w-8 h-8 text-blue-500 mb-3" />
                  <span className="text-3xl font-black text-white">100%</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Secure</span>
                </div>
              </div>

              <ChartUpload />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Signal History</h1>
              <AnalysisHistory />
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="animate-fade-in-up">
              <TradingNodes />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}