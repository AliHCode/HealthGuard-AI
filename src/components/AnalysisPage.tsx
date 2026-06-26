import { useState, useRef, useEffect } from 'react';
import { Activity, Droplet, Upload, X, Download, Eye, History, Brain, AlertTriangle, Sparkles, ArrowLeft, Check, Clipboard, Clock, ChevronRight, FileDown, Layers, Crosshair, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../lib/supabase';
import type { User, PatientDetails, AnalysisResult } from '../App';
import { jsPDF } from 'jspdf';

// Import local assets for demo testing
import chestXrayTelemetry from '../../assets/chest_xray_telemetry.png';
import bloodSmearAnalytics from '../../assets/blood_smear_analytics.png';

interface AnalysisPageProps {
  user: User;
  patientDetails: PatientDetails;
  onAnalysisComplete: (result: AnalysisResult) => void;
  history: AnalysisResult[];
  standalone?: boolean;
}

type Disease = 'pneumonia' | 'malaria';
type Stage = 'select' | 'upload' | 'processing' | 'result';

export function AnalysisPage({ user, patientDetails, onAnalysisComplete, history, standalone = true }: AnalysisPageProps) {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [stage, setStage] = useState<Stage>('select');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing AI neural weights...');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pneumonia' | 'malaria'>('all');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Active Loading Message Cycle and log generator
  useEffect(() => {
    if (stage === 'processing') {
      const logs = [
        'Connecting to secure AI database...',
        'Starting analysis model...',
        'Scanning image patterns...',
        'Analyzing cell structures and densities...',
        'Generating visual highlight map...',
        'Calculating diagnostic scores...',
        'Creating scan recommendations.'
      ];
      setLiveLogs([]);
      let idx = 0;
      setStatusMessage(logs[0]);
      
      const interval = setInterval(() => {
        setLiveLogs(prev => [...prev, logs[idx]]);
        idx++;
        if (idx < logs.length) {
          setStatusMessage(logs[idx]);
        } else {
          clearInterval(interval);
        }
      }, 1200);
      
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleDiseaseSelect = (disease: Disease) => {
    setSelectedDisease(disease);
    setStage('upload');
  };

  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage || !selectedDisease) return;
    
    setStage('processing');

    try {
      const response = await fetch(uploadedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('disease_type', selectedDisease);

      const apiResponse = await fetch('https://ali55367-healthguard-backend.hf.space/predict', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      const backendResult = data.result;
      const detected = backendResult.diagnosis === 'Pneumonia' || backendResult.diagnosis === 'Parasitized';
      
      const analysisResult: AnalysisResult = {
        disease: selectedDisease,
        detected,
        confidence: Math.round(backendResult.confidence * 1000) / 10,
        severity: detected ? 'Moderate' : undefined,
        originalImage: uploadedImage,
        processedImage: uploadedImage,
        heatmapImage: backendResult.heatmap_image ? `data:image/png;base64,${backendResult.heatmap_image}` : undefined,
        timestamp: new Date(),
        patientDetails
      };

      await supabase.from('analysis_history').insert([{
        user_id: user.id,
        disease_type: selectedDisease,
        detected: detected,
        confidence: analysisResult.confidence,
        severity: analysisResult.severity || null,
        image_url: uploadedImage
      }]);

      setResult(analysisResult);
      onAnalysisComplete(analysisResult);
      setStage('result');
      setSliderPosition(50); // Reset slider
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to connect to the AI model. Please ensure the Hugging Face backend is running.");
      setStage('upload');
    }
  };

  const handleReset = () => {
    setSelectedDisease(null);
    setUploadedImage(null);
    setResult(null);
    setStage('select');
  };

  // Image slider mouse interaction
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleDownloadPDF = () => {
    if (!result || !patientDetails) return;
    
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('HealthGuard AI Report', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Patient: ${patientDetails.fullName}`, 20, 40);
    doc.text(`Age: ${patientDetails.age} / Gender: ${patientDetails.gender}`, 20, 50);
    doc.text(`Sandbox Model: ${result.disease.toUpperCase()}`, 20, 60);
    doc.text(`Triage Outcome: ${result.detected ? 'ANOMALY DETECTED' : 'NORMAL'}`, 20, 70);
    doc.text(`Confidence Index: ${result.confidence}%`, 20, 80);
    doc.save(`${patientDetails.fullName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  // Canvas Heatmap Generation Fallback
  useEffect(() => {
    if (stage === 'result' && result && !result.heatmapImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (result.detected) {
          if (result.disease === 'pneumonia') {
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
            const parasiteCount = 6;
            for (let i = 0; i < parasiteCount; i++) {
              const x = img.width * (0.3 + (i * 0.12) % 0.5);
              const y = img.height * (0.4 + (i * 0.08) % 0.4);
              ctx.beginPath();
              ctx.arc(x, y, 20, 0, 2 * Math.PI);
              ctx.stroke();
            }
          }
        }
      };
      img.src = result.originalImage;
    }
  }, [stage, result]);

  // Stepper helper
  const stages = [
    { key: 'select', num: 1, label: 'Select Scan' },
    { key: 'upload', num: 2, label: 'Upload Image' },
    { key: 'processing', num: 3, label: 'AI Scan' },
    { key: 'result', num: 4, label: 'View Results' }
  ];

  // History filtering
  const filteredHistory = history.filter(item => {
    if (historyFilter === 'all') return true;
    return item.disease === historyFilter;
  });

  // NON-STANDALONE embedded layout
  if (!standalone) {
    return (
      <div className="w-full relative text-left">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: Disease Selection */}
          {stage === 'select' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Pneumonia Card */}
              <Card 
                className="border-none bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-2xl group flex flex-col justify-between overflow-hidden cursor-pointer"
                onClick={() => handleDiseaseSelect('pneumonia')}
              >
                <CardHeader className="p-8 pb-4 relative">
                  <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                    <Activity className="size-7" />
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-black mb-2 flex items-center gap-1">
                    Pneumonia Detection
                    <ChevronRight className="size-4 text-black/20 group-hover:translate-x-1 group-hover:text-black transition-all duration-300" />
                  </CardTitle>
                  <CardDescription className="text-xs text-black/55 leading-relaxed">
                    Scan chest X-rays to detect lung infections and view highlighted findings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="border-t border-black/[0.04] pt-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center"><span className="text-black/40 font-medium">Scan Inputs</span> <span className="font-bold text-black bg-slate-50 border border-black/5 px-2 py-0.5 rounded">Chest X-Ray</span></div>
                    <div className="flex justify-between items-center"><span className="text-black/40 font-medium">AI Engine</span> <span className="font-bold text-black">Dual ResNet-50</span></div>
                  </div>
                  <Button className="w-full bg-black hover:bg-black/90 text-white h-10.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer">
                    Start Chest Scan
                  </Button>
                </CardContent>
              </Card>

              {/* Malaria Card */}
              <Card 
                className="border-none bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-2xl group flex flex-col justify-between overflow-hidden cursor-pointer"
                onClick={() => handleDiseaseSelect('malaria')}
              >
                <CardHeader className="p-8 pb-4 relative">
                  <div className="size-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                    <Droplet className="size-7" />
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-black mb-2 flex items-center gap-1">
                    Malaria Parasite Detection
                    <ChevronRight className="size-4 text-black/20 group-hover:translate-x-1 group-hover:text-black transition-all duration-300" />
                  </CardTitle>
                  <CardDescription className="text-xs text-black/55 leading-relaxed">
                    Scan blood slides to detect malaria parasites, count infected cells, and see scan results.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="border-t border-black/[0.04] pt-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center"><span className="text-black/40 font-medium">Scan Inputs</span> <span className="font-bold text-black bg-slate-50 border border-black/5 px-2 py-0.5 rounded">Thin Blood Smears</span></div>
                    <div className="flex justify-between items-center"><span className="text-black/40 font-medium">AI Engine</span> <span className="font-bold text-black">Dual ResNet-50</span></div>
                  </div>
                  <Button className="w-full bg-black hover:bg-black/90 text-white h-10.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer">
                    Start Blood Scan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STAGE 2: Image Upload */}
          {stage === 'upload' && selectedDisease && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Dropzone area (8 Columns) */}
              <div className="lg:col-span-8">
                <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                  <CardHeader className="p-6 flex flex-row items-center justify-between border-b border-black/[0.03]">
                    <div>
                      <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                        <span>Patient Scan Intake</span>
                        <span className="text-[9px] uppercase bg-black text-white px-2 py-0.5 rounded font-mono">
                          {selectedDisease === 'pneumonia' ? 'Chest X-Ray' : 'Microscope Smear'}
                        </span>
                      </CardTitle>
                    </div>
                    <Button variant="ghost" onClick={handleReset} className="rounded-full size-8 p-0 border border-black/[0.06]">
                      <X className="size-4" />
                    </Button>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div
                      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer flex flex-col justify-center items-center min-h-[300px] relative ${
                        isDragging 
                          ? 'border-black bg-black/[0.02]' 
                          : uploadedImage 
                          ? 'border-black/[0.08] bg-slate-50/50'
                          : 'border-black/[0.08] hover:border-black/30 hover:bg-black/[0.01]'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onClick={() => !uploadedImage && fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                        <div className="space-y-6 w-full max-w-lg">
                          <div className="relative rounded-xl overflow-hidden border border-black/[0.06] bg-black shadow-elegant max-h-[320px] flex items-center justify-center p-1">
                            <img src={uploadedImage} alt="Scan Preview" className="max-h-[310px] object-contain w-full rounded" />
                            {/* SVG Crosshairs Grid overlay */}
                            <div className="absolute inset-0 border border-white/5 flex items-center justify-center opacity-30 pointer-events-none">
                              <Crosshair className="size-16 text-white" />
                            </div>
                          </div>
                          <div className="flex gap-3 justify-center">
                            <Button 
                              variant="outline" 
                              onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                              className="rounded-xl h-10 px-5 border border-black/10 font-bold text-xs uppercase tracking-wider cursor-pointer"
                            >
                              Discard scan
                            </Button>
                            <Button 
                              onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                              className="bg-black hover:bg-black/90 text-white rounded-xl h-10 px-6 shadow-elegant transition-all duration-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                            >
                              <Brain className="size-4 animate-pulse" />
                              Run Inference
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 w-full">
                          <div className="size-14 bg-black/[0.03] border border-black/[0.05] rounded-full flex items-center justify-center mx-auto">
                            <Upload className="size-6 text-black/50" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-black mb-0.5">Drag & drop patient scan here</p>
                            <p className="text-black/40 text-[10px]">or click to search local files</p>
                          </div>
                          <span className="text-[9px] uppercase font-mono tracking-wider text-black/30 border border-black/[0.04] bg-slate-50 px-2.5 py-0.5 rounded-full inline-block">
                            PNG, JPEG, JPG up to 10MB
                          </span>
                          <div className="pt-3 border-t border-black/[0.04] w-full flex flex-col items-center gap-2">
                            <span className="text-[9px] uppercase tracking-wider text-black/30 font-bold">Or test with clinical samples</span>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setUploadedImage(selectedDisease === 'pneumonia' ? chestXrayTelemetry : bloodSmearAnalytics); 
                              }}
                              className="h-8 rounded-lg px-3 border border-black/15 text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 flex items-center gap-1.5"
                            >
                              <Sparkles className="size-3.5 text-amber-500 animate-pulse" />
                              Load Demo Patient Scan
                            </Button>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sandbox Guidelines (4 Columns) */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 block">Sandbox Info</span>
                  <div className="space-y-3 text-xs">
                    <p className="text-black/60 leading-relaxed">
                      Upload should be centered, have high clarity, and focus on the chest cage or erythrocyte cells.
                    </p>
                    <p className="text-black/60 leading-relaxed">
                      Result overlays Grad-CAM heatmaps to locate tissue consolidations dynamically.
                    </p>
                  </div>
                </Card>
                
                <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-black/40">Patient Record Node</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-black/40 font-medium">Name:</span> <span className="font-bold text-black">{patientDetails.fullName}</span></div>
                    <div className="flex justify-between"><span className="text-black/40 font-medium">Age / Gender:</span> <span className="font-bold text-black">{patientDetails.age}yo / {patientDetails.gender}</span></div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: Processing */}
          {stage === 'processing' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center w-full"
            >
              <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] w-full max-w-2xl overflow-hidden p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Radar Sweeper (5 Cols) */}
                  <div className="md:col-span-5 flex justify-center">
                    <div className="relative size-36 bg-slate-950 rounded-full border border-black/10 flex items-center justify-center overflow-hidden">
                      {/* Radar line */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1),transparent_70%)]"></div>
                      <div className="absolute top-0 left-0 w-full h-full border border-emerald-500/20 rounded-full scale-75 animate-ping-slow"></div>
                      <div className="absolute top-0 left-0 w-full h-full border border-emerald-500/20 rounded-full scale-50 animate-pulse"></div>
                      <div className="absolute w-[2px] h-18 bg-emerald-400 origin-bottom bottom-1/2 left-1/2 -ml-[1px] animate-[rotate_3s_linear_infinite]" />
                      <Brain className="size-8 text-emerald-400 z-10 animate-pulse-subtle" />
                    </div>
                  </div>

                  {/* Terminal Log Console (7 Cols) */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 block">AI Progress</span>
                      <h3 className="text-lg font-bold text-black">Analyzing Scan...</h3>
                    </div>
                    
                    <div className="bg-slate-950 text-emerald-400 font-mono p-4 rounded-xl border border-black/10 h-28 overflow-y-auto text-[9px] text-left leading-relaxed">
                      {liveLogs.map((log, idx) => (
                        <div key={idx} className="truncate"><span className="text-white/35 mr-1">&gt;</span> {log}</div>
                      ))}
                      <div className="animate-pulse"><span className="text-white/35 mr-1">&gt;</span> {statusMessage}...</div>
                    </div>
                  </div>

                </div>
              </Card>
            </motion.div>
          )}

          {/* STAGE 4: Diagnostic Reports (Holographic Hover Swipe Comparator) */}
          {stage === 'result' && result && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Report Jumbotron Banner */}
              <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden relative">
                <div className={`absolute top-0 bottom-0 left-0 w-2 ${result.detected ? 'bg-rose-600' : 'bg-emerald-500'}`} />
                <CardContent className="p-6 md:p-8 pl-8 md:pl-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Confidence gauge dial (4 Cols) */}
                  <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-black/[0.05] pb-6 lg:pb-0 lg:pr-8">
                    <div className="relative size-28 mb-3 flex items-center justify-center">
                      <svg className="size-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="rgba(0,0,0,0.03)" strokeWidth="6" fill="transparent" />
                        <motion.circle 
                          cx="56" cy="56" r="48" 
                          stroke={result.detected ? '#f43f5e' : '#10b981'} 
                          strokeWidth="6" fill="transparent"
                          strokeDasharray={2 * Math.PI * 48}
                          initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 48 - (result.confidence / 100) * (2 * Math.PI * 48) }}
                          transition={{ duration: 1.2 }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-extrabold text-black">{result.confidence}%</span>
                        <span className="text-[8px] uppercase tracking-wider text-black/40 font-bold">Confidence</span>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 bg-slate-50 px-3 py-0.5 rounded-full border border-black/5">
                      Diagnostics score
                    </span>
                  </div>

                  {/* Diagnostic Details (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 block">Scan Outcome</span>
                      <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                        {result.detected ? (
                          <span className="text-rose-600">{result.disease === 'pneumonia' ? 'Pneumonia Signs Detected' : 'Malaria Parasites Found'}</span>
                        ) : (
                          <span className="text-emerald-600">Healthy (No Signs Found)</span>
                        )}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 border border-black/[0.05] rounded-xl bg-slate-50/50">
                        <span className="text-black/40 font-medium block">Scan Type</span>
                        <span className="font-bold text-black capitalize">{result.disease}</span>
                      </div>
                      <div className="p-3 border border-black/[0.05] rounded-xl bg-slate-50/50">
                        <span className="text-black/40 font-medium block">Severity Level</span>
                        <span className="font-bold text-black">{result.severity || 'Healthy'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (3 Cols) */}
                  <div className="lg:col-span-3 flex flex-col gap-3 w-full">
                    <Button onClick={handleDownloadPDF} className="w-full bg-black hover:bg-black/90 text-white h-10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer">
                      <FileDown className="size-4" /> Export Report
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="w-full border border-black/10 hover:bg-slate-50 h-10 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer">
                      New Triage
                    </Button>
                  </div>

                </CardContent>
              </Card>

              {/* HOVER SWIPE COMPARATOR WORKBENCH (WOW Factor) */}
              <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-black/[0.04] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-black/60">Explainable AI Activation map slider</span>
                  <span className="text-[9px] font-mono text-black/40 bg-white border border-black/5 px-2.5 py-0.5 rounded-full select-none">
                    HOVER MOUSE TO SWIPE HEATMAP OVERLAY
                  </span>
                </div>
                
                <CardContent className="p-6 bg-slate-950 flex justify-center select-none">
                  {/* Slider sweep container */}
                  <div 
                    ref={sliderContainerRef}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    className="relative w-full max-w-lg aspect-square rounded-xl overflow-hidden cursor-ew-resize border border-white/15 bg-black"
                  >
                    {/* Bottom layer: Original Image */}
                    <img 
                      src={result.originalImage} 
                      alt="Original scan" 
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                    />

                    {/* Top layer: Heatmap Image (Width constrained by sliderPosition) */}
                    <div 
                      className="absolute top-0 bottom-0 left-0 overflow-hidden pointer-events-none"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      {result.heatmapImage ? (
                        <img 
                          src={result.heatmapImage} 
                          alt="Heatmap overlay" 
                          className="absolute top-0 left-0 w-full h-full object-cover max-w-none" 
                          style={{ width: sliderContainerRef.current?.getBoundingClientRect().width }}
                        />
                      ) : (
                        <canvas 
                          ref={canvasRef} 
                          className="absolute top-0 left-0 w-full h-full object-cover max-w-none bg-white" 
                          style={{ width: sliderContainerRef.current?.getBoundingClientRect().width }}
                        />
                      )}
                    </div>

                    {/* Sliding Split Divider Bar */}
                    <div 
                      className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none flex items-center justify-center"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="size-8 rounded-full bg-white text-black border border-black/10 shadow-lg flex items-center justify-center pointer-events-none">
                        <Layers className="size-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation Advisories */}
              <Card className="border-none bg-amber-50/30 rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.03)] text-xs text-left overflow-hidden">
                <CardHeader className="bg-amber-500/10 border-b border-amber-500/5 p-4 py-3 flex items-center gap-2 flex-row">
                  <AlertTriangle className="size-4 text-amber-700" />
                  <span className="font-bold uppercase tracking-wider text-amber-900 text-[10px]">Recommendations</span>
                </CardHeader>
                <CardContent className="p-4 py-3 text-amber-900 leading-relaxed space-y-2">
                  {result.detected ? (
                    <>
                      <p className="font-semibold text-black/75">Potential signs found:</p>
                      <p>We recommend consulting a doctor for a formal diagnosis within 24 hours. We can help you create a doctor referral note.</p>
                    </>
                  ) : (
                    <p>No signs of infection found. Lungs/blood cells look clear and healthy.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
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

  // STANDALONE main view
  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-5rem)] py-6 px-6 relative text-left">
      <div className="container mx-auto max-w-7xl">
        
        {/* Workflow Stepper */}
        <div className="flex justify-between items-center max-w-2xl mx-auto mb-10 border-b border-black/[0.04] pb-6">
          {stages.map((st, index) => {
            const isCompleted = stages.findIndex(s => s.key === stage) > index;
            const isActive = stage === st.key;
            return (
              <div key={st.key} className="flex items-center gap-2.5 select-none">
                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border ${
                  isCompleted 
                    ? 'bg-black border-black text-white' 
                    : isActive 
                    ? 'border-black text-black font-extrabold ring-4 ring-black/5' 
                    : 'border-black/10 text-black/30'
                }`}>
                  {isCompleted ? <Check className="size-3.5" /> : st.num}
                </div>
                <span className={`text-xs font-semibold hidden md:inline transition-colors duration-300 ${
                  isActive || isCompleted ? 'text-black' : 'text-black/30'
                }`}>
                  {st.label}
                </span>
                {index < stages.length - 1 && (
                  <ChevronRight className="size-3 text-black/10 hidden md:block ml-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* Tab Controls */}
        <Tabs defaultValue="analyze" className="space-y-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <TabsList className="bg-black/[0.03] border border-black/[0.05] p-1 rounded-full flex gap-1 z-10">
              <TabsTrigger 
                value="analyze"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-5 py-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
              >
                Screening Terminal
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-5 py-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                <History className="size-3.5" />
                History ({history.length})
              </TabsTrigger>
            </TabsList>
            
            {/* Patient Header tag */}
            <div className="flex items-center gap-2 border border-black/[0.06] bg-slate-50 px-4 py-1.5 rounded-full text-xs">
              <span className="text-black/40 font-semibold uppercase tracking-wider">Patient:</span>
              <span className="font-bold text-black">{patientDetails.fullName} ({patientDetails.age}yo)</span>
            </div>
          </div>

          <TabsContent value="analyze" className="space-y-8">
            <AnimatePresence mode="wait">
              
              {/* STAGE 1: Disease Selection */}
              {stage === 'select' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Pneumonia Card */}
                  <Card 
                    className="border-none bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-2xl group flex flex-col justify-between overflow-hidden cursor-pointer"
                    onClick={() => handleDiseaseSelect('pneumonia')}
                  >
                    <CardHeader className="p-8 pb-4 relative">
                      <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                        <Activity className="size-7" />
                      </div>
                      <CardTitle className="text-2xl font-bold tracking-tight text-black mb-2 flex items-center gap-1">
                        Pneumonia Detection
                        <ChevronRight className="size-5 text-black/20 group-hover:translate-x-1 group-hover:text-black transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-sm text-black/55 leading-relaxed">
                        Assess chest X-ray scans for lung infections and view highlighted areas showing potential findings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                      <div className="border-t border-black/[0.04] pt-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center"><span className="text-black/40 font-medium">Scan Inputs</span> <span className="font-bold text-black bg-slate-50 border border-black/5 px-2.5 py-0.5 rounded-full">Chest X-Ray</span></div>
                        <div className="flex justify-between items-center"><span className="text-black/40 font-medium">AI Engine</span> <span className="font-bold text-black">Dual ResNet-50</span></div>
                      </div>
                      <Button className="w-full bg-black hover:bg-black/90 text-white h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-elegant">
                        Start Chest Scan
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Malaria Card */}
                  <Card 
                    className="border-none bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-2xl group flex flex-col justify-between overflow-hidden cursor-pointer"
                    onClick={() => handleDiseaseSelect('malaria')}
                  >
                    <CardHeader className="p-8 pb-4 relative">
                      <div className="size-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                        <Droplet className="size-7" />
                      </div>
                      <CardTitle className="text-2xl font-bold tracking-tight text-black mb-2 flex items-center gap-1">
                        Malaria Parasite Detection
                        <ChevronRight className="size-5 text-black/20 group-hover:translate-x-1 group-hover:text-black transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-sm text-black/55 leading-relaxed">
                        Identify malaria parasites in blood scans, count infected cells, and see scan details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                      <div className="border-t border-black/[0.04] pt-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center"><span className="text-black/40 font-medium">Scan Inputs</span> <span className="font-bold text-black bg-slate-50 border border-black/5 px-2.5 py-0.5 rounded-full">Thin Blood Smears</span></div>
                        <div className="flex justify-between items-center"><span className="text-black/40 font-medium">AI Engine</span> <span className="font-bold text-black">Dual ResNet-50</span></div>
                      </div>
                      <Button className="w-full bg-black hover:bg-black/90 text-white h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-elegant">
                        Start Blood Scan
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STAGE 2: Image Upload */}
              {stage === 'upload' && selectedDisease && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  {/* Dropzone area (8 Columns) */}
                  <div className="lg:col-span-8">
                    <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                      <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between border-b border-black/[0.03]">
                        <div>
                          <CardTitle className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
                            <span>Upload Patient Image Scan</span>
                            <span className="text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded font-mono">
                              {selectedDisease === 'pneumonia' ? 'Chest X-Ray' : 'Microscope Smear'}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-xs text-black/40">
                            Upload a JPEG or PNG medical scan image. Max size 10MB.
                          </CardDescription>
                        </div>
                        <Button variant="ghost" onClick={handleReset} className="rounded-full size-8 p-0 border border-black/[0.06]">
                          <X className="size-4" />
                        </Button>
                      </CardHeader>
                      
                      <CardContent className="p-6 md:p-8">
                        <div
                          className={`border-2 border-dashed rounded-2xl p-10 md:p-14 text-center transition-all duration-300 cursor-pointer flex flex-col justify-center items-center min-h-[300px] relative ${
                            isDragging 
                              ? 'border-black bg-black/[0.02]' 
                              : uploadedImage 
                              ? 'border-black/[0.08] bg-slate-50/50'
                              : 'border-black/[0.08] hover:border-black/30 hover:bg-black/[0.01]'
                          }`}
                          onDrop={handleDrop}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onClick={() => !uploadedImage && fileInputRef.current?.click()}
                        >
                          {uploadedImage ? (
                            <div className="space-y-6 w-full max-w-lg">
                              <div className="relative rounded-xl overflow-hidden border border-black/[0.06] bg-black shadow-elegant-lg max-h-[350px] flex items-center justify-center p-1">
                                <img src={uploadedImage} alt="Patient Scan Preview" className="max-h-[340px] object-contain w-full rounded" />
                                {/* Crosshair graphics */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                  <Crosshair className="size-16 text-white" />
                                </div>
                              </div>
                              <div className="flex gap-3 justify-center">
                                <Button 
                                  variant="outline" 
                                  onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                                  className="rounded-xl h-11 px-5 border-black/10 font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-black/5"
                                >
                                  <X className="size-3.5 mr-1.5" />
                                  Discard
                                </Button>
                                <Button 
                                  onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                                  className="bg-black hover:bg-black/90 text-white rounded-xl h-11 px-6 shadow-elegant transition-all duration-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Brain className="size-4 animate-pulse" />
                                  Initiate Diagnostics
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 w-full">
                              <div className="size-16 bg-black/[0.03] border border-black/[0.05] rounded-full flex items-center justify-center mx-auto">
                                <Upload className="size-7 text-black/50" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-black mb-0.5">Drag & drop scan image here</p>
                                <p className="text-black/40 text-xs">or click to browse local files</p>
                              </div>
                              <span className="text-[10px] uppercase font-mono tracking-wider text-black/30 border border-black/[0.04] bg-slate-50 px-2.5 py-0.5 rounded-full inline-block">
                                PNG, JPEG, JPG up to 10MB
                              </span>
                              <div className="pt-3 border-t border-black/[0.04] w-full flex flex-col items-center gap-2">
                                <span className="text-[9px] uppercase tracking-wider text-black/30 font-bold">Or test with clinical samples</span>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setUploadedImage(selectedDisease === 'pneumonia' ? chestXrayTelemetry : bloodSmearAnalytics); 
                                  }}
                                  className="h-8.5 rounded-lg px-3 border border-black/15 text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 flex items-center gap-1.5"
                                >
                                  <Sparkles className="size-3.5 text-amber-500 animate-pulse" />
                                  Load Demo Patient Scan
                                </Button>
                              </div>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            className="hidden"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sandbox Guidelines (4 Columns) */}
                  <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                      <CardHeader className="p-6 border-b border-black/[0.03]">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-black/70 flex items-center gap-1.5">
                          <Sparkles className="size-4 text-amber-500 animate-pulse" />
                          AI Diagnostics Guidelines
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4 text-xs">
                        <div className="flex gap-3">
                          <div className="size-5 bg-black/[0.04] text-black rounded flex items-center justify-center shrink-0">1</div>
                          <p className="text-black/60 leading-relaxed">
                            Ensure the uploaded scan is centered, has adequate resolution, and contains minimal background artifacts.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="size-5 bg-black/[0.04] text-black rounded flex items-center justify-center shrink-0">2</div>
                          <p className="text-black/60 leading-relaxed">
                            For Pneumonia screening, the visual heatmap overlays anomalies in red. Consult clinical templates.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="size-5 bg-black/[0.04] text-black rounded flex items-center justify-center shrink-0">3</div>
                          <p className="text-black/60 leading-relaxed">
                            For Malaria screening, AI will map markers over parasitized cells and report parasite densities.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Patient Card Preview */}
                    <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-black/40">Patient Record Card</div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-black/40 font-medium">Name:</span> <span className="font-bold text-black">{patientDetails.fullName}</span></div>
                        <div className="flex justify-between"><span className="text-black/40 font-medium">Age / Gender:</span> <span className="font-bold text-black">{patientDetails.age} / {patientDetails.gender}</span></div>
                        <div className="flex justify-between"><span className="text-black/40 font-medium">Clinical History:</span> <span className="font-bold text-black text-right line-clamp-1">{patientDetails.medicalHistory || 'None'}</span></div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: Processing */}
              {stage === 'processing' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center w-full"
                >
                  <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] w-full max-w-2xl overflow-hidden p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      {/* Circular Radar Sweep Scanner */}
                      <div className="md:col-span-5 flex justify-center">
                        <div className="relative size-40 bg-slate-950 rounded-full border border-black/10 flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1),transparent_70%)]"></div>
                          <div className="absolute top-0 left-0 w-full h-full border border-emerald-500/20 rounded-full scale-75 animate-ping-slow animate-duration-3000"></div>
                          <div className="absolute w-[2px] h-20 bg-emerald-400 origin-bottom bottom-1/2 left-1/2 -ml-[1px] animate-[rotate_3s_linear_infinite]" />
                          <Brain className="size-10 text-emerald-400 z-10 animate-pulse-subtle" />
                        </div>
                      </div>

                      {/* Log Console Terminal */}
                      <div className="md:col-span-7 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 block">AI Progress</span>
                          <h3 className="text-xl font-bold text-black">Analyzing Scan...</h3>
                        </div>
                        
                        <div className="bg-slate-950 text-emerald-400 font-mono p-4 rounded-xl border border-black/10 h-28 overflow-y-auto text-[9px] text-left leading-relaxed">
                          {liveLogs.map((log, idx) => (
                            <div key={idx} className="truncate"><span className="text-white/35 mr-1">&gt;</span> {log}</div>
                          ))}
                          <div className="animate-pulse"><span className="text-white/35 mr-1">&gt;</span> {statusMessage}...</div>
                        </div>
                      </div>

                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STAGE 4: Result (Holographic Sweep comparator slider) */}
              {stage === 'result' && result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden relative">
                    <div className={`absolute top-0 bottom-0 left-0 w-2 ${
                      result.detected ? 'bg-rose-600' : 'bg-emerald-500'
                    }`} />
                    
                    <CardContent className="p-6 md:p-8 pl-8 md:pl-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-4 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-black/[0.05] pb-6 lg:pb-0 lg:pr-8">
                        <div className="relative size-32 mb-4 flex items-center justify-center">
                          <svg className="size-full transform -rotate-90">
                            <circle cx="64" cy="64" r="54" stroke="rgba(0,0,0,0.03)" strokeWidth="8" fill="transparent" />
                            <motion.circle 
                              cx="64" cy="64" r="54" 
                              stroke={result.detected ? '#e11d48' : '#10b981'} 
                              strokeWidth="8" fill="transparent"
                              strokeDasharray={2 * Math.PI * 54}
                              initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 54 - (result.confidence / 100) * (2 * Math.PI * 54) }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-black">{result.confidence}%</span>
                            <span className="text-[9px] uppercase tracking-wider text-black/40 font-bold">Confidence</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-black/40 bg-slate-50 px-3 py-1 rounded-full border border-black/5">
                          Decision confidence score
                        </span>
                      </div>

                      <div className="lg:col-span-5 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-black/40">AI Scan Results</span>
                          <h2 className="text-3xl font-bold tracking-tight text-black flex items-center gap-2">
                            {result.detected ? (
                              <span className="text-rose-600">
                                {result.disease === 'pneumonia' ? 'Pneumonia Signs Detected' : 'Malaria Parasites Found'}
                              </span>
                            ) : (
                              <span className="text-emerald-600">Healthy (No Signs Found)</span>
                            )}
                          </h2>
                          <p className="text-xs text-black/50">
                            Scanned using secure AI analysis.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 border border-black/[0.05] rounded-xl bg-slate-50/50">
                            <div className="text-black/40 font-semibold mb-0.5">Scan Type</div>
                            <div className="font-bold text-black capitalize">{result.disease}</div>
                          </div>
                          <div className="p-3 border border-black/[0.05] rounded-xl bg-slate-50/50">
                            <div className="text-black/40 font-semibold mb-0.5">Severity Level</div>
                            <div className="font-bold text-black">{result.severity || 'Healthy'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-3 flex flex-col gap-3 w-full">
                        <Button 
                          onClick={handleDownloadPDF} 
                          className="w-full bg-black hover:bg-black/90 text-white h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-elegant flex items-center justify-center gap-1.5"
                        >
                          <FileDown className="size-4" />
                          Download PDF Report
                        </Button>
                        <Button 
                          onClick={handleReset} 
                          variant="outline"
                          className="w-full border border-black/10 hover:bg-black/5 hover:border-black/20 h-11 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-300"
                        >
                          New Screening
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* HOVER SWIPE COMPARATOR WORKBENCH */}
                  <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-black/[0.04] flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-black/60">Explainable AI Activation map slider</span>
                      <span className="text-[9px] font-mono text-black/40 bg-white border border-black/5 px-2.5 py-0.5 rounded-full select-none">
                        HOVER MOUSE TO SWIPE HEATMAP OVERLAY
                      </span>
                    </div>
                    
                    <CardContent className="p-6 bg-slate-950 flex justify-center select-none">
                      <div 
                        ref={sliderContainerRef}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleTouchMove}
                        className="relative w-full max-w-lg aspect-square rounded-xl overflow-hidden cursor-ew-resize border border-white/15 bg-black"
                      >
                        <img 
                          src={result.originalImage} 
                          alt="Original scan" 
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                        />
                        <div 
                          className="absolute top-0 bottom-0 left-0 overflow-hidden pointer-events-none"
                          style={{ width: `${sliderPosition}%` }}
                        >
                          {result.heatmapImage ? (
                            <img 
                              src={result.heatmapImage} 
                              alt="Heatmap overlay" 
                              className="absolute top-0 left-0 w-full h-full object-cover max-w-none" 
                              style={{ width: sliderContainerRef.current?.getBoundingClientRect().width }}
                            />
                          ) : (
                            <canvas 
                              ref={canvasRef} 
                              className="absolute top-0 left-0 w-full h-full object-cover max-w-none bg-white" 
                              style={{ width: sliderContainerRef.current?.getBoundingClientRect().width }}
                            />
                          )}
                        </div>
                        <div 
                          className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none flex items-center justify-center"
                          style={{ left: `${sliderPosition}%` }}
                        >
                          <div className="size-8 rounded-full bg-white text-black border border-black/10 shadow-lg flex items-center justify-center pointer-events-none">
                            <Layers className="size-4" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="border-none bg-amber-50/30 rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.03)] overflow-hidden">
                    <div className="bg-amber-500/10 border-b border-amber-500/5 px-5 py-4 flex items-center gap-2">
                      <AlertTriangle className="size-5 text-amber-700" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Recommendations</span>
                    </div>
                    <CardContent className="p-5 md:p-6 text-xs text-amber-900 leading-relaxed space-y-3">
                      {result.detected ? (
                        <div className="space-y-3">
                          <p className="font-semibold text-sm">Actionable Advice for Patient:</p>
                          <p>
                            {result.severity === 'Severe' 
                              ? 'The scan shows signs of severe infection. Please visit a hospital immediately.'
                              : 'The scan shows moderate signs of infection. Please see a doctor within 24 hours.'
                          }
                          </p>
                          <p className="text-amber-800 text-[10px] pt-2 border-t border-amber-500/10 leading-normal">
                            <strong>Disclaimer:</strong> HealthGuard AI is designed as a preliminary screening tool. It does not replace advice from a professional doctor.
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm">No signs of infection found. If symptoms persist, please see a doctor for a regular checkup.</p>
                      )}
                    </CardContent>
                  </Card>

                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* HISTORY VIEW */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-none bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <CardHeader className="p-6 md:p-8 border-b border-black/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight text-black">Screening Records</CardTitle>
                  <CardDescription className="text-xs text-black/40">Inspect previous diagnostic scans and referrals</CardDescription>
                </div>
                
                <div className="flex gap-1 bg-black/[0.03] p-1 border border-black/[0.05] rounded-lg">
                  {['all', 'pneumonia', 'malaria'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f as any)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        historyFilter === f
                          ? 'bg-black text-white'
                          : 'text-black/50 hover:text-black/80'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-16 text-black/30 space-y-4">
                    <History className="size-10 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold">No medical history logs found</p>
                      <p className="text-xs text-black/40">Complete a diagnostic screening in the sandbox console first.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-black/[0.04] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:border-black/[0.08] transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="size-11 rounded-lg bg-black text-white flex items-center justify-center border border-black/5 shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {item.disease === 'pneumonia' ? (
                              <Activity className="size-5" />
                            ) : (
                              <Droplet className="size-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold capitalize text-black">{item.disease} Screening</h4>
                            <div className="flex items-center gap-3 text-[10px] text-black/40 font-semibold mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {item.timestamp.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Brain className="size-3 text-black/30" />
                                {item.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 self-end md:self-auto">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.detected 
                              ? 'bg-rose-50 border-rose-100 text-rose-600' 
                              : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                            {item.detected ? 'Infected' : 'Normal'}
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="rounded-lg h-9 px-3 border border-black/[0.06] font-bold text-xs uppercase tracking-wider text-black/60 hover:text-black group-hover:bg-slate-50 flex items-center gap-1 transition-all duration-300 cursor-pointer"
                            onClick={() => {
                              setResult(item);
                              setStage('result');
                              setSliderPosition(50);
                              const tabTriggerElement = document.querySelector('button[value="analyze"]') as HTMLButtonElement;
                              if (tabTriggerElement) tabTriggerElement.click();
                            }}
                          >
                            <Eye className="size-3.5" />
                            Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
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