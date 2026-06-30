import { useState } from 'react';
import { User as UserIcon, Phone, MapPin, AlertCircle, FileText, Calendar, Shield, Clipboard, ArrowRight, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { User, PatientDetails } from '../App';

interface PatientDetailsFormProps {
  onSubmit: (details: PatientDetails) => void;
  user: User;
}

export function PatientDetailsForm({ onSubmit, user }: PatientDetailsFormProps) {
  const isDoctor = user.role === 'doctor' || user.role === 'asha_worker';
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<PatientDetails>({
    fullName: user.name || '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    emergencyContact: '',
    medicalHistory: ''
  });

  const handleChange = (field: keyof PatientDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep((prev) => (prev + 1) as any);
  };

  const handlePrev = () => {
    if (step > 1) setStep((prev) => (prev - 1) as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Calculate dynamic progress index (percentage of completed fields)
  const fields = isDoctor 
    ? ['fullName', 'age', 'gender', 'phone', 'address', 'emergencyContact'] 
    : ['fullName', 'age', 'gender', 'phone', 'address', 'emergencyContact', 'weight'];
  const filledFieldsCount = fields.filter(f => (formData[f as keyof PatientDetails] || '') !== '').length;
  const progressPercent = Math.round((filledFieldsCount / fields.length) * 100);

  // SVG Progress Ring Parameters
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8 px-6 bg-white relative overflow-hidden text-left">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none opacity-[0.4]" />

      <div className="container mx-auto max-w-6xl relative z-10 space-y-8">
        
        {/* Header Block */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Clipboard className="size-3.5" />
            {isDoctor ? 'Clinician Credential Clipboard' : 'Clinical Intake Clipboard'}
          </div>
          <h1 className="text-lg font-bold tracking-tight text-black">
            {isDoctor ? 'Complete Clinician Profile' : 'Complete Patient Profile'}
          </h1>
          <p className="text-sm text-black/50 max-w-xl mx-auto leading-relaxed">
            {isDoctor 
              ? 'Fill out your professional details to compile your registered credentials card.' 
              : 'Fill out your details on the interactive clipboard to compile your clinical screening card.'}
          </p>
        </div>

        {/* Workspace: Clipboard Left & Live Card Preview Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Multistep Clinical Clipboard Form (7 Columns) */}
          <div className="lg:col-span-7">
            <Card className="overflow-hidden relative">
              {/* Top Progress Block */}
              <div className="p-6 pb-4 bg-slate-50/50 border-b border-black/[0.04] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">
                    {isDoctor ? 'Profile Progress' : 'Intake Progress'}
                  </span>
                  <CardTitle style={{ fontSize: '14px', fontWeight: 600 }} className="text-[#0f172a] mt-0.5">
                    Step {step} of 3: {step === 1 ? (isDoctor ? 'Clinician Bio' : 'Bio Credentials') : step === 2 ? (isDoctor ? 'Professional Details' : 'Contact Vectors') : (isDoctor ? 'Specialization & Bio' : 'Medical Background')}
                  </CardTitle>
                </div>
                
                {/* SVG Progress Ring */}
                <div className="relative size-12 flex items-center justify-center select-none">
                  <svg className="size-full transform -rotate-90">
                    <circle cx="24" cy="24" r={radius} stroke="rgba(0,0,0,0.03)" strokeWidth="3" fill="transparent" />
                    <circle 
                      cx="24" cy="24" r={radius} 
                      stroke="#000000" strokeWidth="3" fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-extrabold text-black">{progressPercent}%</span>
                </div>
              </div>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <AnimatePresence mode="wait">
                    
                    {/* STEP 1: Bio Credentials */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-black/50">
                            {isDoctor ? 'Full Clinician Name *' : 'Full Patient Name *'}
                          </Label>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/30" />
                            <Input
                              id="fullName"
                              type="text"
                              placeholder={isDoctor ? "Dr. Jenkins" : "Samuel Jenkins"}
                              value={formData.fullName}
                              onChange={(e) => handleChange('fullName', e.target.value)}
                              className="pl-11 h-11 border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="age" className="text-xs font-semibold uppercase tracking-wider text-black/50">
                              {isDoctor ? 'Clinician Age *' : 'Patient Age *'}
                            </Label>
                            <Input
                              id="age"
                              type="number"
                              placeholder="e.g. 38"
                              value={formData.age}
                              onChange={(e) => handleChange('age', e.target.value)}
                              className="h-11 border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                              required
                              min="1"
                              max="120"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight" className="text-xs font-semibold uppercase tracking-wider text-black/50">
                              {isDoctor ? 'Clinician Weight (kg)' : 'Patient Weight (kg) *'}
                            </Label>
                            <Input
                              id="weight"
                              type="number"
                              placeholder="e.g. 65"
                              value={formData.weight || ''}
                              onChange={(e) => handleChange('weight', e.target.value)}
                              className="h-11 border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                              required={!isDoctor}
                              min="1"
                              max="250"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-black/50">Gender Identity *</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Male', 'Female', 'Other', 'Declined'].map((g) => {
                              const isSelected = formData.gender.toLowerCase() === g.toLowerCase();
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => handleChange('gender', g.toLowerCase())}
                                  className={`h-11 px-4 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                                    isSelected 
                                      ? 'border-black bg-black text-white shadow-elegant' 
                                      : 'border-black/[0.06] bg-white text-black/60 hover:border-black/20 hover:text-black'
                                  }`}
                                >
                                  {g}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: Contact Vectors */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-black/50">
                              {isDoctor ? 'Contact Number *' : 'Phone Number *'}
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/30" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+92 300-1234567"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="pl-11 h-11 border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="emergencyContact" className="text-xs font-semibold uppercase tracking-wider text-black/50">
                              {isDoctor ? 'License / Reg Number *' : 'Emergency Contact Number *'}
                            </Label>
                            <Input
                              id="emergencyContact"
                              type="text"
                              placeholder={isDoctor ? "e.g. PMC-98231-D" : "+1 555-0122"}
                              value={formData.emergencyContact}
                              onChange={(e) => handleChange('emergencyContact', e.target.value)}
                              className="h-11 border-black/10 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-black/50">
                            {isDoctor ? 'Clinic / Hospital Address *' : 'Complete Residential Address *'}
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-4 size-4 text-black/30" />
                            <Textarea
                              id="address"
                              placeholder={isDoctor ? "Department of Pulmonology, Allied Hospital, Taxila" : "Street address, city, state, postal code"}
                              value={formData.address}
                              onChange={(e) => handleChange('address', e.target.value)}
                              className="pl-11 border-black/10 min-h-20 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                              required
                              rows={2}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Medical History */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="medicalHistory" className="text-xs font-semibold uppercase tracking-wider text-black/50">
                            {isDoctor ? 'Clinician Biography & Specialization (Optional)' : 'Chronic Conditions or Past History (Optional)'}
                          </Label>
                          <div className="relative">
                            <FileText className="absolute left-4 top-4 size-4 text-black/30" />
                            <Textarea
                              id="medicalHistory"
                              placeholder={isDoctor ? "Specify credentials, years of clinical experience, specialization area..." : "Specify allergies, chronic conditions, current medication dosages, or past surgeries..."}
                              value={formData.medicalHistory}
                              onChange={(e) => handleChange('medicalHistory', e.target.value)}
                              className="pl-11 border-black/10 min-h-28 rounded-xl transition-all duration-300 focus:border-black/30 focus:ring-1 focus:ring-black/10 bg-white text-black text-sm"
                              rows={4}
                            />
                          </div>
                        </div>

                        {/* Privacy Shield */}
                        <div className="bg-slate-50 border border-black/[0.05] rounded-xl p-4 flex gap-3.5 items-start">
                          <div className="size-8 bg-black rounded-lg flex items-center justify-center shrink-0 border border-black/5 text-white">
                            <Shield className="size-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-black">
                              {isDoctor ? 'Clinician Credential Agreement' : 'Confidential Intake Agreement'}
                            </h4>
                            <p className="text-[9.5px] text-black/45 leading-relaxed">
                              {isDoctor 
                                ? 'Your credential details are stored to authorize screening reports. The digital signature generated complies with clinical handover standards.'
                                : 'Your clinical details are protected with symmetric database encryption. Stored solely to facilitate diagnostic reporting and clinical PDF downloads.'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Wizard control buttons */}
                  <div className="pt-4 border-t border-black/[0.04] flex gap-3">
                    {step > 1 && (
                      <Button
                        type="button"
                        onClick={handlePrev}
                        variant="outline"
                        className="flex-1 border border-black/10 hover:bg-slate-50 h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="size-3.5" />
                        Previous Step
                      </Button>
                    )}
                    
                    {step < 3 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 bg-black hover:bg-black/90 text-white h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-elegant ml-auto"
                      >
                        Next Step
                        <ArrowRight className="size-3.5" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={progressPercent < 100}
                        className="flex-1 bg-black hover:bg-black/90 text-white h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-elegant disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isDoctor ? 'Proceed to Clinician Console' : 'Proceed to Sandboxes'}
                        <CheckCircle2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right: Live Clinical ID Card Preview (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-black/40">
              {isDoctor ? 'Clinician Credentials Preview' : 'Clinical Profile Card Preview'}
            </div>
            
            {/* The Medical Badge Card Visual (WOW Factor) */}
            <div className="border border-black/[0.08] shadow-elegant-xl rounded-2xl bg-slate-900 text-white p-6 relative overflow-hidden min-h-[220px] flex flex-col justify-between group select-none">
              {/* Glowing gradient backdrops */}
              <div className="absolute top-[-20%] right-[-20%] size-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-colors duration-500" />
              <div className="absolute bottom-[-10%] left-[-10%] size-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4 relative z-10 text-left">
                {/* Card Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="size-4.5 text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">
                      {isDoctor ? 'Registered Clinician Card' : 'Diagnostic Member Card'}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono bg-white/10 border border-white/10 px-2 py-0.5 rounded text-white/60">
                    Active Session
                  </span>
                </div>

                {/* Patient Credentials */}
                <div className="py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-white/40 block">
                          {isDoctor ? 'Clinician Name' : 'Patient Name'}
                        </span>
                        <span className="text-base font-bold text-white tracking-tight h-5 block">
                          {formData.fullName || '---'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-white/40 block">Age / Gender</span>
                          <span className="text-xs font-bold text-white h-4 block">
                            {formData.age ? `${formData.age}yo` : '---'} / <span className="capitalize">{formData.gender || '---'}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-white/40 block">
                            {isDoctor ? 'License ID' : 'Contact Vector'}
                          </span>
                          <span className="text-xs font-mono font-bold text-white/90 h-4 block">
                            {isDoctor ? (formData.emergencyContact || '---') : (formData.phone || '---')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* High-tech Smart Chip and Barcode Visual (WOW Factor) */}
                    <div className="flex flex-col items-center gap-2.5 shrink-0 pt-1">
                      {/* Smart Chip SVG */}
                      <svg className="size-8.5 text-amber-400" viewBox="0 0 40 40" fill="currentColor">
                        <rect x="2" y="2" width="36" height="36" rx="6" fill="url(#chipGradient)" />
                        <rect x="8" y="8" width="24" height="24" rx="4" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.4" />
                        <line x1="8" y1="20" x2="32" y2="20" stroke="#fff" strokeWidth="1" strokeOpacity="0.4" />
                        <line x1="20" y1="8" x2="20" y2="32" stroke="#fff" strokeWidth="1" strokeOpacity="0.4" />
                        <line x1="14" y1="14" x2="26" y2="26" stroke="#fff" strokeWidth="1" strokeOpacity="0.4" />
                        <defs>
                          <linearGradient id="chipGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Stylized pulse barcode */}
                      <div className="flex gap-0.5 h-5 items-end opacity-40 group-hover:opacity-75 transition-opacity duration-500">
                        <div className="w-[1px] h-full bg-white"></div>
                        <div className="w-[2px] h-3 bg-white"></div>
                        <div className="w-[1px] h-full bg-white"></div>
                        <div className="w-[2.5px] h-4 bg-white"></div>
                        <div className="w-[1px] h-2 bg-white"></div>
                        <div className="w-[1.5px] h-full bg-white"></div>
                        <div className="w-[1px] h-3 bg-white"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end border-t border-white/10 pt-3 text-left relative z-10">
                <div>
                  <span className="text-[7px] uppercase tracking-wider text-white/30 block">
                    {isDoctor ? 'Clinical Facility Location' : 'Assigned Node Location'}
                  </span>
                  <span className="text-[9px] font-bold text-white/70">
                    {isDoctor ? (formData.address || 'District Clinic Wing') : 'District Clinic Wing'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] uppercase tracking-wider text-white/30 block">ID Hash</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400">
                    {isDoctor ? `DOC-${user.id.slice(0,6).toUpperCase()}` : `HG-${user.id.slice(0,6).toUpperCase()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification checklist widget */}
            <Card className="border border-black/[0.06] bg-slate-50/50 p-4.5 rounded-2xl space-y-3 text-xs">
              <span style={{ fontSize: '14px', fontWeight: 600 }} className="text-[#0f172a] block">Required Validation Checklist</span>
              <div className="space-y-2">
                {[
                  { 
                    label: isDoctor ? 'Register Biography Credentials (Name, Age, Gender)' : 'Register Bio Credentials (Name, Age, Gender, Weight)', 
                    ok: isDoctor 
                      ? (formData.fullName !== '' && formData.age !== '' && formData.gender !== '')
                      : (formData.fullName !== '' && formData.age !== '' && formData.gender !== '' && (formData.weight || '') !== '') 
                  },
                  { 
                    label: isDoctor ? 'Register Professional Details (Phone, Clinic, License)' : 'Register Contact Vectors (Phone, Address, Emergency)', 
                    ok: formData.phone !== '' && formData.address !== '' && formData.emergencyContact !== '' 
                  },
                  { 
                    label: isDoctor ? 'Compile Clinician Card (100% completed)' : 'Compile Patient Diagnostic Card (100% completed)', 
                    ok: progressPercent === 100 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`size-4 rounded-full flex items-center justify-center shrink-0 border ${
                      item.ok 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-black/10 text-transparent'
                    }`}>
                      <CheckCircle2 className="size-3" />
                    </div>
                    <span className={`text-[11px] font-medium leading-tight ${item.ok ? 'text-black/85' : 'text-black/40'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}