import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Shield, Zap, Activity, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string) => void;
  onBack: () => void;
}

export function AuthPage({ onLogin, onSignup, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password);
    } else {
      onSignup(email, password, name);
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
                className="w-full bg-black hover:bg-black/90 text-white h-12 rounded-full shadow-elegant transition-elegant font-medium"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
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