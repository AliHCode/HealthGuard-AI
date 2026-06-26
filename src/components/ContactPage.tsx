import { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, Github, MessageSquare, Clock, 
  Sparkles, CheckCircle2, ChevronDown, HelpCircle, ArrowUpRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-16 px-6 bg-white relative overflow-hidden flex flex-col justify-center items-center">
      {/* Subtle Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-[0.4]" />
      
      <div className="container mx-auto max-w-5xl relative z-10 space-y-16">
        
        {/* Sleek Minimal Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 font-mono">SUPPORT VECTOR</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">Contact Core</h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Inquire about implementations, technical integrations, or public health partnership requests.
          </p>
        </div>

        {/* Two-Column Content Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-stretch max-w-4xl mx-auto">
          
          {/* Left Column: Form (7 Columns) */}
          <div className="lg:col-span-7 flex">
            <div className="border border-neutral-100 shadow-elegant-sm rounded-2xl bg-white p-6 md:p-8 flex flex-col justify-between w-full">
              <div className="space-y-1.5 text-left pb-4">
                <h3 className="text-base font-bold text-neutral-900">Transmit Message</h3>
                <p className="text-xs text-neutral-400">Fill in details to open a diagnostic support ticket.</p>
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="py-12 text-center space-y-4 flex-1 flex flex-col justify-center"
                  >
                    <div className="size-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                      <CheckCircle2 className="size-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Transmission Complete</h3>
                      <p className="text-[11px] text-neutral-400 mt-1">Our support agents will respond on your vector within 24 hours.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Full Name *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Dr. Samuel Jenkins"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="h-10 border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 rounded-lg text-xs bg-white text-black"
                            required
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="inquiry@hospital.org"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="h-10 border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 rounded-lg text-xs bg-white text-black"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Inquiry Subject *</Label>
                        <Input
                          id="subject"
                          type="text"
                          placeholder="e.g. District Clinic Integration"
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          className="h-10 border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 rounded-lg text-xs bg-white text-black"
                          required
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Message Body *</Label>
                        <Textarea
                          id="message"
                          placeholder="Detail your clinical sandbox questions..."
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          className="border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 rounded-lg text-xs bg-white text-black min-h-24"
                          required
                          rows={4}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-black/90 text-white h-10 rounded-lg shadow-elegant transition-all duration-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    >
                      <Send className="size-3.5" />
                      Transmit Message
                    </Button>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Contact details (5 Columns) */}
          <div className="lg:col-span-5 flex">
            <div className="border border-neutral-100 shadow-elegant-sm rounded-2xl bg-white p-6 md:p-8 flex flex-col justify-between gap-6 w-full text-left">
              <div className="space-y-1.5 pb-2">
                <h3 className="text-base font-bold text-neutral-900">Support Vectors</h3>
                <p className="text-xs text-neutral-400">Direct transmission coordinates.</p>
              </div>

              {/* Email channel */}
              <div className="flex gap-3.5 items-start">
                <div className="size-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                  <Mail className="size-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Email Support</span>
                  <a href="mailto:support@healthguard.ai" className="block text-xs font-bold text-neutral-900 hover:underline mt-0.5">
                    support@healthguard.ai
                  </a>
                </div>
              </div>

              {/* Phone channel */}
              <div className="flex gap-3.5 items-start">
                <div className="size-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                  <Phone className="size-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Telephone Node</span>
                  <a href="tel:+911234567890" className="block text-xs font-bold text-neutral-900 hover:underline mt-0.5">
                    +91 123 456 7890
                  </a>
                </div>
              </div>

              {/* R&D Location */}
              <div className="flex gap-3.5 items-start">
                <div className="size-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono">R&D Lab Hub</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5 leading-relaxed">
                    HealthGuard AI Labs, Bangalore, Karnataka, India
                  </p>
                </div>
              </div>

              {/* Open Source */}
              <div className="flex gap-3.5 items-start">
                <div className="size-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                  <Github className="size-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Open Source Core</span>
                  <a 
                    href="https://github.com/healthguard-ai" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="group flex items-center gap-0.5 text-xs font-bold text-neutral-900 hover:underline mt-0.5"
                  >
                    github.com/healthguard-ai
                    <ArrowUpRight className="size-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Redesigned FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 font-mono">FAQS</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">Common Queries</h2>
          </div>

          <div className="border border-neutral-100 bg-white rounded-2xl overflow-hidden shadow-elegant-sm divide-y divide-neutral-100 text-left">
            {faqData.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-xs text-neutral-800 cursor-pointer hover:bg-neutral-50/30 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="size-4 text-neutral-300" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`size-4 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 pt-0 text-xs text-neutral-500 leading-relaxed border-t border-neutral-50/50 mt-1 pt-3">
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

        {/* Support Metrics Footer */}
        <div className="border-t border-neutral-100 pt-8 flex justify-center gap-12 flex-wrap items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-neutral-50 border border-neutral-100 text-neutral-500 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="size-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-neutral-800 leading-none">Operating Hours</h4>
              <p className="text-[10px] text-neutral-400 font-medium mt-1">Monday - Friday: 9AM - 6PM IST</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="size-8 bg-neutral-50 border border-neutral-100 text-neutral-500 rounded-lg flex items-center justify-center shrink-0">
              <MessageSquare className="size-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-neutral-800 leading-none">Response SLA</h4>
              <p className="text-[10px] text-neutral-400 font-medium mt-1">Resolutions dispatched in 24 hours</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}