import { User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
  user: any;
  onLogout: () => void;
}

export function Navbar({ currentPage, onNavigate, user, onLogout }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const normalizedPage = (currentPage === 'patient-details' || currentPage === 'auth') 
    ? (user?.role === 'doctor' || user?.role === 'asha_worker' ? 'dashboard' : 'analysis') 
    : currentPage;
  
  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#030303]/80 backdrop-blur-xl border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate(user?.role === 'doctor' || user?.role === 'asha_worker' ? 'dashboard' : 'home')}
          >
            <div className="flex items-center text-white">
              <span className="text-2xl font-bold tracking-tighter">HEALTHGUARD</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 ml-2">AI</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 bg-white/5 border border-white/10 px-8 py-2.5 rounded-full backdrop-blur-md">
            {(user?.role === 'doctor' || user?.role === 'asha_worker') ? (
              <>
                <NavLink active={normalizedPage === 'dashboard'} onClick={() => onNavigate('dashboard')}>Dashboard</NavLink>
                <NavLink active={currentPage === 'patient-details'} onClick={() => onNavigate('patient-details')}>New Screening</NavLink>
              </>
            ) : (
              <>
                <NavLink active={normalizedPage === 'home'} onClick={() => onNavigate('home')}>Home</NavLink>
                <NavLink active={normalizedPage === 'analysis'} onClick={() => onNavigate('analysis')}>Analysis</NavLink>
              </>
            )}
            <NavLink active={normalizedPage === 'contact'} onClick={() => onNavigate('contact')}>Contact</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div 
                  className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-colors text-white"
                  onClick={() => onNavigate('patient-details' as any)}
                >
                  <div className="size-6 bg-white/10 rounded-full flex items-center justify-center">
                    <UserIcon className="size-3.5 text-white" />
                  </div>
                  <span className="font-medium text-sm">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="text-white hover:bg-white/10 rounded-full"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onNavigate('analysis')}
                className="bg-white text-black hover:bg-white/90 rounded-full font-semibold px-6"
              >
                Get Started
              </Button>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#030303]/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6"
          >
             {(user?.role === 'doctor' || user?.role === 'asha_worker') ? (
              <>
                <MobileNavLink active={normalizedPage === 'dashboard'} onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}>Dashboard</MobileNavLink>
                <MobileNavLink active={currentPage === 'patient-details'} onClick={() => { onNavigate('patient-details'); setMobileMenuOpen(false); }}>New Screening</MobileNavLink>
              </>
            ) : (
              <>
                <MobileNavLink active={normalizedPage === 'home'} onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}>Home</MobileNavLink>
                <MobileNavLink active={normalizedPage === 'analysis'} onClick={() => { onNavigate('analysis'); setMobileMenuOpen(false); }}>Analysis</MobileNavLink>
              </>
            )}
            <MobileNavLink active={normalizedPage === 'contact'} onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}>Contact</MobileNavLink>
            
            <div className="pt-6 border-t border-white/10 mt-auto pb-10 flex flex-col gap-4">
              {user ? (
                 <>
                   <div className="text-white font-medium flex items-center gap-3">
                     <UserIcon className="size-5" /> {user.name}
                   </div>
                   <Button variant="outline" onClick={onLogout} className="w-full border-white/20 text-white bg-transparent">Logout</Button>
                 </>
              ) : (
                 <Button onClick={() => { onNavigate('analysis'); setMobileMenuOpen(false); }} className="w-full bg-white text-black">Get Started</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative text-sm font-medium transition-colors ${active ? 'text-white' : 'text-white/50 hover:text-white'}`}
    >
      {children}
      {active && (
        <motion.div 
          layoutId="navbar-active"
          className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full"
        />
      )}
    </button>
  );
}

function MobileNavLink({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`text-2xl font-bold text-left transition-colors ${active ? 'text-white' : 'text-white/40'}`}
    >
      {children}
    </button>
  );
}