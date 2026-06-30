import { useState, useRef, useEffect, useMemo } from 'react';
import type { User, PatientDetails, AnalysisResult } from '../App';
import { AnalysisPage } from './AnalysisPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { TreatmentAdvisorCard } from './TreatmentAdvisorCard';
import { getWHOTreatmentAdvisor } from '../lib/treatmentAdvisor';
import { 
  Users, User as UserIcon, Activity, FileText, ShieldAlert, Award, Clock, ArrowUpRight, 
  TrendingUp, AlertCircle, Plus, Send, Stethoscope, LayoutDashboard, 
  Database, LineChart as ChartIcon, Settings, Bell, Search, Filter, Shield, 
  X, ChevronRight, Download, CheckCircle2, AlertTriangle, Menu, MapPin, Layers, Check, Info, LogOut, SlidersHorizontal,
  QrCode, ScanLine, UserPlus, ArrowLeft, Clipboard
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
// Helper function to generate deterministic random number from string seed
const getDeterministicRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 1000) / 1000;
};
const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


// Framer Motion variants for sleek stats grid
const statsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const statsItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const statsIconVariants = {
  hover: { 
    scale: 1.12,
    rotate: [0, -8, 8, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
};

interface DashboardPageProps {
  user: User;
  patientDetails: PatientDetails;
  onAnalysisComplete: (result: AnalysisResult) => void;
  history: AnalysisResult[];
  initialTab?: Tab;
  onUpdatePatientDetails?: (details: PatientDetails) => Promise<void> | void;
  onLogout?: () => void;
}

type Tab = 'overview' | 'triage' | 'patients' | 'analytics' | 'settings';

export function DashboardPage({ 
  user, 
  patientDetails, 
  onAnalysisComplete, 
  history,
  initialTab = 'overview',
  onUpdatePatientDetails,
  onLogout
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<AnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [drawerSliderPosition, setDrawerSliderPosition] = useState(50);
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'security' | 'notifications' | 'platform'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  // Doctor-specific: patient intake state
  const isDoctor = user.role === 'doctor' || user.role === 'asha_worker';
  const [doctorPatient, setDoctorPatient] = useState<PatientDetails | null>(null);
  const [doctorPatientStep, setDoctorPatientStep] = useState<'intake' | 'scanning'>('intake');
  const [qrScanMode, setQrScanMode] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [showReferralQR, setShowReferralQR] = useState<AnalysisResult | null>(null);
  const [intakeForm, setIntakeForm] = useState<PatientDetails>({
    fullName: '', age: '', gender: '', phone: '', address: '', emergencyContact: '', medicalHistory: '', weight: ''
  });

  useEffect(() => {
    if (user.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user.avatarUrl]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    setUploadingAvatar(true);
    try {
      // 1. Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        alert('Error uploading avatar: ' + uploadError.message);
        return;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Auth Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        alert('Error updating user profile metadata: ' + updateError.message);
        return;
      }

      // 4. Update Local State
      setAvatarUrl(publicUrl);
      
      // Update session references
      await supabase.auth.getSession();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const drawerSliderContainerRef = useRef<HTMLDivElement>(null);
  const drawerCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync activeTab if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Profile Form state
  const [profileForm, setProfileForm] = useState<PatientDetails>({
    fullName: patientDetails?.fullName || '',
    age: patientDetails?.age || '',
    gender: patientDetails?.gender || '',
    phone: patientDetails?.phone || '',
    address: patientDetails?.address || '',
    emergencyContact: patientDetails?.emergencyContact || '',
    medicalHistory: patientDetails?.medicalHistory || '',
    weight: patientDetails?.weight || ''
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync profileForm if patientDetails changes
  useEffect(() => {
    if (patientDetails) {
      setProfileForm({
        fullName: patientDetails.fullName,
        age: patientDetails.age,
        gender: patientDetails.gender,
        phone: patientDetails.phone,
        address: patientDetails.address,
        emergencyContact: patientDetails.emergencyContact,
        medicalHistory: patientDetails.medicalHistory,
        weight: patientDetails.weight || ''
      });
    }
  }, [patientDetails]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (onUpdatePatientDetails) {
        await onUpdatePatientDetails(profileForm);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Sparkline mock trends (can be kept as visual flair or updated later if we keep sparklines)
  const scansSparkline = [{ val: 14 }, { val: 19 }, { val: 16 }, { val: 28 }, { val: 22 }, { val: 34 }, { val: 45 }];
  const anomaliesSparkline = [{ val: 2 }, { val: 4 }, { val: 3 }, { val: 7 }, { val: 5 }, { val: 8 }, { val: 9 }];
  const latencySparkline = [{ val: 2.8 }, { val: 2.6 }, { val: 2.5 }, { val: 2.4 }, { val: 2.4 }, { val: 2.3 }, { val: 2.4 }];
  const accuracySparkline = [{ val: 95.2 }, { val: 95.4 }, { val: 95.5 }, { val: 95.8 }, { val: 95.8 }, { val: 95.9 }, { val: 95.8 }];

  // 7-day screening volume data (real data from history)
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of today
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        dateString: d.toDateString(),
        day: days[d.getDay()],
        scans: 0,
        infections: 0
      };
    });

    history.forEach(item => {
      const itemDate = new Date(item.timestamp).toDateString();
      const dayData = last7Days.find(d => d.dateString === itemDate);
      if (dayData) {
        dayData.scans += 1;
        if (item.detected) dayData.infections += 1;
      }
    });

    return last7Days;
  }, [history]);

  // Case severity distribution data (real data from history)
  const severityData = useMemo(() => {
    return [
      { name: 'Normal', value: history.filter(h => !h.detected).length, color: '#10b981' },
      { name: 'Moderate', value: history.filter(h => h.detected && h.severity === 'Moderate').length, color: '#0ea5e9' },
      { name: 'Severe', value: history.filter(h => h.detected && h.severity === 'Severe').length, color: '#f43f5e' }
    ];
  }, [history]);

  // Pathology pipeline breakdown
  const pipelineData = useMemo(() => {
    const pneumoniaCount = history.filter(h => h.disease === 'pneumonia').length;
    const malariaCount = history.filter(h => h.disease === 'malaria').length;
    return {
      total: pneumoniaCount + malariaCount,
      data: [
        { name: 'Pneumonia Screening', value: pneumoniaCount, color: '#1e293b' },
        { name: 'Malaria Screening', value: malariaCount, color: '#adccff' }
      ]
    };
  }, [history]);

  // Unique patient records extracted dynamically
  const dynamicPatients = Array.from(new Set(history.map(item => item.patientDetails?.fullName || 'Unknown Patient'))).map(name => {
    const patientHistory = history.filter(item => (item.patientDetails?.fullName || 'Unknown Patient') === name);
    const firstDetail = patientHistory[0]?.patientDetails;
    return {
      fullName: name,
      age: firstDetail?.age || '',
      gender: firstDetail?.gender || '',
      phone: firstDetail?.phone || '',
      address: firstDetail?.address || '',
      screeningsCount: patientHistory.length,
      lastScreening: patientHistory[0]?.timestamp || new Date()
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
    (item.patientDetails?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  // Canvas Overlay Generation Fallback inside Drawer (Grad-CAM for Pneumonia, Boundary for Malaria)
  useEffect(() => {
    const hasOverlay = selectedCase?.disease === 'malaria' ? selectedCase?.boundaryImage : selectedCase?.heatmapImage;
    if (selectedCase && !hasOverlay && drawerCanvasRef.current) {
      const canvas = drawerCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      if (selectedCase.originalImage && selectedCase.originalImage.startsWith('http')) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (selectedCase.detected) {
          const seedString = (selectedCase.patientDetails?.fullName || '') + selectedCase.confidence;
          const r1 = getDeterministicRandom(seedString + 'x');
          const r2 = getDeterministicRandom(seedString + 'y');

          if (selectedCase.disease === 'pneumonia') {
            // ===== PNEUMONIA: Radial gradient heatmap fallback =====
            let imgData;
            try {
              imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            } catch (e) {
              console.warn("Canvas image data read blocked by CORS. Using case-specific fallback.");
            }

            const isLeft = r1 > 0.5;
            let targetX = isLeft 
              ? canvas.width * (0.22 + r2 * 0.12)
              : canvas.width * (0.66 + r2 * 0.12);
            let targetY = canvas.height * (0.42 + r1 * 0.18);

            if (imgData) {
              const data = imgData.data;
              let maxBrightness = 0;
              const startY = Math.floor(canvas.height * 0.35);
              const endY = Math.floor(canvas.height * 0.68);
              
              for (let y = startY; y < endY; y += 4) {
                for (let x = 10; x < canvas.width - 10; x += 4) {
                  const relativeX = x / canvas.width;
                  const isInLeftLung = relativeX >= 0.15 && relativeX <= 0.35;
                  const isInRightLung = relativeX >= 0.65 && relativeX <= 0.85;
                  if (!isInLeftLung && !isInRightLung) continue;

                  const idx = (y * canvas.width + x) * 4;
                  const r = data[idx];
                  const g = data[idx + 1];
                  const b = data[idx + 2];
                  const brightness = (r + g + b) / 3;

                  if (brightness > maxBrightness && brightness < 250) {
                    maxBrightness = brightness;
                    targetX = x;
                    targetY = y;
                  }
                }
              }
            }

            const radius = Math.min(img.width, img.height) * 0.22;
            const gradient = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, radius);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.35)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

          } else {
            // ===== MALARIA: Cell boundary contour detection fallback =====
            let imgData;
            try {
              imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            } catch (e) {
              console.warn("Canvas image data read blocked by CORS. Using case-specific fallback.");
            }

            if (imgData) {
              const data = imgData.data;
              const w = canvas.width;
              const h = canvas.height;
              
              const mask = new Uint8Array(w * h);
              for (let y = 2; y < h - 2; y++) {
                for (let x = 2; x < w - 2; x++) {
                  const idx = (y * w + x) * 4;
                  const r = data[idx];
                  const g = data[idx + 1];
                  const b = data[idx + 2];
                  const brightness = (r + g + b) / 3;
                  if (brightness > 40 && brightness < 180 && r > g * 1.15 && g < 160) {
                    mask[y * w + x] = 1;
                  }
                }
              }
              
              const edgePoints: {x: number, y: number}[] = [];
              for (let y = 3; y < h - 3; y += 1) {
                for (let x = 3; x < w - 3; x += 1) {
                  if (mask[y * w + x] === 1) {
                    const hasEmptyNeighbor = 
                      mask[(y-1) * w + x] === 0 || mask[(y+1) * w + x] === 0 ||
                      mask[y * w + (x-1)] === 0 || mask[y * w + (x+1)] === 0;
                    if (hasEmptyNeighbor) {
                      edgePoints.push({x, y});
                    }
                  }
                }
              }
              
              if (edgePoints.length > 10) {
                for (const pt of edgePoints) {
                  ctx.fillStyle = 'rgba(0, 255, 200, 0.7)';
                  ctx.fillRect(pt.x, pt.y, 1.5, 1.5);
                }
                
                const gridSize = 20;
                const clusters = new Map<string, {minX: number, minY: number, maxX: number, maxY: number, count: number}>();
                for (const pt of edgePoints) {
                  const gx = Math.floor(pt.x / gridSize);
                  const gy = Math.floor(pt.y / gridSize);
                  const key = `${gx},${gy}`;
                  if (!clusters.has(key)) {
                    clusters.set(key, {minX: pt.x, minY: pt.y, maxX: pt.x, maxY: pt.y, count: 0});
                  }
                  const c = clusters.get(key)!;
                  c.minX = Math.min(c.minX, pt.x);
                  c.minY = Math.min(c.minY, pt.y);
                  c.maxX = Math.max(c.maxX, pt.x);
                  c.maxY = Math.max(c.maxY, pt.y);
                  c.count++;
                }
                
                const significantClusters = Array.from(clusters.values())
                  .filter(c => c.count > 8)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5);
                
                significantClusters.forEach((c, i) => {
                  const pad = 5;
                  ctx.strokeStyle = 'rgba(0, 100, 255, 0.9)';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(c.minX - pad, c.minY - pad, c.maxX - c.minX + pad * 2, c.maxY - c.minY + pad * 2);
                  ctx.fillStyle = 'rgba(0, 100, 255, 0.9)';
                  const label = `P${i + 1}`;
                  ctx.font = 'bold 10px sans-serif';
                  const tw = ctx.measureText(label).width;
                  ctx.fillRect(c.minX - pad, c.minY - pad - 14, tw + 6, 14);
                  ctx.fillStyle = '#fff';
                  ctx.fillText(label, c.minX - pad + 3, c.minY - pad - 3);
                });
              } else {
                const tx = canvas.width * (0.25 + r1 * 0.5);
                const ty = canvas.height * (0.25 + r2 * 0.5);
                ctx.strokeStyle = 'rgba(0, 255, 200, 0.9)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(tx, ty, 24, 0, 2 * Math.PI);
                ctx.stroke();
              }
            } else {
              const tx = canvas.width * (0.25 + r1 * 0.5);
              const ty = canvas.height * (0.25 + r2 * 0.5);
              ctx.strokeStyle = 'rgba(0, 255, 200, 0.9)';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(tx, ty, 24, 0, 2 * Math.PI);
              ctx.stroke();
            }
          }
        }
      };
      img.src = selectedCase.originalImage;
    }
  }, [selectedCase]);

  // Stats calculation (real data from history)
  const totalScans = history.length;
  const totalInfections = history.filter(h => h.detected).length;
  
  // Calculate Average Confidence instead of Latency
  const avgConfidence = totalScans > 0 
    ? (history.reduce((sum, h) => sum + h.confidence, 0) / totalScans).toFixed(1) + '%'
    : '0%';

  // Weekly differentials for dynamic trends
  const scansTrend = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeek = history.filter(h => new Date(h.timestamp) >= sevenDaysAgo);
    const lastWeek = history.filter(h => new Date(h.timestamp) >= fourteenDaysAgo && new Date(h.timestamp) < sevenDaysAgo);
    
    if (lastWeek.length === 0) return thisWeek.length > 0 ? { pct: "+100%", dir: "up" } : { pct: "0%", dir: "up" };
    const diff = ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100;
    return {
      pct: (diff >= 0 ? "+" : "") + diff.toFixed(0) + "%",
      dir: diff >= 0 ? "up" : "down"
    };
  }, [history]);

  const infectionsTrend = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeek = history.filter(h => h.detected && new Date(h.timestamp) >= sevenDaysAgo);
    const lastWeek = history.filter(h => h.detected && new Date(h.timestamp) >= fourteenDaysAgo && new Date(h.timestamp) < sevenDaysAgo);
    
    if (lastWeek.length === 0) return thisWeek.length > 0 ? { pct: "+100%", dir: "up" } : { pct: "0%", dir: "up" };
    const diff = ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100;
    return {
      pct: (diff >= 0 ? "+" : "") + diff.toFixed(0) + "%",
      dir: diff >= 0 ? "up" : "down"
    };
  }, [history]);

  const confTrend = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeek = history.filter(h => new Date(h.timestamp) >= sevenDaysAgo);
    const lastWeek = history.filter(h => new Date(h.timestamp) >= fourteenDaysAgo && new Date(h.timestamp) < sevenDaysAgo);
    
    const thisWeekAvg = thisWeek.length > 0 ? thisWeek.reduce((sum, h) => sum + h.confidence, 0) / thisWeek.length : 0;
    const lastWeekAvg = lastWeek.length > 0 ? lastWeek.reduce((sum, h) => sum + h.confidence, 0) / lastWeek.length : 0;
    
    const diff = thisWeekAvg - lastWeekAvg;
    return {
      pct: (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%",
      dir: diff >= 0 ? "up" : "down"
    };
  }, [history]);

  const stats = [
    { 
      label: "Total Screenings", 
      value: totalScans, 
      subtitle: "Accumulated scans",
      trend: scansTrend.dir,
      trendValue: scansTrend.pct,
      icon: FileText,
      color: "#3b82f6"
    },
    { 
      label: "Anomalies Flagged", 
      value: totalInfections, 
      subtitle: "Requires referral", 
      trend: infectionsTrend.dir,
      trendValue: infectionsTrend.pct,
      icon: ShieldAlert,
      color: "#ef4444"
    },
    { 
      label: "Avg Confidence", 
      value: avgConfidence, 
      subtitle: "Model target", 
      trend: confTrend.dir,
      trendValue: confTrend.pct,
      icon: Activity,
      color: "#8b5cf6"
    },
    { 
      label: "Referral Rate", 
      value: totalScans > 0 ? ((totalInfections / totalScans) * 100).toFixed(1) + '%' : '0.0%', 
      subtitle: "Triaging urgency ratio", 
      trend: infectionsTrend.dir,
      trendValue: infectionsTrend.pct,
      icon: CheckCircle2,
      color: "#10b981"
    }
  ];





  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'triage', label: 'Diagnosis', icon: Activity },
    { id: 'patients', label: 'Patients Database', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: ChartIcon },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white text-black flex relative text-left">
      
      {/* 1. COLLAPSIBLE SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-black/[0.05] bg-slate-50/30 p-5 shrink-0 justify-between sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto z-30">
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
                    isActive ? 'text-slate-900 font-extrabold' : 'text-black/55 hover:text-black hover:bg-black/[0.02]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 bg-[#adccff] rounded-xl z-[-1]"
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

        {/* Sign Out button */}
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-rose-50/40 hover:bg-rose-50 border border-rose-100/30 hover:border-rose-100 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 transition-all duration-200 cursor-pointer shadow-sm select-none shrink-0"
          >
            <LogOut className="size-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        )}
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
                          isActive ? 'bg-[#adccff] text-slate-900 font-extrabold' : 'text-black/55 hover:bg-black/[0.03]'
                        }`}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {onLogout && (
                <button 
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-rose-50/40 hover:bg-rose-50 border border-rose-100/30 hover:border-rose-100 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 transition-all duration-200 cursor-pointer shadow-sm select-none shrink-0"
                >
                  <LogOut className="size-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] relative">
        
        {/* Floating Mobile Navigation Button */}
        <button 
          className="lg:hidden fixed bottom-6 right-6 z-50 p-3 bg-black text-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-black/90 active:scale-95 transition-all cursor-pointer"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="size-5" />
        </button>

        {/* Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 z-10">
          
          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Sleek Stats Grid */}
              <motion.div 
                variants={statsContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={statsItemVariants}
                      whileHover={{ y: -1, scale: 1.015 }}
                      transition={{ type: "tween", ease: [0.2, 0, 0, 1], duration: 0.2 }}
                      className="bg-white rounded-[20px] border border-slate-900/[0.08] border-l-2 border-l-slate-200 py-[1.2rem] px-[1.35rem] min-h-[112px] flex flex-col justify-between transition-shadow duration-200 cursor-default shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.03)]"
                    >
                      <div className="flex items-center gap-2 mb-[0.4rem]">
                        {stat.icon && (
                          <span className="flex items-center text-slate-500 opacity-80" style={{ color: stat.color }}>
                            <Icon className="size-4" />
                          </span>
                        )}
                        <span className="text-[13px] font-semibold text-[#0f172a] normal-case tracking-normal leading-none">
                          {stat.label}
                        </span>
                      </div>
                      
                      <div className="text-[20px] font-bold text-[#0f172a] leading-[1.1] mb-[0.25rem] tracking-[-0.03em]">
                        {stat.value}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        {stat.subtitle && (
                          <div className="text-[0.7rem] text-[#94a3b8]">
                            {stat.subtitle}
                          </div>
                        )}
                        {stat.trend && (
                          <div 
                            className="flex items-center gap-[2px] text-[0.75rem] font-semibold"
                            style={{ color: stat.trend === 'up' ? '#059669' : '#b91c1c' }}
                          >
                            <span>{stat.trend === 'up' ? '▲' : '▼'}</span>
                            <span>{stat.trendValue}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Triage Analytics Graph & Case Severity Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* 7-Day Line Chart */}
                <Card className="lg:col-span-2 p-[1.25rem_1.35rem_0.45rem] min-h-[350px] gap-0">
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="text-[#0f172a] mb-4 flex items-center">
                    <Activity className="mr-2 text-[#64748b]" size={18} />
                    Screening Volume & Infection Rate
                  </h3>
                  
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height={245}>
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} />
                        <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '13px', padding: '10px 14px' }} />
                        <Line type="monotone" dataKey="scans" stroke="#1e293b" strokeWidth={3} fill="transparent" dot={{ r: 4, fill: '#fff', stroke: '#1e293b', strokeWidth: 2, fillOpacity: 1 }} activeDot={{ r: 6, fill: '#fff', stroke: '#1e293b', strokeWidth: 3 }} name="Total Scans" />
                        <Line type="monotone" dataKey="infections" stroke="#ef4444" strokeWidth={3} fill="transparent" dot={{ r: 4, fill: '#fff', stroke: '#ef4444', strokeWidth: 2, fillOpacity: 1 }} activeDot={{ r: 6, fill: '#fff', stroke: '#ef4444', strokeWidth: 3 }} name="Flagged Infections" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Case Severity Pie Chart */}
                <Card className="p-[1.25rem_1.35rem] min-h-[350px] gap-0">
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="text-[#0f172a] mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                    Case Severity Ratio
                  </h3>

                  <div className="flex-1 w-full h-[185px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={185}>
                      <PieChart>
                        <Pie
                          data={severityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={4}
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                          <tspan x="50%" dy="-2" fontSize="22" fontWeight="800" fill="#1e293b">{totalScans}</tspan>
                          <tspan x="50%" dy="20" fontSize="9" fontWeight="700" fill="#64748b" letterSpacing="0.05em">SCANS TOTAL</tspan>
                        </text>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '14px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Clean Legend */}
                  <div className="mt-3 flex flex-wrap justify-center gap-[0.85rem] select-none">
                    {severityData.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: s.color }}></div>
                        <span className="text-[0.9rem] font-semibold text-[#1e293b]">
                          {s.name}
                        </span>
                        <span className="text-[0.9rem] font-bold text-[#0f172a]">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Patient Screenings List */}
              <Card className="overflow-hidden">
                <div className="py-3 px-6 border-b border-black/[0.04] bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="text-[#0f172a]">Recent Screening Pipeline</h3>
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
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold tracking-wider text-[11px]">
                        <th className="p-4 pl-6">Patient Name</th>
                        <th className="p-4">Assessed Sandbox</th>
                        <th className="p-4">Diagnostic Result</th>
                        <th className="p-4">Model Confidence</th>
                        <th className="p-4 text-right pr-6">Review Saliency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-400">
                            No screenings logged matching query.
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                            <td className="p-4 pl-6 font-semibold text-slate-800">{item.patientDetails.fullName}</td>
                            <td className="p-4 capitalize text-slate-600">{item.disease}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium border ${
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
                                <span className="font-medium text-[11px] text-slate-600">{item.confidence}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => { setSelectedCase(item); setDrawerSliderPosition(50); }}
                                className="h-8 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                Review Case
                                <ArrowUpRight className="size-3 text-slate-400" />
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
              
              {/* DOCTOR FLOW: Patient Intake Step */}
              {isDoctor && doctorPatientStep === 'intake' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center border-b border-black/[0.04] pb-4">
                    <div>
                      <h2 className="text-xs font-semibold tracking-tight text-slate-800">Patient Intake Registration</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Register patient details before initiating diagnostic screening.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setQrScanMode(!qrScanMode)}
                        variant="outline"
                        className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider border-black/10 hover:bg-black/[0.02] cursor-pointer flex items-center gap-1.5"
                      >
                        <ScanLine className="size-3.5" />
                        {qrScanMode ? 'Manual Entry' : 'Scan QR Code'}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {qrScanMode ? (
                      <motion.div key="qr-scan" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                        <Card className="border border-black/[0.06] overflow-hidden">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-black flex items-center justify-center text-white shrink-0">
                                <QrCode className="size-5" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">Import Patient via QR Code</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Paste the JSON data from a referral QR code below to instantly populate the patient's profile.</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">QR Code Data (JSON)</Label>
                              <Textarea
                                placeholder='{"n":"Patient Name","a":"25","g":"Male","d":"Pneumonia","c":95.4,"s":"Moderate"}'
                                value={qrInput}
                                onChange={(e) => setQrInput(e.target.value)}
                                className="border-black/10 rounded-xl min-h-[100px] font-mono text-xs"
                                rows={4}
                              />
                            </div>

                            <Button
                              onClick={() => {
                                try {
                                  const parsed = JSON.parse(qrInput);
                                  const imported: PatientDetails = {
                                    fullName: parsed.n || parsed.fullName || '',
                                    age: String(parsed.a || parsed.age || ''),
                                    gender: parsed.g || parsed.gender || '',
                                    phone: parsed.p || parsed.phone || '',
                                    address: parsed.addr || parsed.address || '',
                                    emergencyContact: parsed.ec || parsed.emergencyContact || '',
                                    medicalHistory: parsed.mh || parsed.medicalHistory || '',
                                    weight: String(parsed.w || parsed.weight || '')
                                  };
                                  setIntakeForm(imported);
                                  setDoctorPatient(imported);
                                  setDoctorPatientStep('scanning');
                                  setQrScanMode(false);
                                  setQrInput('');
                                } catch {
                                  alert('Invalid QR data format. Please paste valid JSON.');
                                }
                              }}
                              className="w-full bg-black hover:bg-black/90 text-white h-10 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
                            >
                              Import & Proceed to Screening
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ) : (
                      <motion.div key="manual-entry" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <Card className="border border-black/[0.06] overflow-hidden">
                          <div className="p-5 bg-slate-50/50 border-b border-black/[0.04]">
                            <div className="flex items-center gap-2">
                              <UserPlus className="size-4 text-slate-600" />
                              <span className="text-xs font-bold text-slate-700">New Patient Registration</span>
                            </div>
                          </div>
                          <CardContent className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">Full Name *</Label>
                                <Input
                                  placeholder="Patient full name"
                                  value={intakeForm.fullName}
                                  onChange={(e) => setIntakeForm(prev => ({ ...prev, fullName: e.target.value }))}
                                  className="h-10 border-black/10 rounded-xl text-sm"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">Age *</Label>
                                  <Input
                                    type="number"
                                    placeholder="25"
                                    value={intakeForm.age}
                                    onChange={(e) => setIntakeForm(prev => ({ ...prev, age: e.target.value }))}
                                    className="h-10 border-black/10 rounded-xl text-sm"
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">Gender *</Label>
                                  <select
                                    value={intakeForm.gender}
                                    onChange={(e) => setIntakeForm(prev => ({ ...prev, gender: e.target.value }))}
                                    className="h-10 w-full border border-black/10 rounded-xl text-sm px-3 bg-white"
                                  >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">Weight (kg) *</Label>
                                  <Input
                                    type="number"
                                    placeholder="60"
                                    value={intakeForm.weight || ''}
                                    onChange={(e) => setIntakeForm(prev => ({ ...prev, weight: e.target.value }))}
                                    className="h-10 border-black/10 rounded-xl text-sm"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">Phone Number</Label>
                                <Input
                                  placeholder="+92 300 1234567"
                                  value={intakeForm.phone}
                                  onChange={(e) => setIntakeForm(prev => ({ ...prev, phone: e.target.value }))}
                                  className="h-10 border-black/10 rounded-xl text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">Emergency Contact</Label>
                                <Input
                                  placeholder="+92 300 7654321"
                                  value={intakeForm.emergencyContact}
                                  onChange={(e) => setIntakeForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                                  className="h-10 border-black/10 rounded-xl text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">Address</Label>
                              <Input
                                placeholder="Village, District, Province"
                                value={intakeForm.address}
                                onChange={(e) => setIntakeForm(prev => ({ ...prev, address: e.target.value }))}
                                className="h-10 border-black/10 rounded-xl text-sm"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-black/50">Medical History (Optional)</Label>
                              <Textarea
                                placeholder="Allergies, chronic conditions, current medications..."
                                value={intakeForm.medicalHistory}
                                onChange={(e) => setIntakeForm(prev => ({ ...prev, medicalHistory: e.target.value }))}
                                className="border-black/10 rounded-xl text-sm min-h-[70px]"
                                rows={2}
                              />
                            </div>

                            <Button
                              onClick={() => {
                                if (!intakeForm.fullName || !intakeForm.age || !intakeForm.gender || !intakeForm.weight) {
                                  alert('Please fill in patient name, age, gender, and weight.');
                                  return;
                                }
                                setDoctorPatient(intakeForm);
                                setDoctorPatientStep('scanning');
                              }}
                              disabled={!intakeForm.fullName || !intakeForm.age || !intakeForm.gender || !intakeForm.weight}
                              className="w-full bg-black hover:bg-black/90 text-white h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Stethoscope className="size-3.5" />
                              Proceed to Diagnostic Screening
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                /* PATIENT FLOW (or Doctor already registered patient) */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-black/[0.04] pb-4">
                    <div>
                      <h2 className="text-xs font-semibold tracking-tight text-slate-800">Sandbox Screening Terminal</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isDoctor && doctorPatient 
                          ? `Screening for: ${doctorPatient.fullName} (${doctorPatient.age}yo, ${doctorPatient.gender})`
                          : 'Active diagnostic space. Upload image scans for instant model triaging.'
                        }
                      </p>
                    </div>
                    {isDoctor && doctorPatient && (
                      <Button
                        onClick={() => {
                          setDoctorPatientStep('intake');
                          setDoctorPatient(null);
                          setIntakeForm({ fullName: '', age: '', gender: '', phone: '', address: '', emergencyContact: '', medicalHistory: '' });
                        }}
                        variant="outline"
                        className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider border-black/10 hover:bg-black/[0.02] cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="size-3" />
                        Change Patient
                      </Button>
                    )}
                  </div>

                  <div className="w-full">
                    <AnalysisPage 
                      user={user}
                      patientDetails={isDoctor && doctorPatient ? doctorPatient : patientDetails}
                      onAnalysisComplete={(result) => {
                        onAnalysisComplete(result);
                        if (isDoctor && result.detected) {
                          setShowReferralQR(result);
                        }
                      }}
                      history={history}
                      standalone={false}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* REFERRAL QR CODE MODAL */}
          <AnimatePresence>
            {showReferralQR && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowReferralQR(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-black/[0.08]"
                >
                  {/* Modal Header */}
                  <div className="p-6 border-b border-black/[0.05] bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-black flex items-center justify-center text-white">
                        <QrCode className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Clinical Handover QR Code</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Scan to import diagnostic record at receiving facility</p>
                      </div>
                    </div>
                    <button onClick={() => setShowReferralQR(null)} className="size-8 rounded-lg hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors">
                      <X className="size-4 text-slate-400" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-5">
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="p-4 bg-white border-2 border-black/[0.08] rounded-2xl shadow-sm">
                        <QRCodeSVG
                          value={JSON.stringify({
                            n: showReferralQR.patientDetails.fullName,
                            a: showReferralQR.patientDetails.age,
                            g: showReferralQR.patientDetails.gender,
                            p: showReferralQR.patientDetails.phone,
                            w: showReferralQR.patientDetails.weight || '',
                            d: showReferralQR.disease === 'pneumonia' ? 'Pneumonia' : 'Malaria',
                            c: showReferralQR.confidence,
                            s: showReferralQR.severity || 'Moderate',
                            t: showReferralQR.timestamp.toISOString(),
                            ref: `HG-${Math.floor(100000 + Math.random() * 900000)}`
                          })}
                          size={180}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                    </div>

                    {/* Transfer Summary */}
                    <div className="bg-slate-50 border border-black/[0.05] rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-3.5 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Transfer Summary</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Patient</span>
                          <span className="font-bold text-slate-800">{showReferralQR.patientDetails.fullName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Age / Gender / Weight</span>
                          <span className="font-bold text-slate-800 capitalize">{showReferralQR.patientDetails.age}yo / {showReferralQR.patientDetails.gender} / {showReferralQR.patientDetails.weight ? `${showReferralQR.patientDetails.weight}kg` : '---'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Pathogen Detected</span>
                          <span className="font-bold text-red-600 capitalize">{showReferralQR.disease}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Confidence / Severity</span>
                          <span className="font-bold text-slate-800">{showReferralQR.confidence}% / {showReferralQR.severity || 'Moderate'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                      Instruct the patient to take a screenshot of this QR code. The receiving tertiary facility can scan this code to load the diagnostic dossier.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB CONTENT: PATIENTS DATABASE */}
          {activeTab === 'patients' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.04] pb-4">
                <div>
                  <h2 className="text-xs font-semibold tracking-tight text-slate-800">Patients Registry Database</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Filter clinical details and triage history per patient profile.</p>
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

              <Card className="overflow-hidden">
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
                              <UserIcon className="size-3.5 text-black/40" />
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
                                  const matchingScans = history.filter(h => h.patientDetails?.fullName === p.fullName);
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
                <h2 className="text-xs font-semibold tracking-tight text-slate-800">Clinical Diagnostics Analytics</h2>
                <p className="text-xs text-slate-500 mt-0.5">Aggregation graphs detailing screening distributions and positive ratios.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Findings Severity Bar Chart */}
                <Card className="p-[1.25rem_1.35rem_0.45rem] min-h-[350px] gap-0">
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="text-[#0f172a] mb-4 flex items-center">
                    <SlidersHorizontal className="mr-2 text-[#64748b]" size={18} />
                    Triage Findings Severity Distribution
                  </h3>
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height={245}>
                      <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} />
                        <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.4 }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '13px', padding: '10px 14px' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48} name="Logged Cases">
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Assessed Pathology Donut Chart */}
                <Card className="p-[1.25rem_1.35rem] min-h-[350px] gap-0">
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="text-[#0f172a] mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                    Assessed Pathology Pipeline Ratio
                  </h3>
                  <div className="flex-1 w-full h-[185px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={185}>
                      <PieChart>
                        <Pie
                          data={pipelineData.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={4}
                        >
                          {pipelineData.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                          <tspan x="50%" dy="-2" fontSize="22" fontWeight="800" fill="#1e293b">{pipelineData.total}</tspan>
                          <tspan x="50%" dy="20" fontSize="9" fontWeight="700" fill="#64748b" letterSpacing="0.05em">INFERENCES</tspan>
                        </text>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '14px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Clean Legend */}
                  <div className="mt-3 flex flex-wrap justify-center gap-[0.85rem] select-none">
                    {pipelineData.data.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: s.color }}></div>
                        <span className="text-[11px] font-semibold text-[#1e293b]">
                          {s.name}
                        </span>
                        <span className="text-[11px] font-bold text-[#0f172a]">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: CONSOLE SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
              <div className="account-page-shell">
                
                {/* GitHub-style top identity bar */}
                <div className="gh-identity-bar">
                  <div className="gh-identity-bar-left">
                    <div className="gh-identity-bar-avatar select-none">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span>{user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="gh-identity-bar-meta">
                      <strong>{user.name}</strong>
                      <span>Your personal account</span>
                    </div>
                  </div>
                </div>

                <div className="gh-tab-content">
                  <h2 className="gh-tab-title">Public profile</h2>
                  <div className="gh-profile-layout">
                    <form onSubmit={handleSaveProfile} className="gh-profile-fields">
                      <div className="gh-field">
                        <label>Name</label>
                        <input 
                          className="gh-input" 
                          value={profileForm.fullName} 
                          onChange={(e) => setProfileForm(p => ({ ...p, fullName: e.target.value }))} 
                          placeholder="Enter your full name" 
                          required
                        />
                      </div>

                      <div className="gh-field">
                        <label>Public email</label>
                        <div className="gh-input gh-input-readonly">{user.email}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ maxWidth: '600px' }}>
                        <div className="gh-field">
                          <label>{isDoctor ? 'Age (Years)' : 'Patient Age'}</label>
                          <input 
                            className="gh-input" 
                            type="number"
                            value={profileForm.age} 
                            onChange={(e) => setProfileForm(p => ({ ...p, age: e.target.value }))} 
                            placeholder="Age" 
                            required
                          />
                        </div>

                        <div className="gh-field">
                          <label>Gender</label>
                          <select 
                            className="gh-input"
                            value={profileForm.gender} 
                            onChange={(e) => setProfileForm(p => ({ ...p, gender: e.target.value }))} 
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="gh-field">
                          <label>{isDoctor ? 'Weight (kg)' : 'Weight (kg) *'}</label>
                          <input 
                            className="gh-input" 
                            type="number"
                            value={profileForm.weight || ''} 
                            onChange={(e) => setProfileForm(p => ({ ...p, weight: e.target.value }))} 
                            placeholder="Weight" 
                            required={!isDoctor}
                          />
                        </div>
                      </div>

                      <div className="gh-field">
                        <label>Phone Number</label>
                        <input 
                          className="gh-input" 
                          type="tel"
                          value={profileForm.phone} 
                          onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} 
                          placeholder="Phone number" 
                          required
                        />
                      </div>

                      <div className="gh-field">
                        <label>{isDoctor ? 'Clinic / Hospital Address' : 'Home Address'}</label>
                        <input 
                          className="gh-input" 
                          value={profileForm.address} 
                          onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))} 
                          placeholder={isDoctor ? "Hospital/Clinic address" : "Home address"} 
                          required
                        />
                      </div>

                      <div className="gh-field">
                        <label>{isDoctor ? 'License / Registration ID' : 'Emergency Contact'}</label>
                        <input 
                          className="gh-input" 
                          value={profileForm.emergencyContact} 
                          onChange={(e) => setProfileForm(p => ({ ...p, emergencyContact: e.target.value }))} 
                          placeholder={isDoctor ? "PMC ID number" : "Emergency contact details"} 
                          required
                        />
                      </div>

                      <div className="gh-field">
                        <label>{isDoctor ? 'Clinician Bio / Experience' : 'Medical History Notes'}</label>
                        <textarea 
                          className="gh-input min-h-[80px]" 
                          value={profileForm.medicalHistory} 
                          onChange={(e) => setProfileForm(p => ({ ...p, medicalHistory: e.target.value }))} 
                          placeholder={isDoctor ? "Biography details..." : "Medical history details..."}
                        />
                      </div>

                      <div className="gh-profile-actions">
                        <button 
                          type="submit" 
                          disabled={saving} 
                          className="gh-btn gh-btn-save"
                        >
                          {saving ? 'Updating...' : 'Update profile'}
                        </button>
                        {saveSuccess && (
                          <span className="text-[11px] font-bold text-emerald-600 ml-4 inline-flex items-center gap-1">
                            <Check className="size-3.5" />
                            Profile updated successfully
                          </span>
                        )}
                      </div>
                    </form>

                    <div className="gh-profile-avatar-section select-none">
                      <label>Profile picture</label>
                      <div className="gh-avatar-large relative cursor-pointer group overflow-hidden" onClick={handleAvatarClick}>
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="gh-avatar-initials">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        )}
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                            UPLOADING...
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                      />
                      <button className="gh-avatar-edit-btn" type="button" onClick={handleAvatarClick} disabled={uploadingAvatar}>
                        {uploadingAvatar ? 'Uploading...' : 'Change picture'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
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
              <div className="p-6 border-b border-black/[0.04] flex flex-col shrink-0 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 rounded-full">
                      Clinical Case Review
                    </span>
                    <h3 className="text-xs font-bold text-black mt-1">
                      {selectedCase.patientDetails.fullName}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedCase(null)}
                    className="size-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                
                {(() => {
                  const matchingScans = history.filter(
                    (h) => h.patientDetails?.fullName === selectedCase.patientDetails?.fullName
                  );
                  if (matchingScans.length > 1) {
                    return (
                      <div className="mt-3.5 pt-3.5 border-t border-black/[0.04] space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-black/40 font-mono">
                          Select Scan Record ({matchingScans.length} found)
                        </label>
                        <div className="relative">
                          <select
                            value={matchingScans.findIndex(h => h.id === selectedCase.id || (h.timestamp === selectedCase.timestamp && h.originalImage === selectedCase.originalImage))}
                            onChange={(e) => {
                              const idx = parseInt(e.target.value);
                              if (!isNaN(idx) && matchingScans[idx]) {
                                setSelectedCase(matchingScans[idx]);
                              }
                            }}
                            className="w-full text-xs font-bold text-black bg-white border border-black/10 rounded-xl px-3 py-2 focus:outline-none focus:border-black/30 cursor-pointer appearance-none pr-10"
                          >
                            {matchingScans.map((scan, sIdx) => {
                              const dateStr = new Date(scan.timestamp).toLocaleString();
                              const diseaseName = scan.disease === 'malaria' ? 'Malaria' : 'Pneumonia';
                              const outcome = scan.detected ? 'Positive' : 'Negative';
                              const activeLabel = sIdx === 0 ? ' (Most Recent)' : '';
                              return (
                                <option key={sIdx} value={sIdx}>
                                  {diseaseName} Triage - {outcome} | {dateStr}{activeLabel}
                                </option>
                              );
                            })}
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-black/40">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <p className="text-[10px] text-black/40 mt-1.5">Triage recorded on {new Date(selectedCase.timestamp).toLocaleString()}</p>
                  );
                })()}
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
                     <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">
                       {selectedCase.disease === 'malaria' ? 'Cell Boundary Detection' : 'Grad-CAM Heatmap'}
                     </span>
                     {selectedCase.detected ? (
                       <span className="text-[8px] font-mono text-black/45 bg-slate-100 border px-1.5 py-0.5 rounded">
                         {selectedCase.disease === 'malaria' ? 'HOVER TO COMPARE BOUNDARIES' : 'HOVER SCAN TO SWIPE'}
                       </span>
                     ) : (
                       <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">SCAN CLEAR (NO ANOMALY)</span>
                     )}
                   </div>
                   
                   <div className="bg-slate-950 p-4 rounded-xl flex justify-center border border-black/10 select-none">
                     {selectedCase.detected ? (
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
                           className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                         />

                         {/* Sliding Overlay (Boundary for Malaria, Heatmap for Pneumonia) */}
                         <div 
                           className="absolute top-0 bottom-0 left-0 overflow-hidden pointer-events-none"
                           style={{ width: `${drawerSliderPosition}%` }}
                         >
                           {(() => {
                             const overlayImage = selectedCase.disease === 'malaria' ? selectedCase.boundaryImage : selectedCase.heatmapImage;
                             if (overlayImage) {
                               return (
                                 <img 
                                   src={overlayImage} 
                                   alt={selectedCase.disease === 'malaria' ? 'Boundary detection overlay' : 'Heatmap overlay'} 
                                   className="absolute top-0 left-0 w-full h-full object-contain max-w-none" 
                                   style={{ width: drawerSliderContainerRef.current?.getBoundingClientRect().width }}
                                 />
                               );
                             }
                             return (
                               <canvas 
                                 ref={drawerCanvasRef} 
                                 className="absolute top-0 left-0 w-full h-full object-contain max-w-none bg-white" 
                                 style={{ width: drawerSliderContainerRef.current?.getBoundingClientRect().width }}
                               />
                             );
                           })()}
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
                     ) : (
                       <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-white/10 bg-black flex flex-col items-center justify-center">
                         <img 
                           src={selectedCase.originalImage} 
                           alt="Original scan" 
                           className="w-full h-full object-contain" 
                         />
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Recommendations / WHO Decision Support Card */}
                 {selectedCase.detected ? (
                   <TreatmentAdvisorCard
                     disease={selectedCase.disease}
                     detected={selectedCase.detected}
                     severity={selectedCase.severity || 'Moderate'}
                     patientDetails={selectedCase.patientDetails}
                   />
                 ) : (
                   <div className="border border-emerald-600/20 bg-emerald-50/20 rounded-xl overflow-hidden text-xs">
                     <div className="bg-emerald-500/10 px-4 py-2 flex items-center gap-1.5 border-b border-emerald-500/10">
                       <Check className="size-4 text-emerald-700" />
                       <span className="font-bold uppercase tracking-wider text-emerald-900 text-[10px]">Clinician Advisory</span>
                     </div>
                     <div className="p-4 text-emerald-900 leading-relaxed">
                       <p>Normal screening parameters. Clear pulmonology/blood smear path logged. Continue routine surveillance.</p>
                     </div>
                   </div>
                 )}

              </div>

              {/* Actions footer */}
              <div className="p-4 bg-slate-50 border-t border-black/[0.04] flex gap-3 shrink-0">
                <Button 
                  onClick={async () => {
                   if (!selectedCase) return;
                   const doc = new jsPDF();
                   const primaryColor = [15, 23, 42]; // Slate 900
                   const accentColor = selectedCase.detected ? [239, 68, 68] : [34, 197, 94]; // Red or Green
                   const greyColor = [100, 116, 139]; // Slate 500
                   
                   // Top header colored bar
                   doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                   doc.rect(0, 0, 210, 8, 'F');
                   
                   // Header Branding with Logo
                   let logoBase64 = '';
                   try {
                     logoBase64 = await getBase64ImageFromUrl('/translogo.png');
                   } catch (e) {
                     console.warn("Could not load logo image for PDF:", e);
                   }

                   if (logoBase64) {
                     doc.addImage(logoBase64, 'PNG', 20, 14, 10, 10);
                     doc.setFont("helvetica", "bold");
                     doc.setFontSize(20);
                     doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                     doc.text("HealthGuard AI", 32, 22);
                   } else {
                     doc.setFont("helvetica", "bold");
                     doc.setFontSize(20);
                     doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                     doc.text("HealthGuard AI", 20, 22);
                   }
                   
                   doc.setFont("helvetica", "normal");
                   doc.setFontSize(9);
                   doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
                   doc.text("Clinical Diagnostic Triaging Node", 20, 30);
                   
                   // Report Info (Right Aligned)
                   doc.setFont("helvetica", "bold");
                   doc.setFontSize(10);
                   doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                   doc.text("PATIENT DOSSIER REPORT", 190, 22, { align: 'right' });
                   doc.setFont("helvetica", "normal");
                   doc.setFontSize(9);
                   doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
                   doc.text(`Report ID: HG-${Math.floor(100000 + Math.random() * 900000)}`, 190, 27, { align: 'right' });
                   doc.text(`Date: ${new Date(selectedCase.timestamp).toLocaleString()}`, 190, 32, { align: 'right' });
                   
                   // Divider line
                   doc.setDrawColor(226, 232, 240); // slate 200
                   doc.setLineWidth(0.5);
                   doc.line(20, 40, 190, 40);
                   
                   // Patient Information Block
                   doc.setFont("helvetica", "bold");
                   doc.setFontSize(12);
                   doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                   doc.text("Patient Information", 20, 48);
                   
                   // Draw a neat info card
                   doc.setFillColor(248, 250, 252); // slate 50
                   doc.setDrawColor(241, 245, 249); // slate 100
                   doc.rect(20, 52, 170, 32, 'FD');
                   
                   doc.setFont("helvetica", "bold");
                   doc.setFontSize(9);
                   doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                   doc.text("FullName:", 25, 60);
                   doc.text("Age / Gender / Weight:", 25, 67);
                   doc.text("Phone Number:", 25, 74);
                   doc.text("Clinical History:", 105, 60);
                   
                   doc.setFont("helvetica", "normal");
                   doc.setTextColor(71, 85, 105); // slate 600
                   doc.text(selectedCase.patientDetails.fullName, 55, 60);
                   doc.text(`${selectedCase.patientDetails.age} yrs / ${selectedCase.patientDetails.gender} / ${selectedCase.patientDetails.weight ? `${selectedCase.patientDetails.weight}kg` : 'N/A'}`, 65, 67);
                   doc.text(selectedCase.patientDetails.phone || 'N/A', 55, 74);
                   
                   const historyText = selectedCase.patientDetails.medicalHistory || 'No previous medical history provided.';
                   const splitHistory = doc.splitTextToSize(historyText, 75);
                   doc.text(splitHistory, 135, 60);
                   
                   // Diagnostic Results Block
                     doc.setFont("helvetica", "bold");
                     doc.setFontSize(12);
                     doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                     doc.text("Diagnostic Assessment", 20, 93);
                     
                     // Outcome Banner
                     doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
                     doc.rect(20, 97, 170, 12, 'F');
                     
                     doc.setFont("helvetica", "bold");
                     doc.setFontSize(10);
                     doc.setTextColor(255, 255, 255);
                     const outcomeText = `SCREENING OUTCOME: ${selectedCase.detected ? 'ANOMALY DETECTED' : 'NORMAL / SCAN CLEAR'}`;
                     doc.text(outcomeText, 25, 105);
                     
                     doc.setFont("helvetica", "normal");
                     doc.setTextColor(255, 255, 255);
                     doc.text(`Model Confidence: ${selectedCase.confidence}%`, 185, 105, { align: 'right' });
                     
                     // Diagnostic specifications (two rows to prevent horizontal overlaps)
                     doc.setFont("helvetica", "bold");
                     doc.setFontSize(9);
                     doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                     doc.text("Target Disease Pathogen:", 25, 116);
                     doc.text("Severity Classification:", 25, 123);
                     
                     doc.setFont("helvetica", "normal");
                     doc.setTextColor(71, 85, 105);
                     doc.text(selectedCase.disease.toUpperCase() === 'PNEUMONIA' ? 'Pneumonia (Chest X-Ray Scan)' : 'Malaria (Microscopic Blood Smear)', 70, 116);
                     doc.text(selectedCase.detected ? (selectedCase.severity || 'Moderate') : 'N/A (Clear)', 70, 123);
                     
                     // Imaging scans block
                     doc.setFont("helvetica", "bold");
                     doc.setFontSize(12);
                     doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                     doc.text("Medical Imaging & Computer Vision Analysis", 20, 136);
                     
                     // Embed Images side-by-side if available
                     let nextY = 141;
                     try {
                       const hasOverlay = selectedCase.disease === 'malaria' ? selectedCase.boundaryImage : selectedCase.heatmapImage;
                       if (selectedCase.originalImage && hasOverlay) {
                         // Draw image cards
                         doc.setFillColor(248, 250, 252);
                         doc.rect(20, 141, 80, 75, 'F');
                         doc.rect(110, 141, 80, 75, 'F');
                         
                         doc.addImage(selectedCase.originalImage, 'JPEG', 22, 143, 76, 71);
                         doc.addImage(hasOverlay, 'PNG', 112, 143, 76, 71);
                         
                         doc.setFont("helvetica", "bold");
                         doc.setFontSize(8);
                         doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
                         doc.text("Original Uploaded Scan", 60, 221, { align: 'center' });
                         doc.text(selectedCase.disease === 'malaria' ? "Computer Vision Boundary Detection" : "Explainable AI (Grad-CAM Heatmap)", 150, 221, { align: 'center' });
                         
                         nextY = 228;
                       }
                     } catch (err) {
                       console.error("PDF image attachment error:", err);
                       doc.setFont("helvetica", "italic");
                       doc.setFontSize(9);
                       doc.setTextColor(239, 68, 68);
                       doc.text("Note: Base64 image payload embedding skipped or failed during generation.", 20, 146);
                       nextY = 151;
                     }
                     
                     // Disclaimer and multi-page routing
                     if (selectedCase.detected) {
                       doc.addPage();
                       
                       // Top header colored bar
                       doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                       doc.rect(0, 0, 210, 8, 'F');
                       
                       // Header Branding
                       if (logoBase64) {
                         doc.addImage(logoBase64, 'PNG', 20, 14, 10, 10);
                         doc.setFont("helvetica", "bold");
                         doc.setFontSize(20);
                         doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                         doc.text("HealthGuard AI", 32, 22);
                       } else {
                         doc.setFont("helvetica", "bold");
                         doc.setFontSize(20);
                         doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                         doc.text("HealthGuard AI", 20, 22);
                       }
                       
                       doc.setFont("helvetica", "bold");
                       doc.setFontSize(10);
                       doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                       doc.text("WHO CLINICAL DECISION SUPPORT PATHWAY", 190, 22, { align: 'right' });
                       
                       doc.setDrawColor(226, 232, 240); // slate 200
                       doc.setLineWidth(0.5);
                       doc.line(20, 30, 190, 30);
                       
                       // Load protocol
                       const advisor = getWHOTreatmentAdvisor(
                         selectedCase.disease,
                         selectedCase.detected,
                         selectedCase.severity || 'Moderate',
                         selectedCase.patientDetails.age,
                         selectedCase.patientDetails.weight
                       );
                       
                       if (advisor) {
                         // Section Title
                         doc.setFont("helvetica", "bold");
                         doc.setFontSize(13);
                         doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
                         doc.text(`AI-Suggested Clinical Action (${selectedCase.disease.toUpperCase()})`, 20, 42);
                         
                         doc.setFont("helvetica", "bold");
                         doc.setFontSize(10);
                         doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                         doc.text(`Referral Urgency: ${advisor.referralUrgency.toUpperCase()}`, 20, 50);
                         
                         doc.setFont("helvetica", "normal");
                         doc.setFontSize(10);
                         doc.setTextColor(71, 85, 105);
                         doc.text(`Action Suggested: ${advisor.actionSuggested}`, 20, 56);
                         
                         let protocolY = 66;
                         if (advisor.drugDosage) {
                           // Draw Drug Info card
                           doc.setFillColor(248, 250, 252);
                           doc.setDrawColor(241, 245, 249);
                           doc.rect(20, 62, 170, 38, 'FD');
                           
                           doc.setFont("helvetica", "bold");
                           doc.setFontSize(10);
                           doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                           doc.text("RECOMMENDED DOSING REGIMEN (WHO ALIGNED)", 25, 69);
                           
                           doc.setFont("helvetica", "bold");
                           doc.setFontSize(9);
                           doc.text("First-Line Agent:", 25, 76);
                           doc.text("Schedule:", 25, 83);
                           doc.text("Instructions:", 25, 90);
                           
                           doc.setFont("helvetica", "normal");
                           doc.setTextColor(71, 85, 105);
                           doc.text(advisor.drugDosage.drugName, 60, 76);
                           doc.text(advisor.drugDosage.schedule, 60, 83);
                           
                           const splitInstruct = doc.splitTextToSize(advisor.drugDosage.instructions, 120);
                           doc.text(splitInstruct, 60, 90);
                           
                           protocolY = 112;
                         }
                         
                         // Supportive Care list
                         doc.setFont("helvetica", "bold");
                         doc.setFontSize(11);
                         doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                         doc.text("Supportive Care Protocols:", 20, protocolY);
                         
                         doc.setFont("helvetica", "normal");
                         doc.setFontSize(9.5);
                         doc.setTextColor(71, 85, 105);
                         let listY = protocolY + 6;
                         advisor.supportiveCare.forEach((care) => {
                           const splitCare = doc.splitTextToSize(`•  ${care}`, 170);
                           doc.text(splitCare, 20, listY);
                           listY += splitCare.length * 5;
                         });
                         
                         nextY = listY + 10;
                       }
                       
                       // Clinical Disclaimer on Page 2
                       doc.setDrawColor(241, 245, 249);
                       doc.line(20, nextY, 190, nextY);
                       
                       doc.setFont("helvetica", "bold");
                       doc.setFontSize(9);
                       doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                       doc.text("Clinical Disclaimer & Guidance:", 20, nextY + 8);
                       
                       doc.setFont("helvetica", "normal");
                       doc.setFontSize(8);
                       doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
                       const disclaimer = "HealthGuard AI is an automated screening tool leveraging custom deep learning models. This report is intended to provide quick clinical triaging support and explainable visualization. It does not replace a definitive medical diagnosis by a registered radiologist or pathologist. All positive findings must be validated using gold-standard diagnostic pathways.";
                       const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
                       doc.text(splitDisclaimer, 20, nextY + 13);
                       
                       // Bottom Footer Page Indicator
                       doc.setFontSize(8);
                       doc.setTextColor(148, 163, 184);
                       doc.text("HealthGuard AI Clinical Engine - Page 2 of 2", 105, 285, { align: 'center' });
                       
                       // Page 1 footer
                       doc.setPage(1);
                       doc.setFontSize(8);
                       doc.setTextColor(148, 163, 184);
                       doc.text("HealthGuard AI Clinical Engine - Page 1 of 2", 105, 285, { align: 'center' });
                       
                     } else {
                       // Clear case has only 1 page
                       doc.setDrawColor(241, 245, 249);
                       doc.line(20, nextY, 190, nextY);
                       
                       doc.setFont("helvetica", "bold");
                       doc.setFontSize(9);
                       doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                       doc.text("Clinical Disclaimer & Guidance:", 20, nextY + 8);
                       
                       doc.setFont("helvetica", "normal");
                       doc.setFontSize(8);
                       doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
                       const disclaimer = "HealthGuard AI is an automated screening tool leveraging custom deep learning models. This report is intended to provide quick clinical triaging support and explainable visualization. It does not replace a definitive medical diagnosis by a registered radiologist or pathologist. All positive findings must be validated using gold-standard diagnostic pathways.";
                       const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
                       doc.text(splitDisclaimer, 20, nextY + 13);
                       
                       // Bottom Footer Page Indicator
                       doc.setFontSize(8);
                       doc.setTextColor(148, 163, 184);
                       doc.text("HealthGuard AI Clinical Engine - Page 1 of 1", 105, 285, { align: 'center' });
                     }
                     
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

        /* GitHub SAA Settings Layout Rules */
        .account-page-shell { 
            width: 100%; 
            max-width: 960px; 
            margin: 0 auto; 
            padding: 2rem 3rem;
            display: flex;
            flex-direction: column;
        }

        /* Identity Bar */
        .gh-identity-bar { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            padding-bottom: 1.5rem; 
            border-bottom: 1px solid #f1f5f9; 
            margin-bottom: 2rem; 
        }
        .gh-identity-bar-left { display: flex; align-items: center; gap: 1.25rem; }
        .gh-identity-bar-avatar { 
            width: 56px; height: 56px; 
            border-radius: 50%; 
            background: #0f172a; 
            overflow: hidden; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 600; font-size: 1.25rem; color: #fff; 
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .gh-identity-bar-meta strong { font-size: 1.35rem; font-weight: 700; color: #0f172a; display: block; letter-spacing: -0.02em; }
        .gh-identity-bar-meta span { font-size: 0.85rem; color: #64748b; font-weight: 500; }

        /* Settings Grid */
        .gh-settings-layout { 
            display: flex; 
            gap: 3.5rem; 
            min-height: 50vh; 
        }
        
        /* Sidebar */
        .gh-settings-sidebar { 
            width: 220px; 
            flex-shrink: 0; 
        }
        .gh-sidebar-section { margin-bottom: 1.25rem; }
        .gh-sidebar-header { 
            font-size: 0.7rem; 
            font-weight: 800; 
            color: #94a3b8; 
            padding: 0 0.75rem 0.5rem; 
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
        }
        .gh-sidebar-btn { 
            display: flex; 
            align-items: center; 
            gap: 0.85rem; 
            padding: 0.5rem 0.85rem; 
            border-radius: 12px; 
            border: none; 
            background: transparent; 
            color: #64748b; 
            font-size: 0.95rem; 
            font-weight: 500; 
            cursor: pointer; 
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            text-align: left;
            width: 100%;
        }
        .gh-sidebar-btn:hover { color: #0f172a; background: #f8fafc; }
        .gh-sidebar-btn.active { 
            background: #f1f5f9; 
            color: #0f172a; 
            font-weight: 600; 
        }
        .gh-sidebar-btn svg { opacity: 0.6; transition: opacity 0.2s; }
        .gh-sidebar-btn.active svg { opacity: 1; color: #0f172a; }

        /* Main Content Area */
        .gh-settings-main { flex: 1; min-width: 0; }
        .gh-tab-title { 
            font-size: 1.5rem; 
            font-weight: 700; 
            color: #0f172a; 
            margin: 0 0 2rem 0; 
            letter-spacing: -0.03em;
        }

        /* Profile Layout */
        .gh-profile-layout { 
            display: flex; 
            flex-direction: row; 
            gap: 3.5rem; 
            align-items: flex-start;
        }
        .gh-profile-fields { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .gh-profile-avatar-section { 
            width: 180px; 
            flex-shrink: 0; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 1rem;
        }
        .gh-avatar-large { 
            width: 160px; height: 160px; 
            border-radius: 50%; 
            background: #0f172a; 
            overflow: hidden; 
            position: relative; 
            display: flex; align-items: center; justify-content: center; 
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        .gh-avatar-large:hover { 
            box-shadow: 0 15px 30px -5px rgba(0,0,0,0.08);
        }
        .gh-avatar-initials { font-size: 3rem; font-weight: 700; color: #ffffff; }

        .gh-avatar-edit-btn {
            margin-top: 0.5rem;
            padding: 0.4rem 1.15rem;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: #fff;
            color: #0f172a;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .gh-avatar-edit-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        /* Form Components */
        .gh-field { margin-bottom: 0.5rem; }
        .gh-field label { 
            display: block; 
            font-size: 0.8rem; 
            font-weight: 700; 
            color: #475569; 
            margin-bottom: 0.5rem; 
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .gh-input { 
            width: 100%; 
            max-width: 480px; 
            padding: 0.65rem 0.95rem; 
            border: 1px solid #e2e8f0; 
            border-radius: 12px; 
            font-size: 0.9rem; 
            color: #0f172a; 
            background: #fff; 
            transition: all 0.2s; 
            outline: none; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .gh-input:focus { 
            border-color: #0f172a; 
            box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05); 
        }
        .gh-input-readonly { 
            background: #f8fafc; 
            color: #64748b; 
            border-color: #f1f5f9; 
            font-weight: 500;
        }
        .gh-field-hint { 
            display: block; 
            font-size: 0.75rem; 
            color: #94a3b8; 
            margin-top: 0.5rem; 
            line-height: 1.5; 
        }

        /* Buttons */
        .gh-btn { 
            display: inline-flex; 
            align-items: center; 
            justify-content: center;
            gap: 0.5rem; 
            padding: 0.65rem 1.5rem; 
            border-radius: 12px; 
            font-size: 0.9rem; 
            font-weight: 700; 
            cursor: pointer; 
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            border: 1px solid transparent;
        }
        .gh-btn-save { 
            background: #0f172a; 
            color: #fff; 
            box-shadow: 0 6px 12px -3px rgba(15, 23, 42, 0.15); 
        }
        .gh-btn-save:hover { 
            background: #1e293b; 
            transform: translateY(-1px); 
            box-shadow: 0 10px 18px -4px rgba(15, 23, 42, 0.2); 
        }
        .gh-btn-save:active { transform: translateY(0); }
        
        .gh-btn-outline { 
            background: #fff; 
            color: #1e293b; 
            border-color: #e2e8f0; 
        }
        .gh-btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }

        /* Sectioning */
        .gh-form-section { margin-bottom: 2.5rem; }
        .gh-form-section-title { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .gh-form-section-desc { font-size: 0.9rem; color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; max-width: 700px; }
        .gh-form-divider { height: 1px; background: #f1f5f9; margin: 2.5rem 0; }

        /* Cards */
        .gh-2fa-status-card, .gh-notif-card { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            padding: 1.25rem; 
            border: 1px solid #f1f5f9; 
            border-radius: 16px; 
            background: #fff; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.01);
            transition: all 0.2s;
            max-width: 600px;
        }
        .gh-2fa-status-card:hover, .gh-notif-card:hover { 
            border-color: #e2e8f0; 
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.03);
        }
        
        .gh-2fa-indicator, .gh-notif-icon { 
            width: 44px; height: 44px; 
            border-radius: 12px; 
            display: flex; align-items: center; justify-content: center; 
            background: #f8fafc; 
            color: #94a3b8; border: 1px solid #f1f5f9;
        }
        .gh-2fa-indicator.enabled, .gh-notif-icon.active { 
            color: #10b981; 
            background: #f0fdf4; 
            border-color: #dcfce7; 
        }
        
        .gh-2fa-status-left strong, .gh-notif-card-info strong { font-size: 0.95rem; font-weight: 700; color: #0f172a; display: block; margin-bottom: 0.15rem; }
        .gh-2fa-status-left span, .gh-notif-card-info span { font-size: 0.8rem; color: #64748b; font-weight: 500; }

        /* Notification Events */
        .gh-notif-events-grid { display: flex; flex-direction: column; gap: 0.85rem; max-width: 600px; }
        .gh-notif-event-item { 
            display: flex; 
            align-items: center; 
            gap: 1rem; 
            padding: 1rem 1.25rem; 
            border: 1px solid #f1f5f9; 
            border-radius: 14px; 
            background: #fff; 
            transition: all 0.2s;
        }
        .gh-notif-event-item:hover { border-color: #e2e8f0; background: #f8fafc; }
        .gh-notif-event-check { 
            width: 24px; height: 24px; 
            border-radius: 50%; 
            background: #f0fdf4; color: #10b981; 
            display: flex; align-items: center; justify-content: center; 
            flex-shrink: 0; 
        }

        /* Toggle */
        .gh-toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
        .gh-toggle-slider { position: absolute; inset: 0; background: #e2e8f0; border-radius: 50px; cursor: pointer; transition: 0.3s; }
        .gh-toggle-slider::before { 
            content: ''; position: absolute; 
            width: 18px; height: 18px; 
            border-radius: 50%; background: #fff; 
            left: 3px; top: 3px; transition: 0.3s; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .gh-toggle input:checked + .gh-toggle-slider { background: #10b981; }
        .gh-toggle input:checked + .gh-toggle-slider::before { transform: translateX(20px); }
      `}</style>
    </div>
  );
}
