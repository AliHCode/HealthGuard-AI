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
    { id: 'analysis', label: 'AI Diagnostics' },
    { id: 'contact', label: 'Contact Us' }
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
      <div className="w-full px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14">
          
          {/* Left Block: Logo Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            onClick={() => onNavigate('home')}
          >
            <div className="flex items-center">
              <img src="/translogo.png" alt="HealthGuard AI Logo" className="h-10 w-auto mr-1 object-contain" />
              <span className="text-[19px] font-bold tracking-tight text-neutral-950">HealthGuard AI</span>
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
                  {item.id === 'analysis' ? 'AI Diagnostics' : item.label}
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
                  className="flex items-center gap-2.5 cursor-pointer select-none group"
                  onClick={() => onNavigate('patient-details' as any)}
                  title="Configure patient clinical details"
                >
                  {user.role ? (
                    <div className="size-8.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm relative group-hover:border-slate-300 transition-colors">
                      {getRoleIcon(user.role)}
                    </div>
                  ) : (
                    <div className="size-8.5 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#0f172a] group-hover:text-black transition-colors leading-none">{user.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">{getRoleLabel(user.role)}</span>
                  </div>
                </div>
              </>
            ) : (
              <Button
                onClick={() => onNavigate('analysis')}
                className="bg-black hover:bg-black/90 text-white h-8.5 px-4 rounded-full font-semibold text-xs tracking-tight shadow-elegant transition-all duration-300 cursor-pointer flex items-center gap-1.5"
              >
                Start Screening
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