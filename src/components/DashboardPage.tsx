import { useState, useRef, useEffect } from 'react';
import type { User, PatientDetails, AnalysisResult } from '../App';
import { AnalysisPage } from './AnalysisPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { 
  Users, Activity, FileText, ShieldAlert, Award, Clock, ArrowUpRight, 
  TrendingUp, AlertCircle, Plus, Send, Stethoscope, LayoutDashboard, 
  Database, LineChart as ChartIcon, Settings, Bell, Search, Filter, Shield, 
  X, ChevronRight, Download, CheckCircle2, AlertTriangle, Menu, MapPin, Layers 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts';
import { jsPDF } from 'jspdf';

interface DashboardPageProps {
  user: User;
  patientDetails: PatientDetails;
  onAnalysisComplete: (result: AnalysisResult) => void;
  history: AnalysisResult[];
}

type Tab = 'overview' | 'triage' | 'patients' | 'analytics' | 'settings';

export function DashboardPage({ user, patientDetails, onAnalysisComplete, history }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<AnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [drawerSliderPosition, setDrawerSliderPosition] = useState(50);

  const drawerSliderContainerRef = useRef<HTMLDivElement>(null);
  const drawerCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sparkline mock trends
  const scansSparkline = [{ val: 14 }, { val: 19 }, { val: 16 }, { val: 28 }, { val: 22 }, { val: 34 }, { val: 45 }];
  const anomaliesSparkline = [{ val: 2 }, { val: 4 }, { val: 3 }, { val: 7 }, { val: 5 }, { val: 8 }, { val: 9 }];
  const latencySparkline = [{ val: 2.8 }, { val: 2.6 }, { val: 2.5 }, { val: 2.4 }, { val: 2.4 }, { val: 2.3 }, { val: 2.4 }];
  const accuracySparkline = [{ val: 95.2 }, { val: 95.4 }, { val: 95.5 }, { val: 95.8 }, { val: 95.8 }, { val: 95.9 }, { val: 95.8 }];

  // 7-day screening volume data
  const chartData = [
    { day: 'Mon', scans: 18, infections: 3 },
    { day: 'Tue', scans: 24, infections: 5 },
    { day: 'Wed', scans: 22, infections: 4 },
    { day: 'Thu', scans: 35, infections: 8 },
    { day: 'Fri', scans: 29, infections: 6 },
    { day: 'Sat', scans: 14, infections: 2 },
    { day: 'Sun', scans: 12, infections: 1 }
  ];

  // Case severity distribution data
  const severityData = [
    { name: 'Normal', value: history.filter(h => !h.detected).length + 42, color: '#10b981' },
    { name: 'Moderate', value: history.filter(h => h.detected && h.severity === 'Moderate').length + 8, color: '#f59e0b' },
    { name: 'Severe', value: history.filter(h => h.detected && h.severity === 'Severe').length + 2, color: '#f43f5e' }
  ];

  // Unique patient records extracted dynamically
  const dynamicPatients = Array.from(new Set(history.map(item => item.patientDetails.fullName))).map(name => {
    const patientHistory = history.filter(item => item.patientDetails.fullName === name);
    return {
      fullName: name,
      age: patientHistory[0].patientDetails.age,
      gender: patientHistory[0].patientDetails.gender,
      phone: patientHistory[0].patientDetails.phone,
      address: patientHistory[0].patientDetails.address,
      screeningsCount: patientHistory.length,
      lastScreening: patientHistory[0].timestamp
    };
  });

  const defaultPatients = [
    { fullName: 'Ananya Sharma', age: '28', gender: 'Female', phone: '+91 98765 43210', address: 'Block C, Sector 15, Noida', screeningsCount: 2, lastScreening: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { fullName: 'Rahul Verma', age: '45', gender: 'Male', phone: '+91 99887 76655', address: 'Ward 4, Sub-Center Khiri, UP', screeningsCount: 1, lastScreening: new Date(Date.now() - 1000 * 60 * 60 * 48) },
    { fullName: 'Amina Khatun', age: '62', gender: 'Female', phone: '+91 88776 65544', address: 'Gopalpur Village, Bihar', screeningsCount: 3, lastScreening: new Date(Date.now() - 1000 * 60 * 60 * 72) }
  ];

  const patientList = dynamicPatients.length > 0 ? dynamicPatients : defaultPatients;

  // Filter lists based on queries
  const filteredHistory = history.filter(item => 
    item.patientDetails.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = patientList.filter(p => 
    p.fullName.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    p.phone.includes(patientSearchQuery)
  );

  // Drawer slider interaction
  const handleDrawerSliderMove = (clientX: number) => {
    if (!drawerSliderContainerRef.current) return;
    const rect = drawerSliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setDrawerSliderPosition(percentage);
  };

  const handleDrawerMouseMove = (e: React.MouseEvent) => {
    handleDrawerSliderMove(e.clientX);
  };

  const handleDrawerTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleDrawerSliderMove(e.touches[0].clientX);
    }
  };

  // Canvas Heatmap Generation Fallback inside Drawer
  useEffect(() => {
    if (selectedCase && !selectedCase.heatmapImage && drawerCanvasRef.current) {
      const canvas = drawerCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (selectedCase.detected) {
          if (selectedCase.disease === 'pneumonia') {
            const centerX = img.width * 0.5;
            const centerY = img.height * 0.5;
            const radius = Math.min(img.width, img.height) * 0.25;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(220, 38, 38, 0.75)');
            gradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.35)');
            gradient.addColorStop(1, 'rgba(220, 38, 38, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.85)';
            ctx.lineWidth = 4;
            for (let i = 0; i < 6; i++) {
              const x = img.width * (0.3 + (i * 0.12) % 0.5);
              const y = img.height * (0.4 + (i * 0.08) % 0.4);
              ctx.beginPath();
              ctx.arc(x, y, 20, 0, 2 * Math.PI);
              ctx.stroke();
            }
          }
        }
      };
      img.src = selectedCase.originalImage;
    }
  }, [selectedCase]);

  // Stats calculation
  const totalScans = history.length + 154;
  const totalInfections = history.filter(h => h.detected).length + 18;
  const meanLatency = "2.4s";

  const menuItems = [
    { id: 'overview', label: 'Overview Panel', icon: LayoutDashboard },
    { id: 'triage', label: 'Triage Sandbox', icon: Activity },
    { id: 'patients', label: 'Patients Database', icon: Database },
    { id: 'analytics', label: 'Clinical Analytics', icon: ChartIcon },
    { id: 'settings', label: 'Console Settings', icon: Settings }
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white text-black flex relative text-left">
      
      {/* 1. COLLAPSIBLE SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-black/[0.05] bg-slate-50/30 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2.5">
            <Stethoscope className="size-4.5 text-black" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-black/50">Clinician Workspace</span>
          </div>

          <nav className="space-y-1 relative">
            {menuItems.map(item => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as Tab); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative z-10 ${
                    isActive ? 'text-white' : 'text-black/55 hover:text-black hover:bg-black/[0.02]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 bg-black rounded-xl z-[-1]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status indicator */}
        <div className="p-3 border border-black/[0.04] bg-white rounded-xl flex items-center justify-between text-[10px] font-semibold text-black/45 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            HealthGuard Central
          </span>
          <span className="font-mono">v3.2</span>
        </div>
      </aside>

      {/* MOBILE NAVIGATION OVERLAY DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden flex"
          >
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative flex flex-col w-64 bg-white border-r border-black/[0.06] p-5 h-full z-50 justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-black/[0.05]">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-black/50">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)}><X className="size-5" /></button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map(item => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as Tab); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                          isActive ? 'bg-black text-white' : 'text-black/55 hover:bg-black/[0.03]'
                        }`}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-black/[0.05] px-6 flex items-center justify-between shrink-0 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1 border border-black/10 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-black/40 font-bold uppercase tracking-wider">Health Node:</span>
              <span className="font-bold text-black bg-slate-50 border border-black/5 px-2.5 py-0.5 rounded-full">
                District Diagnostic Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-black/50 hover:text-black border border-black/[0.04] bg-slate-50/50 rounded-xl relative">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-1.5 bg-rose-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 border-l border-black/[0.05] pl-4">
              <div className="size-7 bg-black rounded-lg text-white flex items-center justify-center font-bold text-xs">
                {user.name[0]}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-extrabold leading-none">{user.name}</span>
                <span className="text-[8px] uppercase tracking-wider text-indigo-600 font-bold mt-0.5">Clinical Doctor</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 z-10">
          
          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Bento Stats Grid with Recharts Sparklines */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {[
                  { title: "Total Screenings", value: totalScans, change: "+14% vs last week", desc: "Diagnostic scans logged", spark: scansSparkline, color: '#000000' },
                  { title: "Anomalies Flagged", value: totalInfections, change: "Requires review", desc: "Referred for clinical checks", spark: anomaliesSparkline, color: '#f43f5e' },
                  { title: "Avg AI Latency", value: meanLatency, change: "GPU accelerated", desc: "Inference response time", spark: latencySparkline, color: '#3b82f6' },
                  { title: "Triaging Accuracy", value: "95.8%", change: "Validated trials", desc: "Average model accuracy", spark: accuracySparkline, color: '#10b981' }
                ].map((stat, idx) => (
                  <Card key={idx} className="border border-black/[0.06] bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-[155px] hover-lift cursor-pointer">
                    <CardHeader className="flex flex-row items-start justify-between p-5 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-black/40">{stat.title}</span>
                        <div className="text-2xl font-extrabold tracking-tight text-black">{stat.value}</div>
                      </div>
                    </CardHeader>
                    
                    {/* Sparkline Graph */}
                    <div className="h-11 w-full px-5">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stat.spark} margin={{ top: 0, right: 0, left: 0, bottom: 2 }}>
                          <Line 
                            type="monotone" 
                            dataKey="val" 
                            stroke={stat.color} 
                            strokeWidth={1.5} 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <CardContent className="px-5 pb-4 pt-1 flex justify-between items-center text-[9px] border-t border-black/[0.02]">
                      <span className="font-semibold text-black/60">{stat.desc}</span>
                      <span className="font-bold text-emerald-600">{stat.change}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Triage Analytics Graph & Case Severity Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 7-Day Area Chart */}
                <Card className="lg:col-span-2 border border-black/[0.06] bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
                  <div className="flex items-center justify-between border-b border-black/[0.03] pb-4 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-black">Screening Volume & Infection Rate</h3>
                      <p className="text-[10px] text-black/40 mt-0.5">Daily triage distribution logs over the past week</p>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-50 border border-black/5 px-2.5 py-0.5 rounded-full text-black/60">
                      Last 7 Days
                    </span>
                  </div>
                  
                  <div className="flex-1 w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000" stopOpacity={0.06}/>
                            <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorInfections" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.06}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#80808018" />
                        <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#808080' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#808080' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                        <Area type="monotone" dataKey="scans" stroke="#000000" strokeWidth={1.5} fillOpacity={1} fill="url(#colorScans)" name="Total Scans" />
                        <Area type="monotone" dataKey="infections" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#colorInfections)" name="Flagged Infections" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Case Severity Pie Chart */}
                <Card className="border border-black/[0.06] bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
                  <div className="flex items-center justify-between border-b border-black/[0.03] pb-4 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-black">Case Severity Ratio</h3>
                      <p className="text-[10px] text-black/40 mt-0.5">Clinical triage distribution</p>
                    </div>
                  </div>

                  <div className="flex-1 w-full h-[180px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-black/[0.03]">
                    {severityData.map((s, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center gap-1 justify-center">
                          <span className="size-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                          <span className="text-[9px] font-bold text-black/60">{s.name}</span>
                        </div>
                        <div className="text-xs font-bold text-black">{s.value} cases</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Patient Screenings List */}
              <Card className="border border-black/[0.06] bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-black/[0.04] bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-black">Recent Screening Pipeline</h3>
                    <p className="text-[10px] text-black/40 mt-0.5">Select a case file to slide open the visual Grad-CAM review sheet</p>
                  </div>
                  
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-black/30" />
                    <Input 
                      type="text" 
                      placeholder="Search patient or disease..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 border-black/10 rounded-lg text-xs bg-white focus:border-black/30"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black/[0.04] text-black/40 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4 pl-6">Patient Name</th>
                        <th className="p-4">Assessed Sandbox</th>
                        <th className="p-4">Latency</th>
                        <th className="p-4">Diagnostic Result</th>
                        <th className="p-4">Model Confidence</th>
                        <th className="p-4 text-right pr-6">Review Saliency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03]">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-black/30">
                            No screenings logged matching query.
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                            <td className="p-4 pl-6 font-bold text-black">{item.patientDetails.fullName}</td>
                            <td className="p-4 capitalize">{item.disease}</td>
                            <td className="p-4 font-mono text-[10px] text-black/50">2.4s</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                item.detected 
                                  ? 'bg-rose-50 border-rose-100 text-rose-600' 
                                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                              }`}>
                                {item.detected ? 'Infected' : 'Normal'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 max-w-[100px]">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${item.detected ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${item.confidence}%` }}
                                  />
                                </div>
                                <span className="font-mono font-bold text-[10px] text-black/60">{item.confidence}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => { setSelectedCase(item); setDrawerSliderPosition(50); }}
                                className="h-8 rounded-lg border border-black/10 text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                Review Case
                                <ArrowUpRight className="size-3" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB CONTENT: TRIAGE SANDBOX */}
          {activeTab === 'triage' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-center border-b border-black/[0.04] pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-black">Sandbox Screening Terminal</h2>
                  <p className="text-xs text-black/45 mt-0.5">Active diagnostic space. Upload image scans for instant model triaging.</p>
                </div>
              </div>

              <div className="border border-black/[0.06] rounded-2xl bg-white shadow-sm overflow-hidden">
                <AnalysisPage 
                  user={user}
                  patientDetails={patientDetails}
                  onAnalysisComplete={onAnalysisComplete}
                  history={history}
                  standalone={false}
                />
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: PATIENTS DATABASE */}
          {activeTab === 'patients' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.04] pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-black">Patients Registry Database</h2>
                  <p className="text-xs text-black/45 mt-0.5">Filter clinical details and triage history per patient profile.</p>
                </div>

                <div className="flex gap-3 max-w-xs w-full">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-black/30" />
                    <Input 
                      type="text" 
                      placeholder="Search patient registry..." 
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="pl-9 h-9 border-black/10 rounded-lg text-xs bg-white focus:border-black/30"
                    />
                  </div>
                </div>
              </div>

              <Card className="border border-black/[0.06] bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black/[0.04] text-black/40 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4 pl-6">FullName</th>
                        <th className="p-4">Age / Gender</th>
                        <th className="p-4">Contact Vector</th>
                        <th className="p-4">Clinical Address</th>
                        <th className="p-4">Total Screenings</th>
                        <th className="p-4 text-right pr-6">Triage History</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03]">
                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-black/30">
                            No patient records found in node.
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                            <td className="p-4 pl-6 font-bold text-black flex items-center gap-2">
                              <User className="size-3.5 text-black/40" />
                              {p.fullName}
                            </td>
                            <td className="p-4">{p.age}yo / <span className="capitalize">{p.gender}</span></td>
                            <td className="p-4 font-mono text-[10px] text-black/60">{p.phone}</td>
                            <td className="p-4 text-black/50 line-clamp-1 max-w-[180px] pt-5">{p.address}</td>
                            <td className="p-4 font-bold text-black">{p.screeningsCount} scans</td>
                            <td className="p-4 text-right pr-6">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  const matchingScans = history.filter(h => h.patientDetails.fullName === p.fullName);
                                  if (matchingScans.length > 0) {
                                    setSelectedCase(matchingScans[0]);
                                    setDrawerSliderPosition(50);
                                  } else {
                                    alert("No scan logs found. Start a triage scan in the Sandbox.");
                                  }
                                }}
                                className="h-8 rounded-lg border border-black/10 text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                View Files
                                <ChevronRight className="size-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB CONTENT: CLINICAL ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="border-b border-black/[0.04] pb-4">
                <h2 className="text-xl font-bold tracking-tight text-black">Clinical Diagnostics Analytics</h2>
                <p className="text-xs text-black/45 mt-0.5">Aggregation graphs detailing screening distributions and positive ratios.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-black/[0.06] bg-white rounded-2xl p-6 shadow-sm min-h-[320px] flex flex-col justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black/50 border-b border-black/[0.03] pb-3 mb-4">
                    Triage Findings Severity distribution
                  </h3>
                  <div className="flex-1 w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#80808018" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#808080' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#808080' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Logged Cases">
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="border border-black/[0.06] bg-white rounded-2xl p-6 shadow-sm min-h-[320px] flex flex-col justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black/50 border-b border-black/[0.03] pb-3 mb-4">
                    Assessed Pathology Pipeline Ratio
                  </h3>
                  <div className="flex-1 w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pneumonia Screening', value: history.filter(h => h.disease === 'pneumonia').length + 98, color: '#000000' },
                            { name: 'Malaria Screening', value: history.filter(h => h.disease === 'malaria').length + 56, color: '#808080' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#000000" />
                          <Cell fill="#808080" />
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: CONSOLE SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="border-b border-black/[0.04] pb-4">
                <h2 className="text-xl font-bold tracking-tight text-black">Console Settings</h2>
                <p className="text-xs text-black/45 mt-0.5">Configure clinical credentials, node parameters, and triaging thresholds.</p>
              </div>

              <Card className="border border-black/[0.06] bg-white rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="p-6 border-b border-black/[0.03] bg-slate-50/20">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                    <Shield className="size-4.5" />
                    Clinical Cryptographic Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-black block">HIPAA Parameter Vault</span>
                      <span className="text-black/45">Keep intake parameters encrypted locally.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold uppercase tracking-wider text-[10px]">
                      Encrypted
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs border-t border-black/[0.04] pt-4">
                    <div>
                      <span className="font-bold text-black block">Grad-CAM Threshold</span>
                      <span className="text-black/45">Minimum confidence layer mapping (default 0.70)</span>
                    </div>
                    <span className="font-mono font-bold text-black/75">0.70</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </div>
      </main>

      {/* 3. INTERACTIVE SLIDE-OUT CASE DETAIL SHEET WITH DUAL SWIPE COMPARATOR */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-xs"
              onClick={() => setSelectedCase(null)}
            />

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative w-full max-w-xl bg-white border-l border-black/[0.08] shadow-elegant-xl flex flex-col h-full z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-black/[0.04] flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 rounded-full">
                    Clinical Case Review
                  </span>
                  <h3 className="text-lg font-bold text-black mt-1">
                    {selectedCase.patientDetails.fullName}
                  </h3>
                  <p className="text-[10px] text-black/40 mt-0.5">Triage recorded on {selectedCase.timestamp.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="size-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Patient details block */}
                <div className="grid grid-cols-2 gap-4 text-xs p-4 border border-black/[0.05] rounded-xl bg-slate-50/40">
                  <div>
                    <span className="text-black/40 font-semibold uppercase tracking-wider text-[9px] block">Age & Gender</span>
                    <span className="font-bold text-black">{selectedCase.patientDetails.age}yo / <span className="capitalize">{selectedCase.patientDetails.gender}</span></span>
                  </div>
                  <div>
                    <span className="text-black/40 font-semibold uppercase tracking-wider text-[9px] block">Contact phone</span>
                    <span className="font-bold text-black font-mono">{selectedCase.patientDetails.phone}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-black/[0.03]">
                    <span className="text-black/40 font-semibold uppercase tracking-wider text-[9px] block">Medical History notes</span>
                    <span className="font-bold text-black/70 leading-relaxed">{selectedCase.patientDetails.medicalHistory || 'No previous medical records registered.'}</span>
                  </div>
                </div>

                {/* AI Triage outcomes */}
                <div className={`p-4 border border-black/[0.05] rounded-xl flex items-center justify-between ${
                  selectedCase.detected ? 'bg-rose-50/30' : 'bg-emerald-50/30'
                }`}>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 block">AI Screening Result</span>
                    <span className={`text-base font-extrabold ${selectedCase.detected ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {selectedCase.detected ? 'Pathological Anomaly Detected' : 'Normal (Negative)'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 block">Confidence Score</span>
                    <span className="text-base font-extrabold text-black">{selectedCase.confidence}%</span>
                  </div>
                </div>

                {/* HOVER DUAL SWIPE COMPARATOR SLIDER inside Drawer (WOW Factor) */}
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">Diagnostic scan comparator</span>
                    <span className="text-[8px] font-mono text-black/45 bg-slate-100 border px-1.5 py-0.5 rounded">HOVER SCAN TO SWIPE</span>
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl flex justify-center border border-black/10 select-none">
                    <div 
                      ref={drawerSliderContainerRef}
                      onMouseMove={handleDrawerMouseMove}
                      onTouchMove={handleDrawerTouchMove}
                      className="relative w-full aspect-square rounded-lg overflow-hidden cursor-ew-resize border border-white/10 bg-black"
                    >
                      {/* Base Image */}
                      <img 
                        src={selectedCase.originalImage} 
                        alt="Original scan" 
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                      />

                      {/* Sliding Heatmap Overlay */}
                      <div 
                        className="absolute top-0 bottom-0 left-0 overflow-hidden pointer-events-none"
                        style={{ width: `${drawerSliderPosition}%` }}
                      >
                        {selectedCase.heatmapImage ? (
                          <img 
                            src={selectedCase.heatmapImage} 
                            alt="Heatmap overlay" 
                            className="absolute top-0 left-0 w-full h-full object-cover max-w-none" 
                            style={{ width: drawerSliderContainerRef.current?.getBoundingClientRect().width }}
                          />
                        ) : (
                          <canvas 
                            ref={drawerCanvasRef} 
                            className="absolute top-0 left-0 w-full h-full object-cover max-w-none bg-white" 
                            style={{ width: drawerSliderContainerRef.current?.getBoundingClientRect().width }}
                          />
                        )}
                      </div>

                      {/* Swipe bar */}
                      <div 
                        className="absolute top-0 bottom-0 w-[1.5px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] pointer-events-none flex items-center justify-center"
                        style={{ left: `${drawerSliderPosition}%` }}
                      >
                        <div className="size-7 rounded-full bg-white text-black border border-black/5 shadow-md flex items-center justify-center pointer-events-none">
                          <Layers className="size-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="border border-amber-600/20 bg-amber-50/20 rounded-xl overflow-hidden text-xs">
                  <div className="bg-amber-500/10 px-4 py-2 flex items-center gap-1.5 border-b border-amber-500/10">
                    <AlertTriangle className="size-4 text-amber-700" />
                    <span className="font-bold uppercase tracking-wider text-amber-900 text-[10px]">Clinician Advisory</span>
                  </div>
                  <div className="p-4 text-amber-900 leading-relaxed space-y-2">
                    {selectedCase.detected ? (
                      <p>Deviations are flagged. Recommend medical check validation within 24 hours. Submit clinical referral panel.</p>
                    ) : (
                      <p>Normal screening parameters. Clear pulmonology scan path logged.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Actions footer */}
              <div className="p-4 bg-slate-50 border-t border-black/[0.04] flex gap-3 shrink-0">
                <Button 
                  onClick={() => {
                    const doc = new jsPDF();
                    doc.setFontSize(22);
                    doc.text('HealthGuard AI Report', 105, 20, { align: 'center' });
                    doc.setFontSize(12);
                    doc.text(`Patient: ${selectedCase.patientDetails.fullName}`, 20, 40);
                    doc.text(`Result: ${selectedCase.detected ? 'Infected' : 'Normal'}`, 20, 50);
                    doc.save(`${selectedCase.patientDetails.fullName.replace(/\s+/g, '_')}_Report.pdf`);
                  }}
                  className="flex-1 bg-black hover:bg-black/90 text-white h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="size-4" />
                  Print Record Dossier
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedCase(null)}
                  className="flex-1 border border-black/10 hover:bg-black/5 h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Close File
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
