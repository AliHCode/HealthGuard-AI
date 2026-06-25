import { useState } from 'react';
import { User as UserIcon, Phone, MapPin, AlertCircle, FileText, Calendar, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'framer-motion';
import type { User, PatientDetails } from '../App';

interface PatientDetailsFormProps {
  onSubmit: (details: PatientDetails) => void;
  user: User;
}

export function PatientDetailsForm({ onSubmit, user }: PatientDetailsFormProps) {
  const [formData, setFormData] = useState<PatientDetails>({
    fullName: user.name || '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    emergencyContact: '',
    medicalHistory: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof PatientDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-6 relative overflow-hidden text-white pt-24">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 size-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 size-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center mb-10"
        >
          <div className="size-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <UserIcon className="size-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl mb-4 tracking-tighter font-bold">Complete Your Profile</h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
            We need some basic information to provide personalized medical screening.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 p-8">
              <CardTitle className="text-2xl tracking-tight text-white font-bold">Patient Information</CardTitle>
              <CardDescription className="text-base font-light text-white/50">
                All information is kept secure and confidential.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="size-8 bg-white/10 rounded-xl flex items-center justify-center">
                      <UserIcon className="size-4 text-white" />
                    </div>
                    <h3 className="text-lg tracking-tight font-bold text-white">Personal Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-white/80">Full Name *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium text-white/80">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter your age"
                        value={formData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                        required
                        min="1"
                        max="120"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-white/80">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                      required
                    >
                      <SelectTrigger id="gender" className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:border-white/30">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="size-8 bg-white/10 rounded-xl flex items-center justify-center">
                      <Phone className="size-4 text-white" />
                    </div>
                    <h3 className="text-lg tracking-tight font-bold text-white">Contact Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-white/80">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-sm font-medium text-white/80">Emergency Contact *</Label>
                      <Input
                        id="emergencyContact"
                        type="tel"
                        placeholder="Enter emergency contact number"
                        value={formData.emergencyContact}
                        onChange={(e) => handleChange('emergencyContact', e.target.value)}
                        className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-white/80">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 min-h-[100px]"
                      required
                      rows={3}
                    />
                  </div>
                </div>

                {/* Medical History Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="size-8 bg-white/10 rounded-xl flex items-center justify-center">
                      <FileText className="size-4 text-white" />
                    </div>
                    <h3 className="text-lg tracking-tight font-bold text-white">Medical History</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory" className="text-sm font-medium text-white/80">
                      Previous Medical Conditions (Optional)
                    </Label>
                    <Textarea
                      id="medicalHistory"
                      placeholder="Any chronic conditions, allergies, previous surgeries, or current medications..."
                      value={formData.medicalHistory}
                      onChange={(e) => handleChange('medicalHistory', e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 min-h-[120px]"
                      rows={4}
                    />
                    <p className="text-white/40 font-light text-sm mt-2">
                      This information helps us provide better recommendations
                    </p>
                  </div>
                </div>

                {/* Premium Privacy Notice */}
                <div className="bg-white/5 rounded-2xl p-5 flex gap-4 border border-white/10 mt-8">
                  <div className="size-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="size-5 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-white">Privacy & Security</p>
                    <p className="text-white/50 leading-relaxed text-sm font-light">
                      Your personal and medical information is encrypted and stored securely. We never share your data with third parties.
                    </p>
                  </div>
                </div>

                {/* Premium Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-white hover:bg-white/90 text-black h-14 text-lg rounded-xl shadow-lg shadow-white/10 transition-all font-bold"
                  >
                    Continue to Analysis
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Premium Information Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mt-10 mb-8"
        >
          {[
            {
              icon: Calendar,
              title: 'One-Time Setup',
              description: 'Complete once, access instantly'
            },
            {
              icon: AlertCircle,
              title: 'Always Editable',
              description: 'Update anytime from settings'
            },
            {
              icon: FileText,
              title: 'Medical Records',
              description: 'Access your history anytime'
            }
          ].map((item, index) => (
            <div key={index} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/[0.02] transition-colors shadow-lg">
              <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <item.icon className="size-6 text-white" />
              </div>
              <h4 className="text-base mb-2 font-bold text-white">{item.title}</h4>
              <p className="text-white/50 text-sm font-light leading-relaxed">{item.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}