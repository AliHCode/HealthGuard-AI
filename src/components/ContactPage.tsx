import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Github, MessageSquare, Clock, Sparkles, CheckCircle } from 'lucide-react';
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

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }}></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Premium Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full mb-8 shadow-premium">
            <Sparkles className="size-4" />
            <span className="text-sm font-medium">Get in Touch</span>
          </div>
          <h1 className="text-5xl lg:text-6xl mb-6 tracking-tight">Contact Us</h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Have questions about HealthGuard AI? We're here to help. Reach out to our team for support, partnerships, or technical inquiries.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Premium Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200/60 shadow-premium-lg rounded-3xl bg-white">
              <CardHeader className="p-10 pb-8">
                <CardTitle className="text-3xl tracking-tight">Send us a Message</CardTitle>
                <CardDescription className="text-lg font-light">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-base font-medium">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="h-14 border-gray-300 rounded-xl text-base transition-premium focus:border-black"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="h-14 border-gray-300 rounded-xl text-base transition-premium focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-base font-medium">Subject *</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className="h-14 border-gray-300 rounded-xl text-base transition-premium focus:border-black"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-base font-medium">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="border-gray-300 rounded-xl text-base transition-premium focus:border-black min-h-40"
                      required
                      rows={6}
                    />
                  </div>

                  {submitted ? (
                    <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center">
                      <CheckCircle className="size-12 text-green-600 mx-auto mb-3" />
                      <p className="text-green-800 text-lg font-medium">Message sent successfully!</p>
                      <p className="text-green-700 font-light">We'll get back to you soon.</p>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-gray-900 text-white h-14 rounded-2xl shadow-premium hover:shadow-premium-lg transition-premium text-base font-medium"
                    >
                      <Send className="size-5 mr-2" />
                      Send Message
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Premium Contact Information */}
          <div className="space-y-6">
            <Card className="border-gray-200/60 bg-white rounded-3xl shadow-premium hover-lift transition-premium">
              <CardHeader className="p-8">
                <div className="size-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Mail className="size-7 text-white" />
                </div>
                <CardTitle className="text-2xl tracking-tight">Email Us</CardTitle>
                <CardDescription className="text-base font-light">
                  For general inquiries and support
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <a href="mailto:support@healthguard.ai" className="text-black hover:underline text-lg font-medium block mb-2">
                  support@healthguard.ai
                </a>
                <a href="mailto:partnerships@healthguard.ai" className="text-black hover:underline text-lg font-medium block">
                  partnerships@healthguard.ai
                </a>
              </CardContent>
            </Card>

            <Card className="border-gray-200/60 bg-white rounded-3xl shadow-premium hover-lift transition-premium">
              <CardHeader className="p-8">
                <div className="size-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Phone className="size-7 text-white" />
                </div>
                <CardTitle className="text-2xl tracking-tight">Call Us</CardTitle>
                <CardDescription className="text-base font-light">
                  Available Mon-Fri, 9AM-6PM IST
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <a href="tel:+911234567890" className="text-black hover:underline text-lg font-medium block mb-2">
                  +91 123 456 7890
                </a>
                <span className="text-gray-600 font-light">Toll-free for healthcare providers</span>
              </CardContent>
            </Card>

            <Card className="border-gray-200/60 bg-white rounded-3xl shadow-premium hover-lift transition-premium">
              <CardHeader className="p-8">
                <div className="size-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <MapPin className="size-7 text-white" />
                </div>
                <CardTitle className="text-2xl tracking-tight">Visit Us</CardTitle>
                <CardDescription className="text-base font-light">
                  Our research & development center
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-gray-700 font-light leading-relaxed">
                <p>
                  HealthGuard AI Labs<br />
                  Medical Innovation Hub<br />
                  Bangalore, Karnataka 560001<br />
                  India
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200/60 bg-black text-white rounded-3xl shadow-premium-lg hover-lift transition-premium">
              <CardHeader className="p-8">
                <div className="size-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Github className="size-7 text-black" />
                </div>
                <CardTitle className="text-2xl tracking-tight">Open Source</CardTitle>
                <CardDescription className="text-base font-light text-gray-400">
                  Contribute to the project
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <a 
                  href="https://github.com/healthguard-ai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline flex items-center gap-2 text-lg font-medium"
                >
                  <Github className="size-5" />
                  View on GitHub
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Premium FAQ Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl mb-6 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 font-light">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-gray-200/60 rounded-3xl shadow-premium bg-white hover-lift transition-premium">
              <CardHeader className="p-8">
                <CardTitle className="flex items-center gap-3 text-2xl tracking-tight">
                  <MessageSquare className="size-6 flex-shrink-0" />
                  Is HealthGuard AI free to use?
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-gray-600 text-lg font-light leading-relaxed">
                Yes! HealthGuard AI is completely free for all users including healthcare professionals, clinics, and patients. We're committed to making AI-powered medical screening accessible to everyone.
              </CardContent>
            </Card>

            <Card className="border-gray-200/60 rounded-3xl shadow-premium bg-white hover-lift transition-premium">
              <CardHeader className="p-8">
                <CardTitle className="flex items-center gap-3 text-2xl tracking-tight">
                  <MessageSquare className="size-6 flex-shrink-0" />
                  How accurate is the AI?
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-gray-600 text-lg font-light leading-relaxed">
                Our models achieve ~95% accuracy for pneumonia and ~97% for malaria detection. However, this is a screening tool only. Always confirm results with laboratory tests and consult qualified doctors.
              </CardContent>
            </Card>

            <Card className="border-gray-200/60 rounded-3xl shadow-premium bg-white hover-lift transition-premium">
              <CardHeader className="p-8">
                <CardTitle className="flex items-center gap-3 text-2xl tracking-tight">
                  <MessageSquare className="size-6 flex-shrink-0" />
                  Is my medical data secure?
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-gray-600 text-lg font-light leading-relaxed">
                Absolutely. All images are processed in real-time and deleted immediately after analysis. We use end-to-end encryption and never share your data with third parties.
              </CardContent>
            </Card>

            <Card className="border-gray-200/60 rounded-3xl shadow-premium bg-white hover-lift transition-premium">
              <CardHeader className="p-8">
                <CardTitle className="flex items-center gap-3 text-2xl tracking-tight">
                  <MessageSquare className="size-6 flex-shrink-0" />
                  Can I use this for clinical diagnosis?
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-gray-600 text-lg font-light leading-relaxed">
                No. HealthGuard AI is a preliminary screening tool only, not a diagnostic device. It's designed to assist healthcare workers in remote areas, but final diagnosis must be made by qualified medical professionals.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Premium Support Hours */}
        <Card className="mt-16 border-gray-200/60 bg-white rounded-3xl shadow-premium-lg">
          <CardContent className="p-12">
            <div className="flex items-center justify-center gap-16 flex-wrap">
              <div className="flex items-center gap-5">
                <div className="size-16 bg-black rounded-2xl flex items-center justify-center shadow-premium">
                  <Clock className="size-8 text-white" />
                </div>
                <div>
                  <p className="text-xl font-semibold mb-1">Support Hours</p>
                  <p className="text-gray-600 text-lg font-light">Monday - Friday: 9AM - 6PM IST</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="size-16 bg-black rounded-2xl flex items-center justify-center shadow-premium">
                  <MessageSquare className="size-8 text-white" />
                </div>
                <div>
                  <p className="text-xl font-semibold mb-1">Response Time</p>
                  <p className="text-gray-600 text-lg font-light">Usually within 24 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}