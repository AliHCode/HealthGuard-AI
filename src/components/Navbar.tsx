import { Activity, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import type { User } from '../App';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
  user: any;
  onLogout: () => void;
}

export function Navbar({ currentPage, onNavigate, user, onLogout }: NavbarProps) {
  // Normalize page to handle 'patient-details' and 'auth' appropriately
  const normalizedPage = (currentPage === 'patient-details' || currentPage === 'auth') 
    ? (user?.role === 'doctor' || user?.role === 'asha_worker' ? 'dashboard' : 'analysis') 
    : currentPage;
  
  return (
    <nav className="bg-white border-b border-black/[0.06] sticky top-0 z-50 shadow-elegant">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Elite Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate(user?.role === 'doctor' || user?.role === 'asha_worker' ? 'dashboard' : 'home')}
          >
            <div className="flex items-center">
              <span className="text-[26px] font-light tracking-[-0.04em] text-black group-hover:text-black/60 transition-colors leading-none">HEALTH</span>
              <span className="text-[26px] font-bold tracking-[-0.04em] text-black group-hover:text-black/60 transition-colors leading-none ml-0.5">GUARD</span>
              <span className="text-[10px] font-semibold tracking-[0.3em] text-black/60 ml-3 leading-none">AI</span>
            </div>
          </div>

          {/* Sophisticated Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {(user?.role === 'doctor' || user?.role === 'asha_worker') ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="relative py-2 font-medium text-sm text-black/70 hover:text-black transition-colors"
                >
                  <span className={normalizedPage === 'dashboard' ? 'text-black' : ''}>Dashboard</span>
                  {normalizedPage === 'dashboard' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>
                  )}
                </button>
                <button
                  onClick={() => onNavigate('patient-details')}
                  className="relative py-2 font-medium text-sm text-black/70 hover:text-black transition-colors"
                >
                  <span className={currentPage === 'patient-details' ? 'text-black' : ''}>New Screening</span>
                  {currentPage === 'patient-details' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className="relative py-2 font-medium text-sm text-black/70 hover:text-black transition-colors"
                >
                  <span className={normalizedPage === 'home' ? 'text-black' : ''}>Home</span>
                  {normalizedPage === 'home' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>
                  )}
                </button>
                <button
                  onClick={() => onNavigate('analysis')}
                  className="relative py-2 font-medium text-sm text-black/70 hover:text-black transition-colors"
                >
                  <span className={normalizedPage === 'analysis' ? 'text-black' : ''}>Analysis</span>
                  {normalizedPage === 'analysis' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>
                  )}
                </button>
              </>
            )}
            <button
              onClick={() => onNavigate('contact')}
              className="relative py-2 font-medium text-sm text-black/70 hover:text-black transition-colors"
            >
              <span className={normalizedPage === 'contact' ? 'text-black' : ''}>Contact</span>
              {normalizedPage === 'contact' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>
              )}
            </button>
          </div>

          {/* Elite User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div 
                  className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-black/[0.04] rounded-full border border-black/[0.06] cursor-pointer hover:bg-black/[0.08] transition-colors"
                  onClick={() => onNavigate('patient-details' as any)}
                  title="Edit Patient Details"
                >
                  <div className="size-6 bg-black rounded-md flex items-center justify-center">
                    <UserIcon className="size-3.5 text-white" />
                  </div>
                  <span className="font-medium text-sm">{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="border-black/10 hover:bg-black/5 h-10 px-4 rounded-full font-medium text-sm transition-elegant"
                >
                  <LogOut className="size-3.5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onNavigate('analysis')}
                className="bg-black hover:bg-black/90 text-white h-10 px-6 rounded-full font-medium text-sm shadow-elegant transition-elegant"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around pb-3 border-t border-black/[0.06] pt-3 gap-1">
          {(user?.role === 'doctor' || user?.role === 'asha_worker') ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className={normalizedPage === 'dashboard' ? 'bg-black/5 font-medium text-sm' : 'font-medium text-sm text-black/70'}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('patient-details')}
                className={currentPage === 'patient-details' ? 'bg-black/5 font-medium text-sm' : 'font-medium text-sm text-black/70'}
              >
                New Scan
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('home')}
                className={normalizedPage === 'home' ? 'bg-black/5 font-medium text-sm' : 'font-medium text-sm text-black/70'}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('analysis')}
                className={normalizedPage === 'analysis' ? 'bg-black/5 font-medium text-sm' : 'font-medium text-sm text-black/70'}
              >
                Analysis
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('contact')}
            className={normalizedPage === 'contact' ? 'bg-black/5 font-medium text-sm' : 'font-medium text-sm text-black/70'}
          >
            Contact
          </Button>
        </div>
      </div>
    </nav>
  );
}