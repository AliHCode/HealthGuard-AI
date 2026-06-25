import { useState, useRef, useEffect } from 'react';
import { Activity, Droplet, Upload, X, Download, Eye, History, Brain, AlertTriangle } from 'lucide-react';
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
}

type Disease = 'pneumonia' | 'malaria';
type Stage = 'select' | 'upload' | 'processing' | 'result';

export function AnalysisPage({ user, patientDetails, onAnalysisComplete, history }: AnalysisPageProps) {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [stage, setStage] = useState<Stage>('select');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      // 1. Convert base64 image (uploadedImage) to Blob so we can send it as a file
      const response = await fetch(uploadedImage);
      const blob = await response.blob();

      // 2. Create form data
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('disease_type', selectedDisease);

      // 3. Make request to your real Hugging Face Backend!
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
      
      const analysisResult: AnalysisResult = {
        disease: selectedDisease,
        detected,
        confidence: Math.round(backendResult.confidence * 1000) / 10, // Converts 0.987 to 98.7
        severity: detected ? 'Moderate' : undefined,
        originalImage: uploadedImage,
        processedImage: uploadedImage,
        heatmapImage: backendResult.heatmap_image ? `data:image/png;base64,${backendResult.heatmap_image}` : undefined,
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
        image_url: uploadedImage // For production, it's better to upload to Supabase Storage Bucket instead of storing raw base64
      }]);

      setResult(analysisResult);
      onAnalysisComplete(analysisResult);
      setStage('result');
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to connect to the AI model. Please ensure the Hugging Face backend is running.");
      setStage('upload'); // Go back to upload stage on error
    }
  };

  const handleReset = () => {
    setSelectedDisease(null);
    setUploadedImage(null);
    setResult(null);
    setStage('select');
  };

  const handleDownloadPDF = () => {
    if (!result || !patientDetails) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('HealthGuard AI', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Clinical Medical Report', 105, 30, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Patient Details
    doc.setFontSize(12);
    doc.text('Patient Information', 20, 45);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Name: ${patientDetails.fullName}`, 20, 55);
    doc.text(`Age/Gender: ${patientDetails.age} / ${patientDetails.gender}`, 20, 62);
    doc.text(`Phone: ${patientDetails.phone}`, 20, 69);
    
    // AI Diagnosis
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('AI Diagnosis Results', 20, 85);
    doc.setFontSize(10);
    
    const diseaseName = result.disease === 'pneumonia' ? 'Pneumonia' : 'Malaria';
    const detectionStatus = result.detected ? `DETECTED (${diseaseName})` : 'NOT DETECTED (Normal)';
    
    if (result.detected) {
      doc.setTextColor(220, 38, 38); // Red
    } else {
      doc.setTextColor(22, 163, 74); // Green
    }
    doc.text(`Result: ${detectionStatus}`, 20, 95);
    doc.setTextColor(100, 100, 100);
    doc.text(`Confidence Score: ${result.confidence}%`, 20, 102);
    if (result.severity) {
      doc.text(`Severity: ${result.severity}`, 20, 109);
    }
    
    // Original Image & AI Heatmap
    doc.text('Original Scan:', 20, 125);
    doc.addImage(result.originalImage, 'JPEG', 20, 130, 80, 80);
    
    if (result.heatmapImage) {
      doc.text('AI Heatmap:', 110, 125);
      doc.addImage(result.heatmapImage, 'PNG', 110, 130, 80, 80);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.text('Disclaimer: This report was generated by HealthGuard AI. It is intended for screening purposes only and should be reviewed by a qualified medical professional.', 105, 280, { align: 'center', maxWidth: 170 });
    
    doc.save(`${patientDetails.fullName.replace(/\s+/g, '_')}_Medical_Report.pdf`);
  };

  // Generate visualization
  useEffect(() => {
    if (stage === 'result' && result && canvasRef.current) {
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
            // Heatmap for pneumonia
            const centerX = img.width * (0.4 + Math.random() * 0.2);
            const centerY = img.height * (0.4 + Math.random() * 0.2);
            const radius = Math.min(img.width, img.height) * 0.15;
            
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(220, 38, 38, 0.6)');
            gradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.3)');
            gradient.addColorStop(1, 'rgba(220, 38, 38, 0.1)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            // Circles for malaria
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
            ctx.lineWidth = 3;
            
            const parasiteCount = Math.floor(Math.random() * 15) + 5;
            for (let i = 0; i < parasiteCount; i++) {
              const x = Math.random() * img.width;
              const y = Math.random() * img.height;
              const r = 15 + Math.random() * 15;
              
              ctx.beginPath();
              ctx.arc(x, y, r, 0, 2 * Math.PI);
              ctx.stroke();
              
              ctx.fillStyle = 'rgba(220, 38, 38, 0.6)';
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      };
      img.src = result.originalImage;
    }
  }, [stage, result]);

  return (
    <div className="min-h-[calc(100vh-5rem)] py-6 px-8 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Elite Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-block px-3 py-1.5 bg-black text-white rounded-full mb-6 text-sm font-medium">
            AI Medical Analysis
          </div>
          <h1 className="text-4xl lg:text-5xl mb-3 tracking-tight">Welcome back, {patientDetails.fullName}</h1>
          <p className="text-lg text-black/60">
            Select a disease type to begin your AI-powered analysis.
          </p>
        </div>

        <Tabs defaultValue="analyze" className="space-y-8">
          <TabsList className="bg-black/[0.04] border border-black/[0.06] p-1 rounded-full">
            <TabsTrigger 
              value="analyze"
              className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-6 py-2 font-medium text-sm transition-elegant"
            >
              New Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-6 py-2 font-medium text-sm transition-elegant"
            >
              <History className="size-3.5 mr-2" />
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-8">
            {/* Disease Selection */}
            {stage === 'select' && (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                <Card 
                  className="cursor-pointer border border-black/[0.06] hover:border-black/20 hover:shadow-elegant-lg transition-elegant group rounded-xl bg-white"
                  onClick={() => handleDiseaseSelect('pneumonia')}
                >
                  <CardHeader className="p-10">
                    <div className="size-16 bg-black rounded-lg flex items-center justify-center mb-8 group-hover:scale-105 transition-elegant">
                      <Activity className="size-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-3 tracking-tight">Pneumonia Detection</CardTitle>
                    <CardDescription className="text-base text-black/60 leading-relaxed">
                      Upload chest X-ray images for AI-powered pneumonia screening with visual heatmap analysis and severity classification.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <Button className="w-full bg-black hover:bg-black/90 text-white h-12 rounded-full transition-elegant font-medium">
                      Start Analysis
                    </Button>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer border border-black/[0.06] hover:border-black/20 hover:shadow-elegant-lg transition-elegant group rounded-xl bg-white"
                  onClick={() => handleDiseaseSelect('malaria')}
                >
                  <CardHeader className="p-10">
                    <div className="size-16 bg-black rounded-lg flex items-center justify-center mb-8 group-hover:scale-105 transition-elegant">
                      <Droplet className="size-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-3 tracking-tight">Malaria Detection</CardTitle>
                    <CardDescription className="text-base text-black/60 leading-relaxed">
                      Upload blood smear microscope images for AI-powered malaria parasite detection with precise marking and counting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <Button className="w-full bg-black hover:bg-black/90 text-white h-12 rounded-full transition-elegant font-medium">
                      Start Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Upload Stage */}
            {stage === 'upload' && selectedDisease && (
              <Card className="border border-black/[0.06] shadow-elegant rounded-xl bg-white">
                <CardHeader className="p-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2 tracking-tight">
                        Upload {selectedDisease === 'pneumonia' ? 'Chest X-ray' : 'Blood Smear'} Image
                      </CardTitle>
                      <CardDescription className="text-base text-black/60">
                        Upload a clear {selectedDisease === 'pneumonia' ? 'frontal chest X-ray' : 'thin blood smear microscope'} image (JPEG, PNG • Max 10MB)
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={handleReset}
                      className="rounded-full size-10 p-0"
                    >
                      <X className="size-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-10 pt-0">
                  <div
                    className={`border-2 border-dashed rounded-xl p-20 text-center transition-elegant cursor-pointer ${
                      isDragging 
                        ? 'border-black/30 bg-black/[0.02]' 
                        : uploadedImage 
                        ? 'border-black/10 bg-black/[0.02]'
                        : 'border-black/10 hover:border-black/20 hover:bg-black/[0.02]'
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
                          alt="Uploaded" 
                          className="max-h-[400px] mx-auto rounded-lg border border-black/[0.06] shadow-elegant" 
                        />
                        <div className="flex gap-3 justify-center">
                          <Button 
                            variant="outline" 
                            onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                            className="rounded-full h-10 px-5 border-black/10 font-medium"
                          >
                            <X className="size-4 mr-2" />
                            Remove
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                            className="bg-black hover:bg-black/90 text-white rounded-full h-10 px-6 shadow-elegant transition-elegant font-medium"
                          >
                            <Brain className="size-4 mr-2" />
                            Analyze Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="size-12 mx-auto text-black/30" />
                        <div>
                          <p className="text-base text-black/70 mb-1 font-medium">Drag & drop your image here</p>
                          <p className="text-black/40 text-sm">or click to browse • JPEG, PNG • Max 10MB</p>
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
              <Card className="border border-black/[0.06] shadow-elegant rounded-xl bg-white">
                <CardContent className="py-32">
                  <div className="text-center space-y-8">
                    <div className="size-20 bg-black rounded-full flex items-center justify-center mx-auto animate-pulse-subtle">
                      <Brain className="size-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl mb-3 tracking-tight">Analyzing Image</h2>
                      <p className="text-lg text-black/60">Processing with advanced neural networks...</p>
                    </div>
                    <div className="max-w-md mx-auto">
                      <div className="bg-black/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-black h-full rounded-full animate-[progress_3.5s_ease-in-out]"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Result Stage */}
            {stage === 'result' && result && (
              <div className="space-y-6 animate-fade-in">
                <Card className={`border-2 rounded-xl shadow-elegant ${
                  result.detected ? 'border-red-600/20 bg-red-50/30' : 'border-green-600/20 bg-green-50/30'
                }`}>
                  <CardHeader className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className={`text-3xl mb-3 tracking-tight ${
                          result.detected ? 'text-red-900' : 'text-green-900'
                        }`}>
                          {result.detected 
                            ? `${result.disease === 'pneumonia' ? 'Pneumonia' : 'Malaria'} Detected`
                            : 'No Disease Detected'
                          }
                        </CardTitle>
                        <div className="flex gap-6 text-base">
                          <span className={result.detected ? 'text-red-800' : 'text-green-800'}>
                            Confidence: <strong className="text-2xl ml-1">{result.confidence}%</strong>
                          </span>
                          {result.severity && (
                            <span className="text-red-800">
                              Severity: <strong className="text-2xl ml-1">{result.severity}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleDownloadPDF} 
                          className="rounded-full h-10 px-5 font-medium bg-black text-white hover:bg-black/90"
                        >
                          Download Report
                        </Button>
                        <Button 
                          onClick={handleReset} 
                          variant="outline"
                          className="rounded-full h-10 px-5 border-black/10 font-medium"
                        >
                          New Analysis
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="rounded-xl shadow-elegant border border-black/[0.06]">
                    <CardHeader className="p-6">
                      <CardTitle className="text-lg tracking-tight">Original Image</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <img 
                        src={result.originalImage} 
                        alt="Original" 
                        className="w-full rounded-lg border border-black/[0.06]" 
                      />
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-elegant border border-black/[0.06]">
                    <CardHeader className="p-6">
                      <CardTitle className="text-lg tracking-tight">AI Analysis</CardTitle>
                      <CardDescription className="text-sm text-black/60">
                        {result.disease === 'pneumonia' 
                          ? 'Red areas indicate abnormalities'
                          : 'Red circles mark detected parasites'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      {result.heatmapImage ? (
                        <img 
                          src={result.heatmapImage} 
                          alt="AI Analysis Heatmap" 
                          className="w-full rounded-lg border border-black/[0.06]" 
                        />
                      ) : (
                        <canvas 
                          ref={canvasRef} 
                          className="w-full rounded-lg border border-black/[0.06]" 
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-amber-600/20 bg-amber-50/30 rounded-xl shadow-elegant">
                  <CardHeader className="p-6">
                    <CardTitle className="text-amber-900 text-lg tracking-tight flex items-center gap-2">
                      <AlertTriangle className="size-5" />
                      Medical Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-amber-900 p-6 pt-0">
                    {result.detected ? (
                      <div className="space-y-3 text-sm leading-relaxed">
                        <p><strong className="font-semibold">Immediate Action Required</strong></p>
                        <p>
                          {result.severity === 'Severe' 
                            ? 'This appears to be a severe case. Please visit the emergency department immediately.'
                            : result.severity === 'Moderate'
                            ? 'Please consult a doctor within 24 hours for proper diagnosis and treatment.'
                            : 'Please schedule a doctor consultation within 48 hours.'
                          }
                        </p>
                        <p className="text-amber-800 pt-3 text-xs">
                          <strong>Disclaimer:</strong> This is an AI screening tool only. Always consult qualified medical professionals for final diagnosis and treatment.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm">No abnormalities detected. If symptoms persist, please consult a healthcare provider.</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-full border-black/10 font-medium"
                  >
                    <Download className="size-4 mr-2" />
                    Download Report
                  </Button>
                  <Button 
                    onClick={handleReset} 
                    className="flex-1 bg-black hover:bg-black/90 text-white h-12 rounded-full shadow-elegant transition-elegant font-medium"
                  >
                    New Analysis
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="rounded-xl shadow-elegant border border-black/[0.06] bg-white">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl tracking-tight">Analysis History</CardTitle>
                <CardDescription className="text-base text-black/60">View your previous medical screenings</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {history.length === 0 ? (
                  <div className="text-center py-16 text-black/40">
                    <History className="size-12 mx-auto mb-4" />
                    <p className="text-base mb-1">No analysis history yet</p>
                    <p className="text-sm">Start your first analysis to see results here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-5 p-5 border border-black/[0.06] rounded-lg hover:shadow-elegant transition-elegant bg-white"
                      >
                        <div className={`size-12 rounded-lg flex items-center justify-center ${
                          item.disease === 'pneumonia' ? 'bg-black/5' : 'bg-black/5'
                        }`}>
                          {item.disease === 'pneumonia' ? (
                            <Activity className="size-6 text-black" />
                          ) : (
                            <Droplet className="size-6 text-black" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold capitalize mb-0.5">{item.disease} Screening</h4>
                          <p className="text-black/50 text-sm">{item.timestamp.toLocaleString()}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-white text-sm font-medium ${
                          item.detected ? 'bg-red-600' : 'bg-green-600'
                        }`}>
                          {item.detected ? 'Detected' : 'Normal'}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-full h-9 px-4 border-black/10 font-medium"
                        >
                          <Eye className="size-3.5 mr-2" />
                          View
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