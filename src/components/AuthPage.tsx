import { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff, Shield, Zap, Activity, AlertCircle, Heart, Users, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { supabase } from '../lib/supabase';

// Import local assets

interface AuthPageProps {
  onBack: () => void;
}

export function AuthPage({ onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role,
            }
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred with Google login');
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'patient',
      title: 'Patient',
      description: 'Check your diagnostic history & scan results.',
      icon: Heart,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      id: 'asha_worker',
      title: 'ASHA Worker',
      description: 'Screen rural patients for Malaria & Pneumonia.',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      id: 'doctor',
      title: 'Medical Doctor',
      description: 'Review AI heatmaps & clinical scan reports.',
      icon: ShieldCheck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    }
  ];

  return (
    <div className="h-full flex text-left bg-white relative overflow-hidden">
      
      {/* Left Column: Premium Clinical Image (hidden on lg and below) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden border-r border-neutral-100 bg-neutral-50 h-full">
        <img 
          src="/login.jpg" 
          alt="Clinical Diagnostics" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle vignette/gradient at the bottom for premium look */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/10 pointer-events-none" />
      </div>

      {/* Right Column: Clean Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-6 md:px-16 md:py-8 lg:px-24 lg:py-12 relative bg-white h-full overflow-y-auto">
        {/* Background grids for right side */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.2]">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-slate-50 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-slate-50 blur-[100px]" />
        </div>

        <div className="w-full max-w-md mx-auto space-y-4 relative z-10">
          
          {/* Header */}
          <div className="space-y-1 text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-black">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
              {isLogin 
                ? 'Access HealthGuard AI diagnostics suite.'
                : 'Register for free and start diagnostic screenings.'
              }
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-2.5 pt-0">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3 text-xs font-mono"
              >
                <AlertCircle className="size-4.5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <span className="font-bold">Authentication Error</span>
                  <p className="text-red-600/90 text-[10px] mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3.5 overflow-hidden"
                  >
                    {/* Name Input */}
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-black/60 font-mono">Full Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/30" />
                        <Input
                          id="name"
                          type="text"
                          placeholder=""
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-11 h-11 border-black/10 rounded-xl transition-all duration-300 bg-white text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:border-black/30"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    {/* Interactive Role Selector */}
                    <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-black/60 font-mono">Account Type (Role)</Label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl border border-black/[0.04] relative">
                        {roleOptions.map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = role === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setRole(opt.id)}
                              className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-center transition-all duration-300 relative cursor-pointer select-none"
                            >
                              {isSelected && (
                                <motion.div 
                                  layoutId="activeRoleSegment"
                                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-black/[0.04]"
                                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10 flex items-center justify-center gap-1.5 w-full">
                                <Icon className={`size-3.5 shrink-0 transition-colors duration-300 ${
                                  isSelected ? 'text-black' : 'text-black/40'
                                }`} />
                                <span className={`text-[10px] font-bold transition-colors duration-300 leading-none truncate ${
                                  isSelected ? 'text-black' : 'text-black/50'
                                }`}>
                                  {opt.title}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-black/60 font-mono">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/30" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-11 border-black/10 rounded-xl transition-all duration-300 bg-white text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:border-black/30"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-black/60 font-mono font-mono">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-[10px] text-black/60 hover:text-black transition-colors font-bold font-mono">
                      Forgot?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/30" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-11 border-black/10 rounded-xl transition-all duration-300 bg-white text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:border-black/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-xs pb-1">
                  <label className="flex items-center gap-2 text-black/50 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-black/20 size-4 text-black accent-black cursor-pointer" />
                    <span className="text-[10px] font-semibold">Stay signed in for 30 days</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-black/90 text-white h-11 rounded-xl shadow-elegant transition-all duration-300 font-semibold cursor-pointer relative overflow-hidden text-xs"
              >
                {loading ? 'Connecting...' : isLogin ? 'Sign In to Core' : 'Register Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.06]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-black/35 text-[9px] font-bold uppercase tracking-wider font-mono">or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full border border-black/10 hover:bg-black/5 hover:border-black/20 h-11 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 mb-4 cursor-pointer text-xs"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>

            {/* Switch Mode */}
            <div className="text-center">
              <p className="text-black/50 text-[10px] font-semibold">
                {isLogin ? "New to HealthGuard? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-black hover:underline font-extrabold transition-all duration-300"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}