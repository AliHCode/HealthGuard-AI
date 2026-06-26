import { Activity, User as UserIcon, LogOut, Heart, Users, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { User } from '../App';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: 'home' | 'analysis' | 'contact') => void;
  user: User | null;
  onLogout: () => void;
}

export function Navbar({ currentPage, onNavigate, user, onLogout }: NavbarProps) {
  // Normalize page to handle 'patient-details' and 'auth' as 'analysis' in nav
  const normalizedPage = (currentPage === 'patient-details' || currentPage === 'auth') ? 'analysis' : currentPage;
  
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'analysis', label: 'Analysis Sandboxes' },
    { id: 'contact', label: 'Contact Hub' }
  ];

  // Helper to determine role badges
  const getRoleIcon = (role?: string) => {
    if (role === 'doctor') return <ShieldCheck className="size-3.5 text-indigo-600" />;
    if (role === 'asha_worker') return <Users className="size-3.5 text-blue-600" />;
    return <Heart className="size-3.5 text-emerald-600" />;
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'doctor') return 'Doctor';
    if (role === 'asha_worker') return 'ASHA Worker';
    return 'Patient';
  };

  return (
    <nav className="bg-white border-b border-black/[0.03] sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14">
          
          {/* Left Block: Logo Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            onClick={() => onNavigate('home')}
          >
            <div className="flex items-center">
              <span className="relative flex h-1.5 w-1.5 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[17px] font-black tracking-[-0.03em] text-neutral-950">HEALTH</span>
              <span className="text-[17px] font-light tracking-[-0.03em] text-neutral-400 ml-0.5">GUARD</span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-400 ml-1.5 leading-none border border-neutral-200 bg-neutral-50 px-1 py-0.5 rounded">AI</span>
            </div>
          </div>

          {/* Center Block: Absolute Centered Premium Navigation Links */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = normalizedPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as any)}
                  className={`px-3 py-1.5 text-[13px] font-medium transition-all duration-200 select-none cursor-pointer rounded-lg ${
                    isActive 
                      ? 'text-neutral-950 font-semibold bg-neutral-50/80' 
                      : 'text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50/40'
                  }`}
                >
                  {item.id === 'analysis' ? 'Triage Sandbox' : item.label}
                </button>
              );
            })}
          </div>

          {/* Right Block: User Controls Panel */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <>
                {/* Profile Badge Link */}
                <div 
                  className="flex items-center gap-2 px-3 py-1 bg-neutral-50 border border-black/[0.04] rounded-full hover:bg-neutral-100/50 transition-all duration-200 cursor-pointer select-none"
                  onClick={() => onNavigate('patient-details' as any)}
                  title="Configure patient clinical details"
                >
                  <div className="size-5 bg-white border border-black/10 rounded-full flex items-center justify-center shrink-0">
                    {getRoleIcon(user.role)}
                  </div>
                  <span className="font-semibold text-[10px] text-neutral-700 leading-none truncate max-w-[90px]">{user.name}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50 h-8.5 px-3 rounded-lg font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onNavigate('analysis')}
                className="bg-black hover:bg-black/90 text-white h-8.5 px-4 rounded-full font-semibold text-xs tracking-tight shadow-elegant transition-all duration-300 cursor-pointer flex items-center gap-1.5"
              >
                Access Sandboxes
                <ChevronRight className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex justify-around pb-2.5 border-t border-black/[0.04] pt-2 gap-1">
          {navItems.map((item) => {
            const isActive = normalizedPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`font-semibold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive ? 'bg-neutral-50 text-neutral-950 font-bold' : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                {item.id === 'home' ? 'Home' : item.id === 'analysis' ? 'Analysis' : 'Contact'}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}