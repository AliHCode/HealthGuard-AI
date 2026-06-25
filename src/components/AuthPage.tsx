import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Shield, Zap, Activity, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
  onBack: () => void;
}

export function AuthPage({ onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
            }
          }
        });
        if (error) throw error;
        // Optional: show a message to check email for verification if you have email confirmation on.
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-8 py-8 bg-white">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side - Sophisticated Branding */}
        <div className="hidden lg:block space-y-12 animate-slide-in-left">
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
              Secure Patient Portal
            </div>
            <h1 className="text-5xl xl:text-6xl leading-tight tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join HealthGuard AI'}
            </h1>
            <p className="text-xl text-black/60 leading-relaxed max-w-lg">
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
                <div className="size-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg mb-2 font-semibold">{item.title}</h3>
                  <p className="text-black/60 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Sophisticated Auth Form */}
        <Card className="border border-black/[0.06] shadow-elegant-lg animate-slide-in-right bg-white rounded-xl">
          <CardHeader className="space-y-3 p-10 pb-8">
            <CardTitle className="text-3xl tracking-tight">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-base text-black/60">
              {isLogin 
                ? 'Enter your credentials to access your dashboard'
                : 'Sign up to start using AI-powered medical screening'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-3 text-sm animate-fade-in">
                <AlertCircle className="size-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/40" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-11 h-12 border-black/10 rounded-lg transition-elegant focus:border-black/30"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-black/10 rounded-lg transition-elegant focus:border-black/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 border-black/10 rounded-lg transition-elegant focus:border-black/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-black/60 cursor-pointer">
                    <input type="checkbox" className="rounded border-black/20 size-4" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-black hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-black/90 text-white h-12 rounded-full shadow-elegant transition-elegant font-medium"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.06]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-black/40 text-sm">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full border border-black/10 hover:bg-black/5 h-12 rounded-full font-medium transition-elegant flex items-center justify-center gap-2 mb-6"
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
              <p className="text-black/60 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-black hover:underline font-semibold"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                onClick={onBack}
                className="w-full border border-black/10 hover:bg-black/5 h-12 rounded-full font-medium transition-elegant"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}