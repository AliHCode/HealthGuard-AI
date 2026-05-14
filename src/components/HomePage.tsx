import { ArrowRight, Shield, Zap, Brain, Activity, CheckCircle, Award, TrendingUp, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: 'analysis' | 'contact') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Ultra-Premium Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.02),transparent_50%)]"></div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
                  AI-Powered Medical Diagnostics
                </div>

                <h1 className="text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                  Medical AI That<br />
                  <span className="text-black/40">Saves Lives</span>
                </h1>

                <p className="text-lg text-black/60 leading-relaxed max-w-xl">
                  Advanced AI diagnostics for pneumonia and malaria detection. Trusted by healthcare professionals worldwide. Clinical-grade accuracy in seconds.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => onNavigate('analysis')}
                  className="bg-black hover:bg-black/90 text-white px-8 h-12 group rounded-full shadow-elegant transition-elegant text-base"
                >
                  Start Analysis
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate('contact')}
                  className="border border-black/10 hover:bg-black/5 h-12 px-8 rounded-full transition-elegant text-base"
                >
                  Contact Sales
                </Button>
              </div>

              {/* Elite Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/[0.06]">
                <div className="group relative p-4 rounded-2xl border border-black/[0.06] bg-white hover:border-black/20 transition-all duration-500 hover:shadow-elegant hover:-translate-y-1 cursor-pointer overflow-hidden">
                  <div className="relative">
                    <div className="text-4xl font-semibold tracking-tight mb-1 group-hover:scale-110 transition-transform duration-500">95%</div>
                    <div className="text-xs text-black/50 uppercase tracking-widest font-medium">Accuracy</div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 size-24 bg-black/[0.03] rounded-full blur-2xl group-hover:bg-black/[0.08] transition-all duration-500"></div>
                </div>
                <div className="group relative p-4 rounded-2xl border border-black/[0.06] bg-white hover:border-black/20 transition-all duration-500 hover:shadow-elegant hover:-translate-y-1 cursor-pointer overflow-hidden">
                  <div className="relative">
                    <div className="text-4xl font-semibold tracking-tight mb-1 group-hover:scale-110 transition-transform duration-500">{'<10s'}</div>
                    <div className="text-xs text-black/50 uppercase tracking-widest font-medium">Speed</div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 size-24 bg-black/[0.03] rounded-full blur-2xl group-hover:bg-black/[0.08] transition-all duration-500"></div>
                </div>
                <div className="group relative p-4 rounded-2xl border border-black/[0.06] bg-white hover:border-black/20 transition-all duration-500 hover:shadow-elegant hover:-translate-y-1 cursor-pointer overflow-hidden">
                  <div className="relative">
                    <div className="text-4xl font-semibold tracking-tight mb-1 group-hover:scale-110 transition-transform duration-500">24/7</div>
                    <div className="text-xs text-black/50 uppercase tracking-widest font-medium">Available</div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 size-24 bg-black/[0.03] rounded-full blur-2xl group-hover:bg-black/[0.08] transition-all duration-500"></div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-in-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-black/[0.03] rounded-2xl animate-pulse-slow"></div>
                <div className="relative rounded-xl overflow-hidden border border-black/[0.06] shadow-elegant-lg">
                  <div className="relative overflow-hidden h-[380px]">
                    {/* Animated Moving Image */}
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1584555684040-bad07f46a21f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwQUklMjBjaGVzdCUyMHhyYXklMjBkaWFnbm9zaXN8ZW58MXx8fHwxNzcwMTQwODE3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Medical AI Chest X-Ray Diagnosis"
                      className="w-full h-full object-cover animate-slow-zoom"
                    />

                    {/* Continuously Moving Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10 animate-gradient-shift"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elite Feature Grid */}
      <section className="relative py-32 border-t border-white/[0.06] bg-black overflow-hidden">
        {/* Animated Moving Stars */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[5%] w-1 h-1 bg-white rounded-full animate-float opacity-60"></div>
          <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 bg-white rounded-full animate-float-delayed-1 opacity-80"></div>
          <div className="absolute top-[30%] left-[25%] w-1 h-1 bg-white rounded-full animate-float-delayed-2 opacity-50"></div>
          <div className="absolute top-[15%] left-[35%] w-2 h-2 bg-white rounded-full animate-float opacity-70"></div>
          <div className="absolute top-[25%] left-[45%] w-1 h-1 bg-white rounded-full animate-float-delayed-1 opacity-60"></div>
          <div className="absolute top-[35%] left-[55%] w-1.5 h-1.5 bg-white rounded-full animate-float-delayed-2 opacity-75"></div>
          <div className="absolute top-[10%] left-[65%] w-1 h-1 bg-white rounded-full animate-float opacity-55"></div>
          <div className="absolute top-[40%] left-[75%] w-2 h-2 bg-white rounded-full animate-float-delayed-1 opacity-85"></div>
          <div className="absolute top-[20%] left-[85%] w-1 h-1 bg-white rounded-full animate-float-delayed-2 opacity-65"></div>
          <div className="absolute top-[30%] left-[95%] w-1.5 h-1.5 bg-white rounded-full animate-float opacity-70"></div>

          <div className="absolute top-[50%] left-[8%] w-1.5 h-1.5 bg-white rounded-full animate-float-delayed-2 opacity-60"></div>
          <div className="absolute top-[60%] left-[18%] w-1 h-1 bg-white rounded-full animate-float opacity-75"></div>
          <div className="absolute top-[70%] left-[28%] w-2 h-2 bg-white rounded-full animate-float-delayed-1 opacity-80"></div>
          <div className="absolute top-[55%] left-[38%] w-1 h-1 bg-white rounded-full animate-float-delayed-2 opacity-55"></div>
          <div className="absolute top-[65%] left-[48%] w-1.5 h-1.5 bg-white rounded-full animate-float opacity-70"></div>
          <div className="absolute top-[75%] left-[58%] w-1 h-1 bg-white rounded-full animate-float-delayed-1 opacity-65"></div>
          <div className="absolute top-[50%] left-[68%] w-2 h-2 bg-white rounded-full animate-float-delayed-2 opacity-85"></div>
          <div className="absolute top-[80%] left-[78%] w-1 h-1 bg-white rounded-full animate-float opacity-60"></div>
          <div className="absolute top-[60%] left-[88%] w-1.5 h-1.5 bg-white rounded-full animate-float-delayed-1 opacity-75"></div>
          <div className="absolute top-[70%] left-[98%] w-1 h-1 bg-white rounded-full animate-float-delayed-2 opacity-50"></div>

          <div className="absolute top-[85%] left-[12%] w-1 h-1 bg-white rounded-full animate-float opacity-70"></div>
          <div className="absolute top-[90%] left-[22%] w-1.5 h-1.5 bg-white rounded-full animate-float-delayed-1 opacity-60"></div>
          <div className="absolute top-[95%] left-[32%] w-1 h-1 bg-white rounded-full animate-float-delayed-2 opacity-80"></div>
          <div className="absolute top-[88%] left-[42%] w-2 h-2 bg-white rounded-full animate-float opacity-75"></div>
          <div className="absolute top-[92%] left-[52%] w-1 h-1 bg-white rounded-full animate-float-delayed-1 opacity-55"></div>
          <div className="absolute top-[87%] left-[62%] w-1.5 h-1.5 bg-white rounded-full animate-float-delayed-2 opacity-70"></div>
          <div className="absolute top-[93%] left-[72%] w-1 h-1 bg-white rounded-full animate-float opacity-65"></div>
          <div className="absolute top-[86%] left-[82%] w-1.5 h-1.5 bg-white rounded-full animate-float-delayed-1 opacity-85"></div>
          <div className="absolute top-[91%] left-[92%] w-1 h-1 bg-white rounded-full animate-float-delayed-2 opacity-60"></div>
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 animate-fade-in">
              <h2 className="text-4xl lg:text-5xl mb-4 tracking-tight text-white">Enterprise Technology</h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Built for healthcare organizations that demand excellence
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Zap,
                  title: 'Real-Time Processing',
                  description: 'Sub-5 second inference with optimized neural networks'
                },
                {
                  icon: Brain,
                  title: 'Advanced AI',
                  description: 'Trained on 150,000+ validated medical images'
                },
                {
                  icon: Shield,
                  title: 'Enterprise Security',
                  description: 'End-to-end encryption with zero data retention'
                },
                {
                  icon: Award,
                  title: 'Free Forever',
                  description: 'No hidden costs for healthcare professionals'
                }
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="border border-white/[0.08] hover:border-white/20 transition-elegant p-8 hover-lift bg-white/[0.03] backdrop-blur-xl rounded-xl group"
                >
                  <div className="size-12 bg-white rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-elegant">
                    <feature.icon className="size-6 text-[#0a0a0a]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 tracking-tight text-white">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sophisticated Disease Detection */}
      <section className="py-32 bg-black/[0.02]">
        <div className="container mx-auto px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl mb-4 tracking-tight">Advanced Diagnostics</h2>
              <p className="text-xl text-black/60 max-w-2xl mx-auto">
                Two critical diseases. One sophisticated platform.
              </p>
            </div>

            {/* Pneumonia Detection */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
              <div className="space-y-8 animate-slide-in-left">
                <div className="inline-block px-3 py-1.5 bg-black/5 rounded-full text-sm font-medium">
                  Pneumonia Detection
                </div>

                <h3 className="text-3xl lg:text-4xl tracking-tight">Chest X-Ray Analysis</h3>

                <p className="text-lg text-black/60 leading-relaxed">
                  Advanced convolutional neural network for pneumonia pattern identification. Medical-grade accuracy with visual heatmaps showing affected lung areas.
                </p>

                <ul className="space-y-4">
                  {[
                    'Grad-CAM heatmap visualization',
                    'Multi-level severity classification',
                    'Confidence scoring with percentiles',
                    'Instant PDF report generation'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="size-5 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="size-3 text-white" />
                      </div>
                      <span className="text-black/70">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  onClick={() => onNavigate('analysis')}
                  className="bg-black hover:bg-black/90 text-white h-12 px-6 rounded-full shadow-elegant transition-elegant"
                >
                  Try Pneumonia Detection
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>

              <div className="relative animate-slide-in-right">
                <div className="absolute -inset-4 bg-black/[0.02] rounded-xl"></div>
                <div className="relative rounded-lg overflow-hidden border border-black/[0.06] shadow-elegant-lg">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1729339983239-0129e46801de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                    alt="Chest X-Ray"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Malaria Detection */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative animate-slide-in-left order-2 lg:order-1">
                <div className="absolute -inset-4 bg-black/[0.02] rounded-xl"></div>
                <div className="relative rounded-lg overflow-hidden border border-black/[0.06] shadow-elegant-lg">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1614308457932-e16d85c5d053?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                    alt="Microscope Analysis"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-8 animate-slide-in-right order-1 lg:order-2">
                <div className="inline-block px-3 py-1.5 bg-black/5 rounded-full text-sm font-medium">
                  Malaria Detection
                </div>

                <h3 className="text-3xl lg:text-4xl tracking-tight">Blood Smear Analysis</h3>

                <p className="text-lg text-black/60 leading-relaxed">
                  Precision parasite detection from microscope images. AI identifies and marks individual Plasmodium parasites with clinical accuracy.
                </p>

                <ul className="space-y-4">
                  {[
                    'Precise parasite detection with markers',
                    'Automated parasite count metrics',
                    'Species identification capability',
                    'Downloadable detailed reports'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="size-5 bg-black rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="size-3 text-white" />
                      </div>
                      <span className="text-black/70">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  onClick={() => onNavigate('analysis')}
                  className="bg-black hover:bg-black/90 text-white h-12 px-6 rounded-full shadow-elegant transition-elegant"
                >
                  Try Malaria Detection
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elite Metrics */}
      <section className="py-32 border-t border-black/[0.06]">
        <div className="container mx-auto px-8">
          <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-12">
            {[
              { value: '95%', label: 'Detection Accuracy', icon: Award },
              { value: '10K+', label: 'Analyses Completed', icon: TrendingUp },
              { value: '<10s', label: 'Average Speed', icon: Clock },
              { value: '100%', label: 'Free Forever', icon: Shield }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="size-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="size-6 text-white" />
                </div>
                <div className="text-5xl font-semibold mb-2 tracking-tight">{stat.value}</div>
                <div className="text-sm text-black/50 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sophisticated CTA */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-10">
            <h2 className="text-4xl lg:text-5xl tracking-tight">
              Deploy AI-Powered Diagnostics Today
            </h2>
            <p className="text-xl text-white/60 leading-relaxed">
              Join leading healthcare organizations using HealthGuard AI for rapid, accurate disease screening. Enterprise support available.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => onNavigate('analysis')}
                className="bg-white text-black hover:bg-white/90 h-12 px-8 rounded-full shadow-elegant transition-elegant"
              >
                Get Started Free
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('contact')}
                className="border border-white/20 hover:bg-white/10 text-white h-12 px-8 rounded-full transition-elegant"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Refined Footer */}
      <footer className="bg-white border-t border-black/[0.06] py-20">
        <div className="container mx-auto px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <span className="text-lg font-light tracking-[-0.04em] text-black leading-none">HEALTH</span>
                  <span className="text-lg font-bold tracking-[-0.04em] text-black leading-none ml-0.5">GUARD</span>
                  <span className="text-[8px] font-semibold tracking-[0.3em] text-black/60 ml-2 leading-none">AI</span>
                </div>
              </div>
              <p className="text-black/60 text-sm leading-relaxed">
                AI-powered medical screening for modern healthcare.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-black/60 text-sm">
                <li><a href="#" className="hover:text-black transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Analysis</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-black/60 text-sm">
                <li><a href="#" className="hover:text-black transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-sm uppercase tracking-wider">Connect</h4>
              <div className="space-y-2 text-black/60 text-sm">
                <p>support@healthguard.ai</p>
                <p>Open Source on GitHub</p>
              </div>
            </div>
          </div>

          <div className="border-t border-black/[0.06] pt-8 text-center text-black/40 text-sm">
            <p>© 2024 HealthGuard AI. Free forever for public healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}