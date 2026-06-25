import { useState, useRef, useEffect } from 'react';
import { 
  Activity, Droplet, Upload, X, Download, Eye, History, Brain, 
  AlertTriangle, RefreshCw, Layers, ShieldCheck, Heart, Image as ImageIcon,
  CheckCircle, ArrowLeft, Info, HelpCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../lib/supabase';
import type { User, PatientDetails, AnalysisResult } from '../App';
import { jsPDF } from 'jspdf';

interface AnalysisPageProps {
  user: User;
  patientDetails: PatientDetails;
  onAnalysisComplete: (result: AnalysisResult) => void;
  history: AnalysisResult[];
  initialResult?: AnalysisResult | null;
  onClearInitialResult?: () => void;
}

type Disease = 'pneumonia' | 'malaria';
type Stage = 'select' | 'upload' | 'processing' | 'result';

export function AnalysisPage({ 
  user, 
  patientDetails, 
  onAnalysisComplete, 
  history,
  initialResult,
  onClearInitialResult
}: AnalysisPageProps) {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [stage, setStage] = useState<Stage>('select');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'heatmap'>('heatmap');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initialResult for dashboard investigation
  useEffect(() => {
    if (initialResult) {
      setSelectedDisease(initialResult.disease);
      setUploadedImage(initialResult.originalImage);
      setResult(initialResult);
      setViewMode('heatmap');
      setStage('result');
    }
  }, [initialResult]);

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
      // 1. Convert base64 image (uploadedImage) to Blob
      const response = await fetch(uploadedImage);
      const blob = await response.blob();

      // 2. Create form data
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('disease_type', selectedDisease);

      // 3. Request to backend
      const apiResponse = await fetch('https://ali55367-healthguard-backend.hf.space/predict', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      // 4. Parse results from your AI
      const backendResult = data.result;
      const detected = backendResult.diagnosis === 'Pneumonia' || backendResult.diagnosis === 'Parasitized';
      const confidence = Math.round(backendResult.confidence * 1000) / 10;
      
      // Determine severity based on confidence thresholds
      let severity: 'Mild' | 'Moderate' | 'Severe' | undefined = undefined;
      if (detected) {
        severity = confidence > 85 ? 'Severe' : confidence > 65 ? 'Moderate' : 'Mild';
      }
      
      const analysisResult: AnalysisResult = {
        disease: selectedDisease,
        detected,
        confidence,
        severity,
        originalImage: uploadedImage,
        processedImage: data.heatmap_image || uploadedImage,
        timestamp: new Date(),
        patientDetails
      };

      // 5. Save the history to Supabase Database
      await supabase.from('analysis_history').insert([{
        user_id: user.id,
        disease_type: selectedDisease,
        detected: detected,
        confidence: analysisResult.confidence,
        severity: analysisResult.severity || null,
        image_url: analysisResult.processedImage // Save the heatmap image
      }]);

      setResult(analysisResult);
      onAnalysisComplete(analysisResult);
      setStage('result');
      
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
    if (onClearInitialResult) {
      onClearInitialResult();
    }
  };

  const handleDownloadPDF = () => {
    if (!result || !patientDetails) return;
    
    const doc = new jsPDF();
    const diseaseName = result.disease === 'pneumonia' ? 'Pneumonia' : 'Malaria';
    
    // Page border
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, 10, 190, 277);
    
    // Hospital Logo/Branding Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(10, 10, 190, 35, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('HEALTHGUARD AI CLINICAL LABS', 15, 26);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('Diagnostic Automated Imaging & Pathology Report', 15, 33);
    doc.text(`DATE: ${result.timestamp.toLocaleDateString()}`, 150, 33);
    
    // Patient Profile Panel
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 52, 180, 42, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, 52, 180, 42);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('PATIENT DEMOGRAPHIC PROFILE', 20, 59);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Full Name:  ${patientDetails.fullName}`, 20, 68);
    doc.text(`Age / Gender:  ${patientDetails.age} yrs / ${patientDetails.gender}`, 20, 75);
    doc.text(`Phone:  ${patientDetails.phone}`, 20, 82);
    doc.text(`Clinic Address:  ${patientDetails.address}`, 20, 89);
    
    doc.text(`Emergency:  ${patientDetails.emergencyContact}`, 110, 68);
    doc.text(`History:  ${patientDetails.medicalHistory || 'None reported'}`, 110, 75);
    
    // Findings Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('AUTOMATED LABORATORY FINDINGS', 15, 108);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(15, 23, 42);
    doc.line(15, 111, 195, 111);
    
    // Diagnostic Details Table
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Screening Target:', 15, 120);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(diseaseName.toUpperCase(), 55, 120);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Pathology Detection:', 15, 128);
    
    if (result.detected) {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(220, 38, 38); // Red
      doc.text('POSITIVE ALERT - DETECTED', 55, 128);
    } else {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(22, 163, 74); // Green
      doc.text('NEGATIVE - NORMAL SCAN', 55, 128);
    }
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Confidence Score:', 15, 136);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${result.confidence}%`, 55, 136);
    
    if (result.severity) {
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Severity Index:', 15, 144);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text(result.severity, 55, 144);
    }
    
    // Diagnostic Visual Panel (Grad-CAM Overlay)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('GRAD-CAM DIAGNOSTIC LOCALIZATION OVERLAY', 15, 158);
    
    doc.rect(15, 163, 70, 70);
    doc.addImage(result.processedImage, 'JPEG', 16, 164, 68, 68);
    
    // Medical Recommendations text
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CLINICAL RECOMMENDATIONS & PROTOCOLS', 95, 168);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    
    let recommendations = [];
    if (result.detected) {
      recommendations = [
        "1. Flag patient profile for immediate physician/radiologist evaluation.",
        "2. Correlate automated findings with patient blood markers and clinical signs.",
        "3. ASHA Workers: Initiate rural telemedicine referral protocol instantly.",
        "4. Prescribe diagnostic verification exams (e.g., CT scan or thick smear PCR)."
      ];
    } else {
      recommendations = [
        "1. No immediate clinical action required for pneumonia or malaria classification.",
        "2. If respiratory or febrile symptoms persist, schedule a physical exam.",
        "3. Advise patient to monitor vital status and oxygenation parameters.",
        "4. Routine wellness follow-up scheduled in 6 calendar months."
      ];
    }
    
    let yPos = 175;
    recommendations.forEach(rec => {
      doc.text(rec, 95, yPos);
      yPos += 7;
    });
    
    // Physician Sign-off Box
    doc.setFillColor(248, 250, 252);
    doc.rect(95, 208, 100, 25, 'F');
    doc.rect(95, 208, 100, 25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('REVIEWING PHYSICIAN SIGNATURE BOX', 98, 214);
    doc.line(98, 227, 160, 227);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Authorized Signature & Stamp', 98, 231);
    
    // Legal Disclaimer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Disclaimer: This is an AI-powered diagnostic screening support tool. Automated findings must always be confirmed by a licensed medical practitioner prior to clinical treatment decisions.', 105, 275, { align: 'center', maxWidth: 180 });
    
    doc.save(`${patientDetails.fullName.replace(/\s+/g, '_')}_HealthGuard_Report.pdf`);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8 px-6 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 size-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 size-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto max-w-7xl">
        {/* Elite Header */}
        <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full mb-4 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              <Brain className="size-3.5" />
              Advanced AI Diagnostics
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {initialResult ? `Case Study: ${patientDetails.fullName}` : `Diagnostic Console`}
            </h1>
            <p className="text-slate-400 text-base mt-2">
              Review patient scans, activate Grad-CAM diagnostic localization, and download clinical laboratory reports.
            </p>
          </div>
          
          {initialResult && (
            <Button 
              onClick={handleReset} 
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-full px-5 py-2 border border-slate-700"
            >
              <ArrowLeft className="size-4 mr-2" />
              Return to Dashboard
            </Button>
          )}
        </div>

        <Tabs defaultValue="analyze" className="space-y-8">
          <TabsList className="bg-slate-950/80 border border-slate-800 p-1 rounded-full w-fit">
            <TabsTrigger 
              value="analyze"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-full px-6 py-2 font-bold text-sm text-slate-400 transition-all duration-300"
            >
              Diagnostic Console
            </TabsTrigger>
            {!initialResult && (
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-full px-6 py-2 font-bold text-sm text-slate-400 transition-all duration-300"
              >
                <History className="size-3.5 mr-2" />
                Diagnostic Logs ({history.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="analyze" className="space-y-8">
            {/* Disease Selection Stage */}
            {stage === 'select' && (
              <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                <Card 
                  className="cursor-pointer border-slate-800 bg-slate-950/60 backdrop-blur-md hover:border-indigo-500/50 hover:shadow-indigo-500/5 hover:shadow-2xl transition-all duration-500 group rounded-2xl overflow-hidden text-white"
                  onClick={() => handleDiseaseSelect('pneumonia')}
                >
                  <CardHeader className="p-10 relative">
                    <div className="size-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-indigo-500/20">
                      <Activity className="size-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-3 font-bold tracking-tight">Pneumonia Diagnostic support</CardTitle>
                    <CardDescription className="text-slate-400 text-sm leading-relaxed">
                      Upload frontal chest X-rays to activate artificial neural network screening. Detect abnormal alveolar opacities with visual Grad-CAM heatmap localization.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <Button className="w-full bg-slate-900 hover:bg-indigo-600 border border-slate-800 group-hover:border-indigo-500 text-white h-12 rounded-xl transition-all duration-300 font-bold">
                      Enter Console
                    </Button>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer border-slate-800 bg-slate-950/60 backdrop-blur-md hover:border-emerald-500/50 hover:shadow-emerald-500/5 hover:shadow-2xl transition-all duration-500 group rounded-2xl overflow-hidden text-white"
                  onClick={() => handleDiseaseSelect('malaria')}
                >
                  <CardHeader className="p-10 relative">
                    <div className="size-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-emerald-500/20">
                      <Droplet className="size-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-3 font-bold tracking-tight">Malaria Parasite screening</CardTitle>
                    <CardDescription className="text-slate-400 text-sm leading-relaxed">
                      Analyze thin-blood smear microscopic cell scans. Run computer vision models to flag plasmodium rings, mark parasites, and support cell counts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <Button className="w-full bg-slate-900 hover:bg-emerald-600 border border-slate-800 group-hover:border-emerald-500 text-white h-12 rounded-xl transition-all duration-300 font-bold">
                      Enter Console
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Upload Stage */}
            {stage === 'upload' && selectedDisease && (
              <Card className="border-slate-800 bg-slate-950/60 backdrop-blur-md rounded-2xl text-white">
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight">
                        Upload {selectedDisease === 'pneumonia' ? 'Chest X-ray Scan' : 'Blood Smear Slide'}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Upload clear raw digital files (JPEG, PNG • Max 10MB) for clinical classification.
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={handleReset}
                      className="rounded-full size-10 p-0 text-slate-400 hover:bg-slate-800"
                    >
                      <X className="size-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-xl p-16 text-center transition-all duration-300 cursor-pointer ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-500/5' 
                        : uploadedImage 
                        ? 'border-slate-800 bg-slate-900/40'
                        : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/30'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => !uploadedImage && fileInputRef.current?.click()}
                  >
                    {uploadedImage ? (
                      <div className="space-y-6">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded Scan" 
                          className="max-h-[350px] mx-auto rounded-lg border border-slate-800 shadow-2xl" 
                        />
                        <div className="flex gap-3 justify-center">
                          <Button 
                            variant="outline" 
                            onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                            className="rounded-full h-11 px-6 border-slate-800 text-slate-300 hover:bg-slate-800"
                          >
                            <X className="size-4 mr-2" />
                            Remove
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-11 px-8 shadow-lg shadow-indigo-900/30 font-bold transition-all duration-300"
                          >
                            <Brain className="size-4 mr-2 animate-pulse" />
                            Analyze Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="size-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                          <Upload className="size-6 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-base text-slate-300 mb-1 font-bold">Drag & drop your diagnostic image file here</p>
                          <p className="text-slate-500 text-sm">or click to browse local computer (JPEG, PNG)</p>
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
            )}

            {/* Processing Stage */}
            {stage === 'processing' && (
              <Card className="border-slate-800 bg-slate-950/60 backdrop-blur-md rounded-2xl text-white">
                <CardContent className="py-28">
                  <div className="text-center space-y-8">
                    <div className="size-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-indigo-500/30">
                      <Brain className="size-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2">Analyzing Pathology Scan</h2>
                      <p className="text-slate-400 text-sm">Deep neural layers are extracting feature activation maps...</p>
                    </div>
                    <div className="max-w-md mx-auto">
                      <div className="bg-slate-900 border border-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full animate-[progress_3.5s_ease-in-out]"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Result Stage */}
            {stage === 'result' && result && (
              <div className="space-y-8 animate-fade-in text-white">
                {/* Status Callout */}
                <div className={`border rounded-2xl p-6 relative overflow-hidden backdrop-blur-md ${
                  result.detected 
                    ? 'border-red-500/30 bg-red-950/20 text-red-100' 
                    : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">AI Diagnostic Verdict</div>
                      <h2 className="text-3xl font-extrabold tracking-tight">
                        {result.detected 
                          ? `${result.disease === 'pneumonia' ? 'Pneumonia Alert' : 'Malaria Parasite Detected'}`
                          : 'No Abnormal Pathology Detected'
                        }
                      </h2>
                      <div className="flex gap-6 mt-3 text-sm">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          Classification Confidence: 
                          <strong className="text-xl font-bold ml-1 text-white">{result.confidence}%</strong>
                        </span>
                        {result.severity && (
                          <span className="flex items-center gap-1.5 text-slate-300">
                            Severity: 
                            <strong className="text-xl font-bold ml-1 text-red-400">{result.severity}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleDownloadPDF} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold h-11 px-6 shadow-md shadow-indigo-900/20"
                      >
                        <Download className="size-4 mr-2" />
                        Download Report
                      </Button>
                      {!initialResult && (
                        <Button 
                          onClick={handleReset} 
                          variant="outline"
                          className="border-slate-800 hover:bg-slate-800 text-slate-300 rounded-full h-11 px-5"
                        >
                          New Analysis
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Scan Comparer Redesign */}
                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Left Column: Image Viewer (Original vs Heatmap) */}
                  <Card className="lg:col-span-3 border-slate-800 bg-slate-950/60 backdrop-blur-md rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-800 p-6 flex flex-row items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">Image Analysis Viewport</CardTitle>
                        <CardDescription className="text-slate-400">Toggle Grad-CAM feature activation maps</CardDescription>
                      </div>
                      
                      {/* Premium Toggle controls */}
                      <div className="bg-slate-900 p-1 border border-slate-800 rounded-full flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setViewMode('original')}
                          className={`rounded-full h-8 px-4 text-xs font-bold ${viewMode === 'original' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          <ImageIcon className="size-3.5 mr-1.5" />
                          Raw Scan
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setViewMode('heatmap')}
                          className={`rounded-full h-8 px-4 text-xs font-bold ${viewMode === 'heatmap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          <Layers className="size-3.5 mr-1.5" />
                          Grad-CAM
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[380px]">
                      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black/40 p-1.5 max-w-[420px] w-full">
                        {viewMode === 'original' ? (
                          <img 
                            src={result.originalImage} 
                            alt="Raw scan" 
                            className="w-full rounded-md object-contain max-h-[380px]"
                          />
                        ) : (
                          <img 
                            src={result.processedImage} 
                            alt="Heatmap scan" 
                            className="w-full rounded-md object-contain max-h-[380px]"
                          />
                        )}
                      </div>
                      
                      {/* Map scale indicator */}
                      {viewMode === 'heatmap' && (
                        <div className="w-full max-w-sm mt-4 flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span>Healthy</span>
                          <div className="flex-1 mx-4 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-600"></div>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span>Flagged Anomaly</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Right Column: Diagnostic Metrics Dashboard */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Patient info recap */}
                    <Card className="border-slate-800 bg-slate-950/60 backdrop-blur-md rounded-2xl text-white">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Demographic Record</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3.5 text-sm">
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-400">FullName</span>
                          <span className="font-semibold">{result.patientDetails.fullName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-400">Age / Gender</span>
                          <span className="font-semibold">{result.patientDetails.age} yrs / {result.patientDetails.gender}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-400">Address/Clinic</span>
                          <span className="font-semibold max-w-[200px] text-right truncate" title={result.patientDetails.address}>
                            {result.patientDetails.address}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Medical History</span>
                          <span className="font-semibold max-w-[200px] text-right truncate" title={result.patientDetails.medicalHistory}>
                            {result.patientDetails.medicalHistory || 'None declared'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommendations Alert Box */}
                    <Card className="border-slate-800 bg-slate-950/60 backdrop-blur-md rounded-2xl text-white">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-400">
                          <ShieldCheck className="size-5" />
                          Recommended Protocol
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-4">
                        {result.detected ? (
                          <div className="space-y-3.5 leading-relaxed">
                            <p className="text-red-400 font-bold">Review within 24 hours required:</p>
                            <p className="text-slate-300">
                              {result.severity === 'Severe'
                                ? 'Urgent physician evaluation requested. Flag profile and initiate clinical triage pathways.'
                                : 'Correlate computer findings with physical temperature, blood counts, and vital status.'
                              }
                            </p>
                            <div className="p-3 bg-slate-900/60 rounded-xl text-xs text-slate-500 border border-slate-850">
                              <strong>Diagnostic Support Disclaimer:</strong> Computer predictions assist clinical review; pathology decisions reside with licensed specialists.
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-emerald-400 font-bold">Standard Screening Passed:</p>
                            <p className="text-slate-300">
                              Alveolar lung fields and micro-cell staining exhibit normal density. Retake in 6 months for surveillance.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Diagnostic logs history */}
          <TabsContent value="history">
            <Card className="border-slate-800 bg-slate-950/60 backdrop-blur-md rounded-2xl text-white">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-bold tracking-tight">Clinical Diagnostic Logs</CardTitle>
                <CardDescription className="text-slate-400">Automated screening history registry</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {history.length === 0 ? (
                  <div className="text-center py-16 text-slate-600">
                    <History className="size-12 mx-auto mb-4" />
                    <p className="text-base font-bold mb-1">No clinical screening history yet</p>
                    <p className="text-sm">Initiate scans in the Diagnostic Console.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-5 p-5 border border-slate-900 rounded-xl hover:border-slate-800 hover:bg-slate-900/20 transition-all duration-300 bg-slate-950/30"
                      >
                        <div className="size-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          {item.disease === 'pneumonia' ? (
                            <Activity className="size-6" />
                          ) : (
                            <Droplet className="size-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold capitalize mb-0.5">{item.disease} Classification</h4>
                          <p className="text-slate-500 text-xs">{item.timestamp.toLocaleString()}</p>
                        </div>
                        
                        <div className="text-sm text-slate-400 mr-4">
                          Patient: <strong className="text-white">{item.patientDetails.fullName}</strong>
                        </div>
                        
                        <div className={`px-4 py-1 rounded-full text-xs font-bold ${
                          item.detected ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        }`}>
                          {item.detected ? 'Positive' : 'Normal'}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedDisease(item.disease);
                            setUploadedImage(item.originalImage);
                            setResult(item);
                            setViewMode('heatmap');
                            setStage('result');
                          }}
                          className="rounded-full h-9 px-4 text-xs font-bold border border-slate-800 text-indigo-400 hover:text-white hover:bg-slate-850"
                        >
                          <Eye className="size-3.5 mr-2" />
                          View Scan
                        </Button>
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
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}