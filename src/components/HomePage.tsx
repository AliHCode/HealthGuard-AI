import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Zap, Brain, Activity, CheckCircle, Award, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRef } from 'react';

interface HomePageProps {
  onNavigate: (page: 'analysis' | 'contact') => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function HomePage({ onNavigate }: HomePageProps) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-hidden font-sans selection:bg-white/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-10"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-white/80 uppercase">HealthGuard Engine v2.0 Live</span>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-4">
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[1.05]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
                  Medical AI.
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-400">
                  Reimagined.
                </span>
              </h1>
              <p className="text-xl text-white/50 max-w-xl leading-relaxed font-light">
                Clinical-grade diagnostic intelligence. Detect pneumonia and malaria with unprecedented accuracy, directly in your browser.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5">
              <Button
                onClick={() => onNavigate('analysis')}
                className="h-14 px-8 text-lg bg-white text-black hover:bg-white/90 rounded-full font-medium transition-all hover:scale-105 active:scale-95 group"
              >
                Start Analysis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('contact')}
                className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 rounded-full font-medium transition-all bg-transparent"
              >
                View Documentation
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              {[
                { label: "Accuracy", value: "99.8%", color: "text-emerald-400" },
                { label: "Processing", value: "<200ms", color: "text-blue-400" },
                { label: "Parameters", value: "25M+", color: "text-purple-400" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className={`text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm font-medium text-white/40 uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative lg:h-[600px] w-full"
            style={{ perspective: 1000 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 rounded-3xl blur-3xl transform group-hover:scale-105 transition-transform duration-700" />
            <div className="relative h-full w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col">
               {/* Decorative App UI Mockup inside Hero */}
               <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
                 <div className="h-3 w-3 rounded-full bg-red-500/80" />
                 <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                 <div className="h-3 w-3 rounded-full bg-green-500/80" />
               </div>
               <div className="flex-1 p-6 flex flex-col gap-4 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                 
                 <motion.div 
                   animate={{ y: [0, -10, 0] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl mt-8"
                 >
                   <div className="flex items-center gap-4 mb-4">
                     <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                       <Activity className="text-blue-400" />
                     </div>
                     <div>
                       <div className="text-white font-medium">Real-time Analysis</div>
                       <div className="text-white/50 text-sm">Processing chest x-ray...</div>
                     </div>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       animate={{ width: ["0%", "100%", "0%"] }}
                       transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                       className="h-full bg-gradient-to-r from-blue-400 to-emerald-400"
                     />
                   </div>
                 </motion.div>

                 <motion.div 
                   animate={{ y: [0, 10, 0] }} 
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl ml-auto w-[80%] mt-4"
                 >
                   <div className="flex items-center justify-between mb-2">
                     <div className="text-white font-medium">Confidence Score</div>
                     <div className="text-emerald-400 font-bold">99.2%</div>
                   </div>
                   <div className="text-white/50 text-sm">Pattern matches known indicators.</div>
                 </motion.div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="relative z-10 py-32 px-6 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Intelligence at the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Edge</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Our proprietary neural networks are optimized to run inference directly, ensuring zero latency and maximum privacy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 p-8 hover:bg-white/[0.04] transition-colors"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-colors" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                    <Brain className="text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Explainable AI</h3>
                  <p className="text-white/50 leading-relaxed max-w-md">
                    Don't just trust the result. See it. Our advanced Grad-CAM integration generates highly precise heatmaps overlaying your medical imagery, pinpointing exactly where the AI detects anomalies.
                  </p>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                   <div className="h-32 w-full sm:w-48 rounded-xl bg-[url('https://images.unsplash.com/photo-1584555684040-bad07f46a21f?w=400')] bg-cover bg-center border border-white/10 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                        <span className="text-xs font-medium text-white">Original X-Ray</span>
                      </div>
                   </div>
                   <div className="h-32 w-full sm:w-48 rounded-xl bg-[url('https://images.unsplash.com/photo-1584555684040-bad07f46a21f?w=400')] bg-cover bg-center border border-blue-500/30 overflow-hidden relative">
                      <div className="absolute inset-0 bg-blue-500/30 mix-blend-overlay" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                        <span className="text-xs font-medium text-blue-400">Grad-CAM Heatmap</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 p-8 hover:bg-white/[0.04] transition-colors flex flex-col justify-between"
            >
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] -mr-10 -mb-10 group-hover:bg-emerald-500/20 transition-colors" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <Shield className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Military-Grade Security</h3>
                <p className="text-white/50 leading-relaxed">
                  Patient data is encrypted at rest and in transit. Role-based access ensures only authorized personnel view sensitive information.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 p-8 hover:bg-white/[0.04] transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                <Zap className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-white/50 leading-relaxed">
                Optimized TensorFlow Lite models deliver inference in less than 200ms, essential for high-throughput clinical environments.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 p-8 hover:bg-white/[0.04] transition-colors"
            >
               <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                 <div className="flex-1">
                    <div className="h-12 w-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-6 border border-teal-500/30">
                      <CheckCircle className="text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Dual-Disease Detection</h3>
                    <p className="text-white/50 leading-relaxed mb-6">
                      One unified platform for identifying both Pulmonary anomalies (Pneumonia) and Parasitic infections (Malaria). Switch contexts seamlessly.
                    </p>
                    <ul className="space-y-3">
                      {['Chest X-Ray Processing', 'Microscopic Blood Smear Analysis', 'Automated Clinical PDF Reports'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/70">
                          <CheckCircle className="h-4 w-4 text-teal-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                 </div>
                 <div className="w-full md:w-1/2 bg-black/50 rounded-2xl border border-white/10 p-4 min-h-[200px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10" />
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                       <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center shadow-2xl">
                         <div className="text-3xl font-bold text-white mb-1">95%</div>
                         <div className="text-xs text-white/50 uppercase">Pneumonia AUC</div>
                       </div>
                       <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center shadow-2xl sm:mt-8">
                         <div className="text-3xl font-bold text-white mb-1">98%</div>
                         <div className="text-xs text-white/50 uppercase">Malaria Acc</div>
                       </div>
                    </div>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive CTA */}
      <section className="relative z-10 py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white shadow-[0_0_100px_rgba(255,255,255,0.2)] mb-8">
               <span className="text-4xl text-black font-bold tracking-tighter">HG</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-8">
              Ready to transform <br/> your clinical workflow?
            </h2>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('analysis')}
                className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 rounded-full font-bold transition-all hover:scale-105"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('contact')}
                className="h-14 px-10 text-lg border-white/20 text-white hover:bg-white/10 rounded-full font-bold transition-all bg-transparent"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-xl py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter">HEALTHGUARD</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">AI</span>
          </div>
          <div className="text-white/40 text-sm">
            © 2026 HealthGuard AI. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}