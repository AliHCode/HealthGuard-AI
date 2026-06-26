import { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Send, Github, MessageSquare, Clock, 
  Sparkles, CheckCircle2, ChevronDown, HelpCircle, ArrowUpRight, 
  Activity, Server, Cpu, Database 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Interactive Node Selector State
  const [selectedNode, setSelectedNode] = useState<string>('node-karnataka');
  const [nodePings, setNodePings] = useState({
    'node-noida': 18,
    'node-bihar': 45,
    'node-karnataka': 8
  });

  // Simulate dynamic network jitter
  useEffect(() => {
    const timer = setInterval(() => {
      setNodePings(prev => ({
        'node-noida': Math.max(12, Math.min(25, prev['node-noida'] + Math.floor(Math.random() * 5) - 2)),
        'node-bihar': Math.max(35, Math.min(60, prev['node-bihar'] + Math.floor(Math.random() * 7) - 3)),
        'node-karnataka': Math.max(6, Math.min(12, prev['node-karnataka'] + Math.floor(Math.random() * 3) - 1))
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const faqData = [
    {
      q: "Is HealthGuard AI free to use?",
      a: "Yes. HealthGuard AI is completely free for patients, clinical field workers, and research institutions. Our mission is to democratize early triaging in rural communities."
    },
    {
      q: "How accurate is the diagnostic AI?",
      a: "Our model weights achieve ~95% accuracy for Pneumonia and ~97% accuracy for Malaria cell identification. However, it is an early screening node. All screenings must be confirmed by laboratory reports."
    },
    {
      q: "Is patient medical data secure?",
      a: "Absolutely. All scan files uploaded for inference are processed in transient memory and deleted instantly. No patient scans are ever cached or stored in our database records."
    },
    {
      q: "Can ASHA workers download reports?",
      a: "Yes. Once screening is complete, click 'Download PDF Report' to generate a medical-grade printable dossier detailing patient parameters, scan heatmaps, and AI recommendations."
    }
  ];

  // District Nodes Telemetry Data
  const nodesData = [
    {
      id: 'node-karnataka',
      title: 'Bangalore Central Hub',
      location: 'Karnataka Central Hub',
      triageToday: 482,
      gpu: 'NVIDIA H100 Tensor Core',
      bandwidth: '10 Gbps',
      version: 'v3.4.1-stable'
    },
    {
      id: 'node-noida',
      title: 'Noida Screening Hub',
      location: 'Noida Sub-Center',
      triageToday: 216,
      gpu: 'NVIDIA A10G (Transient)',
      bandwidth: '1 Gbps',
      version: 'v3.2.0-stable'
    },
    {
      id: 'node-bihar',
      title: 'Gopalpur Rural Node',
      location: 'Bihar Sub-Center',
      triageToday: 95,
      gpu: 'CPU Edge Inference Core',
      bandwidth: '100 Mbps',
      version: 'v3.0.4-edge'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-6 bg-white relative overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none opacity-[0.4]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-slate-50 blur-[100px] pointer-events-none z-0" />

      <div className="container mx-auto max-w-7xl relative z-10 space-y-16">
        
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="size-3.5" />
            Communication Console
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-black">Contact Core Hub</h1>
          <p className="text-sm text-black/50 max-w-xl mx-auto leading-relaxed">
            Inquire about district implementations, technical support parameters, or research partnerships.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Message Transmission (7 Columns) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border border-black/[0.06] shadow-elegant-xl rounded-2xl bg-white overflow-hidden">
                <CardHeader className="p-8 pb-6 border-b border-black/[0.03]">
                  <CardTitle className="text-xl font-bold tracking-tight text-black">Transmit Message</CardTitle>
                  <CardDescription className="text-xs text-black/40">
                    Submit your clinical details to establish contact.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="py-12 text-center space-y-4"
                      >
                        <div className="size-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                          <CheckCircle2 className="size-8 animate-bounce" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-black">Transmission Success</h3>
                          <p className="text-xs text-black/40 mt-1">Our support agents will respond on your vector within 24 hours.</p>
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-black/50">Full Name *</Label>
                            <Input
                              id="name"
                              type="text"
                              placeholder="Dr. Samuel Jenkins"
                              value={formData.name}
                              onChange={(e) => handleChange('name', e.target.value)}
                              className="h-11 border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-black/50">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="inquiry@hospital.org"
                              value={formData.email}
                              onChange={(e) => handleChange('email', e.target.value)}
                              className="h-11 border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-black/50">Inquiry Subject *</Label>
                          <Input
                            id="subject"
                            type="text"
                            placeholder="e.g. District Clinic Integration"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            className="h-11 border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-black/50">Message Body *</Label>
                          <Textarea
                            id="message"
                            placeholder="Detail your clinical sandbox questions..."
                            value={formData.message}
                            onChange={(e) => handleChange('message', e.target.value)}
                            className="border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm min-h-32"
                            required
                            rows={5}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-black hover:bg-black/90 text-white h-11 rounded-xl shadow-elegant transition-all duration-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Send className="size-4" />
                          Transmit Message
                        </Button>
                      </form>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right: Telemetry Dashboard & Network status (5 Columns - WOW Factor) */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {/* Interactive Health Nodes Telemetry Board */}
              <motion.div variants={itemVariants}>
                <Card className="border border-black/[0.08] shadow-elegant-lg rounded-2xl bg-slate-950 text-white p-5 space-y-4 overflow-hidden relative">
                  {/* Glowing background circles */}
                  <div className="absolute top-[-30%] right-[-30%] size-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 relative z-10 text-left">
                    <div className="flex items-center gap-2">
                      <Server className="size-4 text-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">District Nodes Network</span>
                    </div>
                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded animate-pulse">
                      LIVE SYSTEM
                    </span>
                  </div>

                  {/* Node Selector buttons */}
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    {nodesData.map((node) => {
                      const isSelected = selectedNode === node.id;
                      const ping = nodePings[node.id as keyof typeof nodePings];
                      return (
                        <button
                          key={node.id}
                          onClick={() => setSelectedNode(node.id)}
                          className={`flex flex-col p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-950/20 shadow-md' 
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-white truncate">{node.location}</span>
                          <span className="text-[14px] font-mono font-bold mt-1 text-white flex items-center gap-1">
                            {ping}ms
                            <span className={`size-1.5 rounded-full ${
                              ping < 20 ? 'bg-emerald-400' : 'bg-amber-400'
                            }`} />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Selected Node Diagnostic Spec Sheet */}
                  {(() => {
                    const activeNodeSpec = nodesData.find(n => n.id === selectedNode);
                    if (!activeNodeSpec) return null;
                    return (
                      <div className="p-3 border border-white/10 bg-white/[0.03] rounded-xl text-xs space-y-2.5 text-left relative z-10">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 border-b border-white/5 pb-1.5">
                          {activeNodeSpec.title} Spec Sheet
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="flex flex-col">
                            <span className="text-white/40 text-[8px] uppercase">Node Core Processor</span>
                            <span className="font-semibold text-white/90 truncate mt-0.5 flex items-center gap-1">
                              <Cpu className="size-3 text-white/50" />
                              {activeNodeSpec.gpu}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white/40 text-[8px] uppercase">Screening Volume</span>
                            <span className="font-semibold text-white/90 mt-0.5 flex items-center gap-1">
                              <Activity className="size-3 text-white/50" />
                              {activeNodeSpec.triageToday} today
                            </span>
                          </div>
                          <div className="flex flex-col pt-1.5">
                            <span className="text-white/40 text-[8px] uppercase">Core Bandwidth</span>
                            <span className="font-semibold text-white/90 mt-0.5">
                              {activeNodeSpec.bandwidth}
                            </span>
                          </div>
                          <div className="flex flex-col pt-1.5">
                            <span className="text-white/40 text-[8px] uppercase">Build version</span>
                            <span className="font-semibold text-white/90 mt-0.5">
                              {activeNodeSpec.version}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              </motion.div>

              {/* Direct Support Vector Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <Card className="border border-black/[0.06] bg-white rounded-xl hover-lift cursor-pointer p-4 text-left space-y-2">
                  <div className="size-8 bg-black text-white rounded-lg flex items-center justify-center shrink-0 border border-black/5">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-black/45">Email Support</h3>
                    <a href="mailto:support@healthguard.ai" className="text-xs font-bold text-black hover:underline block truncate mt-0.5">
                      support@healthguard.ai
                    </a>
                  </div>
                </Card>

                <Card className="border border-black/[0.06] bg-white rounded-xl hover-lift cursor-pointer p-4 text-left space-y-2">
                  <div className="size-8 bg-black text-white rounded-lg flex items-center justify-center shrink-0 border border-black/5">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-black/45">Telephone Node</h3>
                    <a href="tel:+911234567890" className="text-xs font-bold text-black hover:underline block truncate mt-0.5">
                      +91 123 456 7890
                    </a>
                  </div>
                </Card>
              </motion.div>

              {/* R&D Lab & Open Source Card */}
              <motion.div variants={itemVariants}>
                <Card className="border border-black/[0.06] bg-white rounded-xl hover-lift cursor-pointer p-5 flex gap-4 text-left">
                  <div className="size-10 bg-black text-white rounded-lg flex items-center justify-center shrink-0 border border-black/5">
                    <MapPin className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-black/55">R&D Lab Location</h3>
                    <p className="text-xs font-bold text-black mt-0.5">
                      HealthGuard AI Labs, Bangalore, Karnataka, India
                    </p>
                    <span className="text-[10px] text-black/40 font-medium">Medical Innovation Hub</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border border-black/[0.06] bg-white rounded-xl hover-lift cursor-pointer p-5 flex gap-4 items-center justify-between group text-left">
                  <div className="flex gap-4">
                    <div className="size-10 bg-black text-white rounded-lg flex items-center justify-center shrink-0 border border-black/5">
                      <Github className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-black/55">Open Source Core</h3>
                      <p className="text-[10px] text-black/40 font-medium">Inspect weights & codebases</p>
                    </div>
                  </div>
                  <a 
                    href="https://github.com/healthguard-ai" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black font-bold text-xs uppercase tracking-wider flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    GitHub
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </Card>
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="pt-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-black/40">Faqs</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-black">Common Queries</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqData.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="border border-black/[0.06] bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-black cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="size-4.5 text-black/30" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`size-4.5 text-black/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-5 pt-0 text-xs text-black/55 leading-relaxed border-t border-black/[0.02] mt-1 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Metrics Footer Banner */}
        <Card className="border border-black/[0.06] bg-white rounded-2xl shadow-elegant">
          <CardContent className="p-8 flex justify-center gap-12 flex-wrap items-center">
            <div className="flex items-center gap-3.5">
              <div className="size-9 bg-black/[0.03] border border-black/[0.05] text-black rounded-lg flex items-center justify-center shrink-0">
                <Clock className="size-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-black leading-tight text-left">Operating Hours</h4>
                <p className="text-[10px] text-black/40 font-medium">Monday - Friday: 9AM - 6PM IST</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3.5">
              <div className="size-9 bg-black/[0.03] border border-black/[0.05] text-black rounded-lg flex items-center justify-center shrink-0">
                <MessageSquare className="size-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-black leading-tight text-left">Response SLA</h4>
                <p className="text-[10px] text-black/40 font-medium">Resolutions dispatched in 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}