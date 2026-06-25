import { useState } from 'react';
import { User as UserIcon, Phone, MapPin, AlertCircle, FileText, Calendar, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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

  return (
    <div className="min-h-[calc(100vh-6rem)] py-6 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }}></div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-6 animate-fade-in">
          <div className="size-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-premium">
            <UserIcon className="size-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl mb-2 tracking-tight">Complete Your Profile</h1>
          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto font-light">
            We need some basic information to provide personalized medical screening.
          </p>
        </div>

        <Card className="border-gray-200/60 shadow-premium-lg bg-white animate-scale-in rounded-2xl">
          <CardHeader className="border-b border-gray-100 p-6 pb-4">
            <CardTitle className="text-xl tracking-tight">Patient Information</CardTitle>
            <CardDescription className="text-sm font-light">
              All information is kept secure and confidential.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="size-7 bg-black rounded-lg flex items-center justify-center">
                    <UserIcon className="size-4 text-white" />
                  </div>
                  <h3 className="text-lg tracking-tight font-semibold">Personal Information</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="h-10 border-gray-300 rounded-lg text-sm transition-premium focus:border-black"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-sm font-medium">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      className="h-10 border-gray-300 rounded-lg text-sm transition-premium focus:border-black"
                      required
                      min="1"
                      max="120"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                    required
                  >
                    <SelectTrigger id="gender" className="h-10 border-gray-300 rounded-lg text-sm">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="size-7 bg-black rounded-lg flex items-center justify-center">
                    <Phone className="size-4 text-white" />
                  </div>
                  <h3 className="text-lg tracking-tight font-semibold">Contact Information</h3>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="h-10 border-gray-300 rounded-lg text-sm transition-premium focus:border-black"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="border-gray-300 min-h-20 rounded-lg text-sm transition-premium focus:border-black"
                    required
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact Number *</Label>
                  <Input
                    id="emergencyContact"
                    type="tel"
                    placeholder="Enter emergency contact number"
                    value={formData.emergencyContact}
                    onChange={(e) => handleChange('emergencyContact', e.target.value)}
                    className="h-10 border-gray-300 rounded-lg text-sm transition-premium focus:border-black"
                    required
                  />
                </div>
              </div>

              {/* Medical History Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="size-7 bg-black rounded-lg flex items-center justify-center">
                    <FileText className="size-4 text-white" />
                  </div>
                  <h3 className="text-lg tracking-tight font-semibold">Medical History</h3>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="medicalHistory" className="text-sm font-medium">
                    Previous Medical Conditions (Optional)
                  </Label>
                  <Textarea
                    id="medicalHistory"
                    placeholder="Any chronic conditions, allergies, previous surgeries, or current medications..."
                    value={formData.medicalHistory}
                    onChange={(e) => handleChange('medicalHistory', e.target.value)}
                    className="border-gray-300 min-h-24 rounded-lg text-sm transition-premium focus:border-black"
                    rows={3}
                  />
                  <p className="text-gray-500 font-light text-xs">
                    This information helps us provide better recommendations
                  </p>
                </div>
              </div>

              {/* Premium Privacy Notice */}
              <div className="bg-gray-100 rounded-xl p-4 flex gap-3 border border-gray-200/60">
                <div className="size-9 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="size-5 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Privacy & Security</p>
                  <p className="text-gray-600 leading-relaxed text-xs font-light">
                    Your personal and medical information is encrypted and stored securely. We never share your data with third parties.
                  </p>
                </div>
              </div>

              {/* Premium Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-900 text-white h-11 text-sm rounded-xl shadow-premium hover:shadow-premium-lg transition-premium font-medium"
                >
                  Continue to Analysis
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Premium Information Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8 mb-4">
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
            <div key={index} className="bg-white rounded-xl p-4 border border-gray-200/60 hover-lift shadow-sm">
              <div className="size-10 bg-black rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <item.icon className="size-5 text-white" />
              </div>
              <h4 className="text-sm mb-1 font-semibold">{item.title}</h4>
              <p className="text-gray-600 text-xs font-light leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}