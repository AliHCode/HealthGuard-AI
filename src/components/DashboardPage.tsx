import { useState, useEffect } from 'react';
import { 
  Users, Activity, ClipboardList, ShieldAlert, Search, PlusCircle, 
  Download, FileText, ChevronRight, TrendingUp, CheckCircle, Clock,
  MapPin, AlertCircle, ArrowRight, UserPlus, Filter, Share2, Globe, Heart, Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabase';
import type { User, PatientDetails, AnalysisResult } from '../App';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';

interface DashboardPageProps {
  user: User;
  onNavigate: (page: any) => void;
  onSelectPatientAnalysis: (patient: PatientDetails, result: AnalysisResult) => void;
}

// Simulated rich patient database for clinical demo
const initialPatients = [
  {
    id: '1',
    fullName: 'Ramesh Kumar',
    age: '45',
    gender: 'Male',
    phone: '+91 98765 43210',
    address: 'Varanasi, Uttar Pradesh',
    emergencyContact: 'Sita Kumar (+91 98765 43211)',
    medicalHistory: 'Chronic smoker, mild asthma history',
    lastScreening: {
      disease: 'pneumonia',
      detected: true,
      confidence: 89.4,
      severity: 'Severe',
      timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      originalImage: 'https://images.unsplash.com/photo-1584555684040-bad07f46a21f?q=80&w=200',
    }
  },
  {
    id: '2',
    fullName: 'Anjali Sharma',
    age: '28',
    gender: 'Female',
    phone: '+91 99123 45678',
    address: 'Buxar, Bihar',
    emergencyContact: 'Vijay Sharma (+91 99123 45679)',
    medicalHistory: 'No major history, presented with high fever',
    lastScreening: {
      disease: 'malaria',
      detected: true,
      confidence: 96.2,
      severity: 'Moderate',
      timestamp: new Date(Date.now() - 3600000 * 5), // 5 hours ago
      originalImage: 'https://images.unsplash.com/photo-1579165466541-7170a926e580?q=80&w=200',
    }
  },
  {
    id: '3',
    fullName: 'Sunita Devi',
    age: '52',
    gender: 'Female',
    phone: '+91 94455 66778',
    address: 'Sonipat, Haryana',
    emergencyContact: 'Rakesh Devi (+91 94455 66779)',
    medicalHistory: 'Hypertension under control',
    lastScreening: {
      disease: 'pneumonia',
      detected: false,
      confidence: 98.7,
      severity: undefined,
      timestamp: new Date(Date.now() - 3600000 * 24), // 1 day ago
      originalImage: 'https://images.unsplash.com/photo-1584555684040-bad07f46a21f?q=80&w=200',
    }
  },
  {
    id: '4',
    fullName: 'Kabir Singh',
    age: '34',
    gender: 'Male',
    phone: '+91 91234 56789',
    address: 'Rohtak, Haryana',
    emergencyContact: 'Pooja Singh (+91 91234 56780)',
    medicalHistory: 'None',
    lastScreening: {
      disease: 'malaria',
      detected: false,
      confidence: 94.5,
      severity: undefined,
      timestamp: new Date(Date.now() - 3600000 * 48), // 2 days ago
      originalImage: 'https://images.unsplash.com/photo-1579165466541-7170a926e580?q=80&w=200',
    }
  }
];

// Rich clinical activity stats
const dailyTrendData = [
  { name: 'Mon', Pneumonia: 12, Malaria: 8 },
  { name: 'Tue', Pneumonia: 19, Malaria: 15 },
  { name: 'Wed', Pneumonia: 15, Malaria: 18 },
  { name: 'Thu', Pneumonia: 22, Malaria: 12 },
  { name: 'Fri', Pneumonia: 30, Malaria: 24 },
  { name: 'Sat', Pneumonia: 25, Malaria: 14 },
  { name: 'Sun', Pneumonia: 18, Malaria: 9 }
];

const severityDistribution = [
  { name: 'Mild', value: 14, color: '#10b981' },
  { name: 'Moderate', value: 28, color: '#f59e0b' },
  { name: 'Severe', value: 18, color: '#ef4444' }
];

export function DashboardPage({ user, onNavigate, onSelectPatientAnalysis }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState(initialPatients);
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Vernacular dictionary for ASHA Workers
  const trans = {
    en: {
      welcome: "ASHA Portal — Rural Health Command",
      desc: "Instant screening assistant for community health workers.",
      quickScan: "New Quick Scan",
      searchPatient: "Search Patients...",
      activePatients: "Screened Patients",
      all: "All",
      pos: "Positive Alert",
      neg: "Normal Scan",
      positive: "Detected",
      negative: "Normal",
      downloadReport: "Download PDF",
      medicalReferral: "Doctor Referral",
      emergencyContact: "Emergency:",
      location: "Location:",
      confidence: "Confidence",
      quickTip: "ASHA Tip: Chest X-rays should show clear rib definitions; blood smears require thin-film stains."
    },
    hi: {
      welcome: "आशा पोर्टल — ग्रामीण स्वास्थ्य कमान",
      desc: "सामुदायिक स्वास्थ्य कार्यकर्ताओं के लिए त्वरित स्क्रीनिंग सहायक।",
      quickScan: "नया त्वरित स्कैन",
      searchPatient: "मरीज़ खोजें...",
      activePatients: "जांचे गए मरीज़",
      all: "सभी",
      pos: "पॉजिटिव अलर्ट",
      neg: "सामान्य स्कैन",
      positive: "खोज हुई",
      negative: "सामान्य",
      downloadReport: "पीडीएफ रिपोर्ट",
      medicalReferral: "डॉक्टर रेफरल",
      emergencyContact: "आपातकालीन:",
      location: "स्थान:",
      confidence: "विश्वास दर",
      quickTip: "आशा टिप: छाती के एक्स-रे में पसलियां स्पष्ट दिखनी चाहिए; ब्लड स्मीयर में पतला दाग होना चाहिए।"
    }
  }[language];

  // Filtering logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.phone.includes(searchQuery) ||
                          p.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'positive') return matchesSearch && p.lastScreening.detected;
    if (filterType === 'negative') return matchesSearch && !p.lastScreening.detected;
    return matchesSearch;
  });

  const handleCreatePatient = () => {
    // Navigate to patient details form to create a new patient session
    onNavigate('patient-details');
  };

  const selectPatientResult = (patient: any) => {
    const details: PatientDetails = {
      fullName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      medicalHistory: patient.medicalHistory
    };

    const result: AnalysisResult = {
      disease: patient.lastScreening.disease,
      detected: patient.lastScreening.detected,
      confidence: patient.lastScreening.confidence,
      severity: patient.lastScreening.severity,
      originalImage: patient.lastScreening.originalImage,
      processedImage: patient.lastScreening.originalImage,
      timestamp: patient.lastScreening.timestamp,
      patientDetails: details
    };

    onSelectPatientAnalysis(details, result);
  };

  if (user.role === 'doctor') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Clinical Dashboard</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Welcome, Dr. {user.name}
              </h1>
              <p className="text-slate-400 text-sm mt-1">HealthGuard AI Elite Hospital Analytics & Diagnostics Hub</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={handleCreatePatient} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-2.5 shadow-emerald-900/30 shadow-lg">
                <UserPlus className="size-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-xl text-white relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 text-sm">Total Screened</span>
                  <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Users className="size-5 text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold">148</div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs mt-2">
                  <TrendingUp className="size-3" />
                  <span>+12.4% this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-xl text-white relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 text-sm">Pneumonia Scans</span>
                  <div className="size-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Activity className="size-5 text-indigo-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold">89</div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
                  <span>Average confidence: 95.8%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-xl text-white relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 text-sm">Malaria Smears</span>
                  <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Heart className="size-5 text-red-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold">59</div>
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
                  <span>9 positive cases flagged</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-xl text-white relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 text-sm">Urgent Referrals</span>
                  <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <ShieldAlert className="size-5 text-amber-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-400">4</div>
                <div className="flex items-center gap-1.5 text-amber-400 text-xs mt-2">
                  <AlertCircle className="size-3 animate-bounce" />
                  <span>Awaiting physician sign-off</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphs & Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-2 bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-xl text-white">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Screening Trends</CardTitle>
                <CardDescription className="text-slate-400">Volume tracking for Malaria vs Pneumonia cases</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPneu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Legend />
                    <Area type="monotone" dataKey="Pneumonia" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPneu)" />
                    <Area type="monotone" dataKey="Malaria" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorMal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-xl text-white">
              <CardHeader>
                <CardTitle className="text-lg">AI Severity Classification</CardTitle>
                <CardDescription className="text-slate-400">Positive case distribution index</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex flex-col justify-between">
                <ResponsiveContainer width="100%" height="65%">
                  <BarChart data={severityDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Mild Cases</span>
                    <span className="font-bold">14 pts (28%)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>Moderate Cases</span>
                    <span className="font-bold">28 pts (56%)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>Severe Cases</span>
                    <span className="font-bold">18 pts (36%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patients list & screening log */}
          <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-xl text-white">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Patient Diagnostics Registry</CardTitle>
                <CardDescription className="text-slate-400">Search and review patient records and heatmaps</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input 
                    placeholder="Search name, phone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-850 h-10 rounded-full text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-full">
                  <Button variant="ghost" size="sm" onClick={() => setFilterType('all')} className={`h-8 rounded-full text-xs ${filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>All</Button>
                  <Button variant="ghost" size="sm" onClick={() => setFilterType('positive')} className={`h-8 rounded-full text-xs ${filterType === 'positive' ? 'bg-red-500/20 text-red-400' : 'text-slate-400'}`}>Positive Alerts</Button>
                  <Button variant="ghost" size="sm" onClick={() => setFilterType('negative')} className={`h-8 rounded-full text-xs ${filterType === 'negative' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}>Normal</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-sm">
                      <th className="py-4 px-4 font-semibold">Patient Name</th>
                      <th className="py-4 px-4 font-semibold">Age/Gender</th>
                      <th className="py-4 px-4 font-semibold">Assigned Clinic</th>
                      <th className="py-4 px-4 font-semibold">Diagnostic Target</th>
                      <th className="py-4 px-4 font-semibold">AI Decision</th>
                      <th className="py-4 px-4 font-semibold">Confidence</th>
                      <th className="py-4 px-4 font-semibold">Scan Date</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-4 px-4 font-medium flex items-center gap-3">
                          <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                            {patient.fullName[0]}
                          </div>
                          <div>
                            <div className="text-slate-200 font-semibold">{patient.fullName}</div>
                            <div className="text-slate-500 text-xs">{patient.phone}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          {patient.age} yrs / {patient.gender}
                        </td>
                        <td className="py-4 px-4 text-slate-400 flex items-center gap-1">
                          <MapPin className="size-3.5 text-slate-500" />
                          {patient.address.split(',')[0]}
                        </td>
                        <td className="py-4 px-4">
                          <span className="capitalize">{patient.lastScreening.disease}</span>
                        </td>
                        <td className="py-4 px-4">
                          {patient.lastScreening.detected ? (
                            <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-medium">
                              {patient.lastScreening.severity || 'Detected'}
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                              Normal
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-200">
                          {patient.lastScreening.confidence}%
                        </td>
                        <td className="py-4 px-4 text-slate-400">
                          {patient.lastScreening.timestamp.toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => selectPatientResult(patient)}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full"
                          >
                            Clinical View
                            <ArrowRight className="size-3.5 ml-1.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredPatients.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ASHA Worker Simplified Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Elite ASHA Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-blue-200 animate-spin-slow" />
              <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">{trans.welcome}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{trans.welcome}</h1>
            <p className="text-indigo-100 text-sm max-w-xl">{trans.desc}</p>
          </div>
          
          <div className="flex flex-wrap gap-3 z-10">
            {/* Language Switch */}
            <div className="bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/10 flex">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLanguage('en')}
                className={`rounded-full h-8 px-4 text-xs font-bold ${language === 'en' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/10'}`}
              >
                English
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLanguage('hi')}
                className={`rounded-full h-8 px-4 text-xs font-bold ${language === 'hi' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/10'}`}
              >
                हिन्दी
              </Button>
            </div>

            <Button 
              onClick={handleCreatePatient} 
              className="bg-white text-blue-900 hover:bg-blue-50 font-black rounded-full h-11 px-6 shadow-md shadow-blue-950/20"
            >
              <PlusCircle className="size-4 mr-2" />
              {trans.quickScan}
            </Button>
          </div>
          
          {/* Subtle Background Glows */}
          <div className="absolute -right-16 -top-16 size-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-16 -bottom-16 size-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Informative notification banner */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm font-medium">{trans.quickTip}</p>
        </div>

        {/* Content grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left panel: Quick Diagnostics Actions */}
          <div className="md:col-span-1 space-y-6">
            <Card className="rounded-2xl border-none shadow-md bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">ASHA Quick Tasks</CardTitle>
                <CardDescription className="text-slate-500">Essential field actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleCreatePatient} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 flex items-center justify-between px-5 font-bold shadow-md shadow-blue-600/10"
                >
                  <span className="flex items-center gap-3">
                    <Activity className="size-5" />
                    New Screening
                  </span>
                  <ChevronRight className="size-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.open('tel:+91102')}
                  className="w-full border-red-200 hover:bg-red-50 text-red-600 rounded-xl h-14 flex items-center justify-between px-5 font-bold"
                >
                  <span className="flex items-center gap-3">
                    <Phone className="size-5" />
                    Call Ambulance (102)
                  </span>
                  <ChevronRight className="size-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-md bg-white p-6 space-y-4">
              <h3 className="font-extrabold text-slate-800">Field Activity Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-black text-slate-800">12</div>
                  <div className="text-xs text-slate-500 uppercase font-semibold mt-1">This Week</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-black text-red-600">3</div>
                  <div className="text-xs text-red-500 uppercase font-semibold mt-1">Refers Flagged</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right panel: Search and Screened Patients List */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input 
                  placeholder={trans.searchPatient}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 border-none rounded-full text-sm placeholder:text-slate-400 text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-600"
                />
              </div>

              <div className="flex bg-slate-100 p-0.5 rounded-full w-full sm:w-auto">
                <Button variant="ghost" size="sm" onClick={() => setFilterType('all')} className={`flex-1 sm:flex-initial h-9 rounded-full text-xs font-bold ${filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>{trans.all}</Button>
                <Button variant="ghost" size="sm" onClick={() => setFilterType('positive')} className={`flex-1 sm:flex-initial h-9 rounded-full text-xs font-bold ${filterType === 'positive' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'}`}>{trans.pos}</Button>
                <Button variant="ghost" size="sm" onClick={() => setFilterType('negative')} className={`flex-1 sm:flex-initial h-9 rounded-full text-xs font-bold ${filterType === 'negative' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500'}`}>{trans.neg}</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-800 pl-1">{trans.activePatients}</h2>
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="rounded-2xl border-none shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-extrabold text-lg text-slate-800">{patient.fullName}</h4>
                        <Badge className={`rounded-full px-3 py-1 font-bold text-xs ${
                          patient.lastScreening.detected 
                            ? 'bg-red-100 text-red-700 hover:bg-red-100' 
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        }`}>
                          {patient.lastScreening.detected ? trans.positive : trans.negative}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-500">
                        <div>
                          <strong>{trans.location}</strong> {patient.address}
                        </div>
                        <div>
                          <strong>{trans.emergencyContact}</strong> {patient.emergencyContact.split(' ')[0]}
                        </div>
                        <div>
                          <strong>{trans.confidence}:</strong> {patient.lastScreening.confidence}%
                        </div>
                        <div>
                          <strong>Age/Gender:</strong> {patient.age} / {patient.gender}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <Button 
                        onClick={() => selectPatientResult(patient)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold h-10 px-5 text-sm flex-1 sm:flex-initial"
                      >
                        Clinical Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-white rounded-2xl shadow-sm">
                  No records found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
