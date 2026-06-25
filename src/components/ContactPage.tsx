import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Github, MessageSquare, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { motion } from 'framer-motion';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-6 relative overflow-hidden text-white pt-24">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 size-[500px] bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 size-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Premium Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-full mb-8 backdrop-blur-md">
            <Sparkles className="size-4" />
            <span className="text-sm font-bold">Get in Touch</span>
          </div>
          <h1 className="text-5xl lg:text-7xl mb-6 tracking-tighter font-bold">Contact Us</h1>
          <p className="text-xl lg:text-2xl text-white/50 max-w-3xl mx-auto font-light leading-relaxed">
            Have questions about HealthGuard AI? We're here to help. Reach out to our team for support, partnerships, or technical inquiries.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Premium Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden">
              <CardHeader className="p-10 pb-8 border-b border-white/5">
                <CardTitle className="text-3xl tracking-tight text-white font-bold">Send us a Message</CardTitle>
                <CardDescription className="text-lg font-light text-white/50">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-base font-medium text-white/80">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-base font-medium text-white/80">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-base font-medium text-white/80">Subject *</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className="h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-base font-medium text-white/80">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 text-base min-h-40"
                      required
                      rows={6}
                    />
                  </div>

                  {submitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center"
                    >
                      <CheckCircle className="size-12 text-emerald-400 mx-auto mb-3" />
                      <p className="text-emerald-300 text-lg font-bold">Message sent successfully!</p>
                      <p className="text-emerald-400/70 font-light">We'll get back to you soon.</p>
                    </motion.div>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full bg-white hover:bg-white/90 text-black h-14 rounded-xl shadow-lg shadow-white/10 transition-all font-bold text-base"
                    >
                      <Send className="size-5 mr-2" />
                      Send Message
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {[
              { icon: Mail, title: 'Email Us', desc: 'For general inquiries and support', links: ['support@healthguard.ai', 'partnerships@healthguard.ai'], type: 'mailto' },
              { icon: Phone, title: 'Call Us', desc: 'Available Mon-Fri, 9AM-6PM IST', links: ['+91 123 456 7890'], type: 'tel' }
            ].map((info, idx) => (
              <Card key={idx} className="border border-white/10 bg-black/40 backdrop-blur-md rounded-3xl hover:bg-white/[0.02] transition-colors">
                <CardHeader className="p-8">
                  <div className="size-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <info.icon className="size-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl tracking-tight text-white">{info.title}</CardTitle>
                  <CardDescription className="text-base font-light text-white/50">
                    {info.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  {info.links.map(link => (
                    <a key={link} href={`${info.type}:${link}`} className="text-white hover:underline text-lg font-bold block mb-2">
                      {link}
                    </a>
                  ))}
                  {info.type === 'tel' && <span className="text-white/40 font-light">Toll-free for healthcare providers</span>}
                </CardContent>
              </Card>
            ))}

            <Card className="border border-white/10 bg-black/40 backdrop-blur-md rounded-3xl hover:bg-white/[0.02] transition-colors">
              <CardHeader className="p-8">
                <div className="size-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="size-7 text-white" />
                </div>
                <CardTitle className="text-2xl tracking-tight text-white">Visit Us</CardTitle>
                <CardDescription className="text-base font-light text-white/50">
                  Our research & development center
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-white/70 font-light leading-relaxed">
                <p>
                  HealthGuard AI Labs<br />
                  Medical Innovation Hub<br />
                  Bangalore, Karnataka 560001<br />
                  India
                </p>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white text-black rounded-3xl hover:bg-white/90 transition-colors shadow-xl shadow-white/5">
              <CardHeader className="p-8">
                <div className="size-14 bg-black/5 rounded-2xl flex items-center justify-center mb-6">
                  <Github className="size-7 text-black" />
                </div>
                <CardTitle className="text-2xl tracking-tight">Open Source</CardTitle>
                <CardDescription className="text-base font-light text-black/60">
                  Contribute to the project
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <a 
                  href="https://github.com/healthguard-ai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline flex items-center gap-2 text-lg font-bold"
                >
                  <Github className="size-5" />
                  View on GitHub
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Premium FAQ Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="mt-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl mb-6 tracking-tight font-bold">Frequently Asked Questions</h2>
            <p className="text-xl text-white/50 font-light">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Is HealthGuard AI free to use?",
                a: "Yes! HealthGuard AI is completely free for all users including healthcare professionals, clinics, and patients. We're committed to making AI-powered medical screening accessible to everyone."
              },
              {
                q: "How accurate is the AI?",
                a: "Our models achieve ~95% accuracy for pneumonia and ~97% for malaria detection. However, this is a screening tool only. Always confirm results with laboratory tests and consult qualified doctors."
              },
              {
                q: "Is my medical data secure?",
                a: "Absolutely. All images are processed in real-time and deleted immediately after analysis. We use end-to-end encryption and never share your data with third parties."
              },
              {
                q: "Can I use this for clinical diagnosis?",
                a: "No. HealthGuard AI is a preliminary screening tool only, not a diagnostic device. It's designed to assist healthcare workers in remote areas, but final diagnosis must be made by qualified medical professionals."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="border border-white/10 rounded-3xl bg-black/40 backdrop-blur-md hover:bg-white/[0.02] transition-colors">
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl tracking-tight text-white">
                    <MessageSquare className="size-6 flex-shrink-0 text-indigo-400" />
                    {faq.q}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 text-white/60 text-lg font-light leading-relaxed">
                  {faq.a}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Premium Support Hours */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Card className="mt-16 border border-white/10 bg-black/40 backdrop-blur-md rounded-3xl">
            <CardContent className="p-12">
              <div className="flex items-center justify-center gap-16 flex-wrap">
                <div className="flex items-center gap-5">
                  <div className="size-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <Clock className="size-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-1 text-white">Support Hours</p>
                    <p className="text-white/50 text-lg font-light">Monday - Friday: 9AM - 6PM IST</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="size-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="size-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-1 text-white">Response Time</p>
                    <p className="text-white/50 text-lg font-light">Usually within 24 hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}