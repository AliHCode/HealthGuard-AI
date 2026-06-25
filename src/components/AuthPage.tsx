import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Shield, Zap, Activity, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface AuthPageProps {
  onBack: () => void;
}

export function AuthPage({ onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'asha_worker' | 'doctor'>('patient');
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

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-8 py-8 relative overflow-hidden text-white pt-24">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 size-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 size-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side - Sophisticated Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block space-y-12"
        >
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm font-medium backdrop-blur-md">
              Secure Patient Portal
            </div>
            <h1 className="text-5xl xl:text-6xl leading-tight tracking-tight font-bold">
              {isLogin ? 'Welcome Back' : 'Join HealthGuard AI'}
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-lg">
              Access advanced AI-powered medical screening for pneumonia and malaria. Clinical-grade accuracy with instant results.
            </p>
          </div>

          <div className="space-y-8 pt-4">
            {[
              {
                icon: Zap,
                title: 'Real-Time Analysis',
                description: 'Get AI results in under 5 seconds with enterprise infrastructure'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Military-grade encryption. Your data is never stored or shared'
              },
              {
                icon: Activity,
                title: 'Visual Intelligence',
                description: 'Advanced heatmaps show exactly what the AI detected'
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-5">
                <div className="size-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg mb-2 font-bold">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Sophisticated Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-3 p-10 pb-8 border-b border-white/5">
              <CardTitle className="text-3xl tracking-tight text-white font-bold">
                {isLogin ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-base text-white/50">
                {isLogin 
                  ? 'Enter your credentials to access your dashboard'
                  : 'Sign up to start using AI-powered medical screening'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-3 text-sm">
                  <AlertCircle className="size-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-white/80">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-white/80">Select Workspace Role</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'patient', label: 'Patient', desc: 'Personal' },
                          { id: 'asha_worker', label: 'ASHA', desc: 'Clinic' },
                          { id: 'doctor', label: 'Doctor', desc: 'Portal' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setRole(item.id as any)}
                            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all duration-300 ${
                              role === item.id 
                                ? 'border-white bg-white text-black shadow-md shadow-white/20' 
                                : 'border-white/10 bg-white/5 hover:border-white/30 text-white/70'
                            }`}
                          >
                            <span className="font-extrabold text-sm leading-none">{item.label}</span>
                            <span className={`text-[10px] mt-1.5 leading-none ${role === item.id ? 'text-black/60' : 'text-white/40'}`}>
                              {item.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white/80">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-white/80">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                      <input type="checkbox" className="rounded border-white/20 bg-white/5 size-4" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-white hover:underline font-medium">
                      Forgot password?
                    </a>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-white/90 text-black h-12 rounded-xl shadow-lg shadow-white/10 transition-all font-bold mt-4"
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#030303] text-white/40 text-sm">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full border border-white/10 bg-transparent hover:bg-white/5 h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-6 text-white"
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center">
                <p className="text-white/60 text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-white hover:underline font-bold"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="w-full border border-white/10 bg-transparent hover:bg-white/5 h-12 rounded-xl font-bold transition-all text-white"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}