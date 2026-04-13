import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Lightbulb, Search, Activity, Users, Youtube, Settings, Menu, X, Swords, Zap, Video, TrendingUp, Sparkles, Image as ImageIcon, FileText } from 'lucide-react';
import SettingsModal from './SettingsModal';

export default function Layout() {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const navItems = [
    { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'ড্যাশবোর্ড' },
    { to: '/ai-coach', icon: <Sparkles className="w-5 h-5" />, label: 'AI Coach' },
    { to: '/daily-ideas', icon: <Lightbulb className="w-5 h-5" />, label: 'দৈনিক আইডিয়া' },
    { to: '/keyword-research', icon: <Search className="w-5 h-5" />, label: 'কিওয়ার্ড রিসার্চ' },
    { to: '/seo-analyzer', icon: <Activity className="w-5 h-5" />, label: 'এসইও অ্যানালাইজার' },
    { to: '/video-optimizer', icon: <Zap className="w-5 h-5" />, label: 'ভিডিও অপ্টিমাইজার' },
    { to: '/upcoming-analyzer', icon: <Video className="w-5 h-5" />, label: 'আপকামিং এনালাইজার' },
    { to: '/ai-viral-pulse', icon: <TrendingUp className="w-5 h-5" />, label: 'AI Viral Pulse' },
    { to: '/competitors', icon: <Users className="w-5 h-5" />, label: 'প্রতিযোগী বিশ্লেষণ' },
    { to: '/battle-mode', icon: <Swords className="w-5 h-5" />, label: 'ব্যাটল মুড' },
    { to: '/thumbnail-downloader', icon: <ImageIcon className="w-5 h-5" />, label: 'থাম্বনেইল ডাউনলোডার' },
    { to: '/description-analyzer', icon: <FileText className="w-5 h-5" />, label: 'ডেসক্রিপশন এনালাইজার' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-neutral-50 overflow-hidden font-sans selection:bg-red-500/30 flex-col lg:flex-row">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0f0f0f]/95 backdrop-blur-xl z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-white">
            <Youtube className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">YT Growth</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 top-[65px] bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 top-[65px] lg:top-0 z-40 w-[280px] lg:w-72 bg-[#0f0f0f]/95 backdrop-blur-xl border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden lg:flex p-8 items-center justify-between gap-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <Youtube className="w-7 h-7" />
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight text-white block">YT Growth</span>
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Pro Tools</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 lg:p-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">মেনু</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-white/10 text-white font-medium shadow-sm'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full" />
                )}
                <div className={`${isActive ? 'text-red-400' : 'text-neutral-500 group-hover:text-neutral-300'} transition-colors`}>
                  {item.icon}
                </div>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 lg:p-6 border-t border-white/5 space-y-4">
          <button 
            onClick={() => {
              setIsSettingsOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-neutral-500" />
            <span className="font-medium">সেটিংস</span>
          </button>
          
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Youtube className="w-5 h-5 text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-300 font-medium">ফ্রি ভার্সন</p>
            <p className="text-xs text-neutral-500 mt-1">সব ফিচার আনলক করা আছে</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <Outlet />
        </main>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
