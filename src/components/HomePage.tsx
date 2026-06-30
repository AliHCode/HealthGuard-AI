import { useState, useEffect } from 'react';
import { 
  ArrowRight, Shield, Zap, Brain, Activity, CheckCircle, Award, 
  TrendingUp, Clock, ShieldCheck, Heart, Sparkles, RefreshCw, 
  Layers, Database, AlertCircle, FileText, Play, ChevronRight, Eye,
  Server, Cpu, Target, Check, Lock, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

// Import local assets
import chestXrayTelemetry from '../../assets/chest_xray_telemetry.png';
import bloodSmearAnalytics from '../../assets/blood_smear_analytics.png';
import pneumoniaResult from '../../assets/pneumonia_result.png';
import malariaResult from '../../assets/malaria_result.png';

// Subcomponents for Capabilities Visualizer
function SmartLearningVisualizer() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getDetails = () => {
    switch (hoveredNode) {
      case 'spatial_in': return 'Spatial Stream Input: Raw X-Ray scan input';
      case 'spatial_conv': return 'Spatial Conv1 + MaxPool: Initial 7x7 filters capturing structures';
      case 'spatial_r1': return 'Spatial Layer 1: 3x ResNet blocks extracting low-level edges';
      case 'spatial_r2': return 'Spatial Layer 2: 4x ResNet blocks mapping anatomical textures';
      case 'spatial_r3': return 'Spatial Layer 3: 6x ResNet blocks resolving high-level lesions';
      case 'spatial_r4': return 'Spatial Layer 4: 3x ResNet blocks capturing global disease indicators';
      
      case 'freq_in': return 'Frequency Stream Input: Laplacian transform highlight';
      case 'freq_conv': return 'Frequency Conv1: 7x7 filters highlighting edge frequencies';
      case 'freq_r1': return 'Frequency Layer 1: 3x ResNet blocks mapping high-frequency noise';
      case 'freq_r2': return 'Frequency Layer 2: 4x ResNet blocks mapping fine textures';
      case 'freq_r3': return 'Frequency Layer 3: 6x ResNet blocks tracking frequency anomalies';
      case 'freq_r4': return 'Frequency Layer 4: 3x ResNet blocks summarizing texture anomalies';
      
      case 'fusion': return 'Concat Fusion Layer: Merges Spatial (2048d) and Frequency (2048d) features';
      case 'output': return 'FC + Softmax: Dynamic diagnostic projection with confidence scores';
      default: return 'Hover over architecture stages to inspect ResNet-50 Dual-Stream details';
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-center relative py-1">
      {/* Topology Title */}
      <div className="absolute top-0 inset-x-0 flex justify-between items-center text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider px-2 pointer-events-none">
        <span>ResNet-50 Dual-Stream Flow</span>
        <span className="text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 px-1.5 py-0.5 rounded">ACTIVE STATE</span>
      </div>

      {/* Main Flow SVG */}
      <div className="flex-1 w-full flex items-center justify-center py-2">
        <svg className="w-full h-full max-h-[290px] overflow-visible" viewBox="0 0 540 240">
          <defs>
            <linearGradient id="spatialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="freqGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="fusionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Lines Connecting Nodes */}
          {/* Spatial connection lines */}
          <path d="M 30 60 L 110 60" fill="none" stroke="#e0e7ff" strokeWidth="2" />
          <path d="M 110 60 L 170 60" fill="none" stroke="#e0e7ff" strokeWidth="2" />
          <path d="M 170 60 L 230 60" fill="none" stroke="#e0e7ff" strokeWidth="2" />
          <path d="M 230 60 L 290 60" fill="none" stroke="#e0e7ff" strokeWidth="2" />
          <path d="M 290 60 L 350 60" fill="none" stroke="#e0e7ff" strokeWidth="2" />
          <path d="M 350 60 L 410 60" fill="none" stroke="#e0e7ff" strokeWidth="2" />
          
          {/* Spatial Skip connections */}
          <path d="M 110 48 Q 140 20 170 48" fill="none" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          <path d="M 170 48 Q 200 20 230 48" fill="none" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          <path d="M 230 48 Q 260 20 290 48" fill="none" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          <path d="M 290 48 Q 320 20 350 48" fill="none" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />

          {/* Spectral connection lines */}
          <path d="M 30 180 L 110 180" fill="none" stroke="#ecfdf5" strokeWidth="2" />
          <path d="M 110 180 L 170 180" fill="none" stroke="#ecfdf5" strokeWidth="2" />
          <path d="M 170 180 L 230 180" fill="none" stroke="#ecfdf5" strokeWidth="2" />
          <path d="M 230 180 L 290 180" fill="none" stroke="#ecfdf5" strokeWidth="2" />
          <path d="M 290 180 L 350 180" fill="none" stroke="#ecfdf5" strokeWidth="2" />
          <path d="M 350 180 L 410 180" fill="none" stroke="#ecfdf5" strokeWidth="2" />

          {/* Spectral Skip connections */}
          <path d="M 110 192 Q 140 220 170 192" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          <path d="M 170 192 Q 200 220 230 192" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          <path d="M 230 192 Q 260 220 290 192" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          <path d="M 290 192 Q 320 220 350 192" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />

          {/* Concat paths to fusion */}
          <path d="M 410 60 C 445 60 455 120 485 120" fill="none" stroke="url(#spatialGrad)" strokeWidth="2.5" />
          <path d="M 410 180 C 445 180 455 120 485 120" fill="none" stroke="url(#freqGrad)" strokeWidth="2.5" />

          {/* Fusion to Output path */}
          <path d="M 485 120 L 530 120" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="3 3" className="animate-[dash_1.2s_linear_infinite]" />

          {/* Animating flow pulses */}
          <circle r="3" fill="#4f46e5">
            <animateMotion dur="2.2s" repeatCount="indefinite" path="M 30 60 L 110 60 L 170 60 L 230 60 L 290 60 L 350 60 L 410 60 C 445 60 455 120 485 120" />
          </circle>
          <circle r="3" fill="#10b981">
            <animateMotion dur="2.2s" repeatCount="indefinite" path="M 30 180 L 110 180 L 170 180 L 230 180 L 290 180 L 350 180 L 410 180 C 445 180 455 120 485 120" />
          </circle>

          {/* SPATIAL STREAM (UPPER) */}
          <g transform="translate(30, 60)" onMouseEnter={() => setHoveredNode('spatial_in')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <circle cx="0" cy="0" r="18" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2" />
            <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#4f46e5" opacity="0.1" />
            <text x="0" y="3" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4f46e5" className="select-none">IN</text>
            <text x="0" y="-23" textAnchor="middle" fontSize="8" fontWeight="extrabold" fill="#6366f1" letterSpacing="0.5">SPATIAL</text>
          </g>

          <g transform="translate(110, 60)" onMouseEnter={() => setHoveredNode('spatial_conv')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-22" y="-15" width="44" height="30" rx="6" fill={hoveredNode === 'spatial_conv' ? '#e0e7ff' : '#f8fafc'} stroke="#818cf8" strokeWidth={hoveredNode === 'spatial_conv' ? 2 : 1.2} />
            <text x="0" y="-1" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Conv1</text>
            <text x="0" y="8" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">7x7, st2</text>
          </g>

          <g transform="translate(170, 60)" onMouseEnter={() => setHoveredNode('spatial_r1')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-24" y="-18" width="48" height="36" rx="6" fill={hoveredNode === 'spatial_r1' ? '#e0e7ff' : '#f8fafc'} stroke="#4f46e5" strokeWidth={hoveredNode === 'spatial_r1' ? 2 : 1.2} />
            <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Stage 1</text>
            <text x="0" y="5" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">ResBlock</text>
            <text x="0" y="12" textAnchor="middle" fontSize="6.5" fill="#818cf8" fontWeight="bold">x3 (256d)</text>
          </g>

          <g transform="translate(230, 60)" onMouseEnter={() => setHoveredNode('spatial_r2')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-24" y="-18" width="48" height="36" rx="6" fill={hoveredNode === 'spatial_r2' ? '#e0e7ff' : '#f8fafc'} stroke="#4f46e5" strokeWidth={hoveredNode === 'spatial_r2' ? 2 : 1.2} />
            <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Stage 2</text>
            <text x="0" y="5" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">ResBlock</text>
            <text x="0" y="12" textAnchor="middle" fontSize="6.5" fill="#818cf8" fontWeight="bold">x4 (512d)</text>
          </g>

          <g transform="translate(290, 60)" onMouseEnter={() => setHoveredNode('spatial_r3')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-24" y="-18" width="48" height="36" rx="6" fill={hoveredNode === 'spatial_r3' ? '#e0e7ff' : '#f8fafc'} stroke="#4f46e5" strokeWidth={hoveredNode === 'spatial_r3' ? 2 : 1.2} />
            <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Stage 3</text>
            <text x="0" y="5" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">ResBlock</text>
            <text x="0" y="12" textAnchor="middle" fontSize="6.5" fill="#818cf8" fontWeight="bold">x6 (1024d)</text>
          </g>

          <g transform="translate(350, 60)" onMouseEnter={() => setHoveredNode('spatial_r4')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-24" y="-18" width="48" height="36" rx="6" fill={hoveredNode === 'spatial_r4' ? '#e0e7ff' : '#f8fafc'} stroke="#4f46e5" strokeWidth={hoveredNode === 'spatial_r4' ? 2 : 1.2} />
            <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Stage 4</text>
            <text x="0" y="5" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">ResBlock</text>
            <text x="0" y="12" textAnchor="middle" fontSize="6.5" fill="#818cf8" fontWeight="bold">x3 (2048d)</text>
          </g>

          <g transform="translate(410, 60)">
            <circle cx="0" cy="0" r="14" fill="#fff" stroke="#d4d4d8" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#71717a">GAP</text>
          </g>


          {/* SPECTRAL STREAM (LOWER) */}
          <g transform="translate(30, 180)" onMouseEnter={() => setHoveredNode('freq_in')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <circle cx="0" cy="0" r="18" fill="#ecfdf5" stroke="#34d399" strokeWidth="2" />
            <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#059669" opacity="0.1" />
            <text x="0" y="3" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#059669" className="select-none">FRQ</text>
            <text x="0" y="28" textAnchor="middle" fontSize="8" fontWeight="extrabold" fill="#059669" letterSpacing="0.5">SPECTRAL</text>
          </g>

          <g transform="translate(110, 180)" onMouseEnter={() => setHoveredNode('freq_conv')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-22" y="-15" width="44" height="30" rx="6" fill={hoveredNode === 'freq_conv' ? '#ecfdf5' : '#f8fafc'} stroke="#34d399" strokeWidth={hoveredNode === 'freq_conv' ? 2 : 1.2} />
            <text x="0" y="-1" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Conv1</text>
            <text x="0" y="8" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">7x7, st2</text>
          </g>

          <g transform="translate(170, 180)" onMouseEnter={() => setHoveredNode('freq_r1')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-24" y="-18" width="48" height="36" rx="6" fill={hoveredNode === 'freq_r1' ? '#ecfdf5' : '#f8fafc'} stroke="#059669" strokeWidth={hoveredNode === 'freq_r1' ? 2 : 1.2} />
            <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Stage 1</text>
            <text x="0" y="5" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">ResBlock</text>
            <text x="0" y="12" textAnchor="middle" fontSize="6.5" fill="#34d399" fontWeight="bold">x3 (256d)</text>
          </g>

          <g transform="translate(230, 180)" onMouseEnter={() => setHoveredNode('freq_r2')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-24" y="-18" width="48" height="36" rx="6" fill={hoveredNode === 'freq_r2' ? '#ecfdf5' : '#f8fafc'} stroke="#059669" strokeWidth={hoveredNode === 'freq_r2' ? 2 : 1.2} />
            <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Stage 2</text>
            <text x="0" y="5" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">ResBlock</text>
            <text x="0" y="12" textAnchor="middle" fontSize="6.5" fill="#34d399" fontWeight="bold">x4 (512d)</text>
          </g>

          <g transform="translate(290, 180)" onMouseEnter={() => setHoveredNode('freq_r3')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-24" y="-18" width="48" height="36" rx="6" fill={hoveredNode === 'freq_r3' ? '#ecfdf5' : '#f8fafc'} stroke="#059669" strokeWidth={hoveredNode === 'freq_r3' ? 2 : 1.2} />
            <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Stage 3</text>
            <text x="0" y="5" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">ResBlock</text>
            <text x="0" y="12" textAnchor="middle" fontSize="6.5" fill="#34d399" fontWeight="bold">x6 (1024d)</text>
          </g>

          <g transform="translate(350, 180)" onMouseEnter={() => setHoveredNode('freq_r4')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-24" y="-18" width="48" height="36" rx="6" fill={hoveredNode === 'freq_r4' ? '#ecfdf5' : '#f8fafc'} stroke="#059669" strokeWidth={hoveredNode === 'freq_r4' ? 2 : 1.2} />
            <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">Stage 4</text>
            <text x="0" y="5" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="semibold">ResBlock</text>
            <text x="0" y="12" textAnchor="middle" fontSize="6.5" fill="#34d399" fontWeight="bold">x3 (2048d)</text>
          </g>

          <g transform="translate(410, 180)">
            <circle cx="0" cy="0" r="14" fill="#fff" stroke="#d4d4d8" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#71717a">GAP</text>
          </g>


          {/* FUSION AND OUTPUT (MIDDLE RIGHT) */}
          <g transform="translate(485, 120)" onMouseEnter={() => setHoveredNode('fusion')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <rect x="-20" y="-25" width="40" height="50" rx="8" fill={hoveredNode === 'fusion' ? '#fef3c7' : '#fff'} stroke="#f59e0b" strokeWidth={hoveredNode === 'fusion' ? 2 : 1.5} />
            <text x="0" y="-9" textAnchor="middle" fontSize="8" fontWeight="black" fill="#d97706">Concat</text>
            <text x="0" y="2" textAnchor="middle" fontSize="7" fill="#d97706" fontWeight="bold">Fusion</text>
            <text x="0" y="13" textAnchor="middle" fontSize="7" fill="#b45309" fontWeight="extrabold">4096d</text>
          </g>

          <g transform="translate(530, 120)" onMouseEnter={() => setHoveredNode('output')} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
            <circle cx="0" cy="0" r="14" fill="#fff" stroke="#d97706" strokeWidth={hoveredNode === 'output' ? 2 : 1.2} />
            <circle cx="0" cy="0" r="10" fill="#fef3c7" className="animate-pulse" />
            <text x="0" y="3.5" textAnchor="middle" fontSize="8" fontWeight="black" fill="#b45309">97%</text>
            <text x="-18" y="26" fontSize="7" fontWeight="black" fill="#b45309" letterSpacing="0.2">OUTPUT</text>
          </g>
        </svg>
      </div>

      {/* Dynamic Inspector Panel */}
      <div className="w-full bg-neutral-900 text-white rounded-lg p-2.5 flex items-center gap-3 border border-neutral-800 shadow-sm mt-1">
        <div className="bg-indigo-950 p-1.5 rounded border border-indigo-900/50">
          <Cpu className="size-4 text-indigo-400 animate-[pulse_1.5s_infinite]" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-[8px] font-mono tracking-widest text-neutral-500 font-bold uppercase">Dynamic Stage Inspector</div>
          <p className="text-[11px] text-neutral-200 font-mono tracking-tight font-semibold">{getDetails()}</p>
        </div>
      </div>
    </div>
  );
}

function VisualMappingVisualizer() {
  const [blendMode, setBlendMode] = useState<'overlay' | 'heatmap' | 'xray'>('overlay');

  return (
    <div className="w-full h-full flex gap-4 items-stretch relative">
      {/* Left: Viewport */}
      <div className="flex-1 relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 select-none">
        {/* Base Scan Image */}
        <img 
          src={chestXrayTelemetry} 
          alt="Xray base scan" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            blendMode === 'heatmap' ? 'opacity-0' : 'opacity-80'
          }`}
        />
        
        {/* Heatmap overlay (mix-blend-screen when overlay is active) */}
        <img 
          src={pneumoniaResult} 
          alt="Grad-CAM activation overlay" 
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
            blendMode === 'xray' ? 'opacity-0' : 'opacity-100'
          } ${
            blendMode === 'overlay' ? 'mix-blend-screen brightness-125' : ''
          }`}
        />

        {/* Pulse Target Glow on active area */}
        {blendMode !== 'xray' && (
          <div className="absolute top-[32%] left-[28%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10">
            <span className="absolute inline-flex size-20 rounded-full bg-rose-500/25 animate-ping" />
            <span className="absolute inline-flex size-10 rounded-full bg-rose-500/35 animate-[pulse_1.5s_infinite]" />
            <span className="relative inline-flex size-2.5 rounded-full bg-rose-600 shadow-md shadow-rose-500/50" />
          </div>
        )}

        {/* Laser scanner sweeps */}
        <div className="absolute inset-x-0 h-[1.5px] bg-emerald-500/60 shadow-[0_0_8px_#10b981] pointer-events-none animate-[sweep_3.5s_ease-in-out_infinite] z-20" />

        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-mono text-white/90 uppercase tracking-widest z-20">
          Grad-CAM Live View
        </div>
      </div>

      {/* Right: Controller & Metadata Legend */}
      <div className="w-[170px] flex flex-col justify-between text-left space-y-3 font-mono border-l border-neutral-100 pl-4 py-1">
        {/* Title */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-neutral-800 tracking-tight">Saliency Heatmap</div>
          <p className="text-[8px] text-neutral-400 font-semibold leading-relaxed">
            Highlights features that triggered the ResNet-50 classification decision.
          </p>
        </div>

        {/* Legend Map */}
        <div className="space-y-1.5">
          <div className="text-[7px] font-extrabold uppercase tracking-wider text-neutral-400">Attention Scale</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-full rounded bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-300 to-rose-600 border border-neutral-100" />
            <span className="text-[7px] font-bold text-rose-600">Peak</span>
          </div>
          <div className="flex justify-between text-[6px] text-neutral-400 font-bold uppercase">
            <span>Min (0.0)</span>
            <span>Max (1.0)</span>
          </div>
        </div>

        {/* Layers control */}
        <div className="space-y-1.5">
          <div className="text-[7px] font-extrabold uppercase tracking-wider text-neutral-400">Channel Toggles</div>
          <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/50">
            {(['xray', 'overlay', 'heatmap'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBlendMode(mode)}
                className={`py-1 rounded text-[7px] font-bold uppercase transition-all duration-300 cursor-pointer text-center ${
                  blendMode === mode 
                    ? 'bg-white text-black shadow-elegant-sm' 
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {mode === 'xray' ? 'Scan' : mode === 'overlay' ? 'Blend' : 'CAM'}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry data */}
        <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100 space-y-1">
          <div className="flex justify-between text-[6px] text-neutral-400 font-bold">
            <span>ROI INDEX:</span>
            <span className="text-neutral-700">LOBE-3</span>
          </div>
          <div className="flex justify-between text-[6px] text-neutral-400 font-bold">
            <span>CONV CONFIDENCE:</span>
            <span className="text-rose-600 font-extrabold">95.8%</span>
          </div>
          <div className="flex justify-between text-[6px] text-neutral-400 font-bold">
            <span>LATENCY TRIAGE:</span>
            <span className="text-neutral-700">1.84s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZeroRetentionVisualizer() {
  const [phase, setPhase] = useState<'idle' | 'writing' | 'processing' | 'wiping'>('idle');
  const [cells, setCells] = useState<string[]>(Array(24).fill('00'));

  useEffect(() => {
    let interval: any;
    const cycle = () => {
      // Transition from idle -> writing
      setPhase('writing');
      interval = setInterval(() => {
        setCells(prev => prev.map(() => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')));
      }, 100);

      // Stop writing -> process
      setTimeout(() => {
        clearInterval(interval);
        setPhase('processing');
        
        // Stop processing -> wipe
        setTimeout(() => {
          setPhase('wiping');
          
          // Wipe cells sequentially
          setTimeout(() => {
            setCells(Array(24).fill('00'));
            setPhase('idle');
          }, 1200);

        }, 2000);
      }, 2000);
    };

    // Run first immediately
    cycle();

    // Loop
    const mainTimer = setInterval(cycle, 7200);
    return () => {
      clearInterval(interval);
      clearInterval(mainTimer);
    };
  }, []);

  return (
    <div className="w-full h-full flex gap-4 items-stretch relative font-mono text-[9px] select-none">
      {/* Left: Memory Grid */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between text-left relative overflow-hidden">
        {/* Background circuit grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <div className="flex justify-between items-center z-10">
          <span className="text-[7px] text-neutral-400 font-extrabold uppercase flex items-center gap-1.5">
            <Database className="size-3 text-neutral-400" /> Transient RAM buffer (24-pages)
          </span>
          <span className={`text-[7px] px-1.5 py-0.5 rounded font-extrabold tracking-widest transition-colors duration-300 uppercase ${
            phase === 'idle' ? 'bg-neutral-800 text-neutral-400' :
            phase === 'writing' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' :
            phase === 'processing' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
            'bg-rose-950 text-rose-400 border border-rose-900/50'
          }`}>
            {phase}
          </span>
        </div>

        {/* 6x4 Memory Grid */}
        <div className="grid grid-cols-6 gap-2 my-2 z-10 relative flex-1 items-center">
          {cells.map((cell, idx) => {
            const cellAddr = `0x${idx.toString(16).toUpperCase().padStart(2, '0')}`;
            let bgStyle = 'bg-neutral-800/40 border-neutral-800/30 text-neutral-500';
            
            if (phase === 'writing') {
              bgStyle = 'bg-indigo-950/40 border-indigo-700/30 text-indigo-300';
            } else if (phase === 'processing') {
              bgStyle = 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 animate-[pulse_1.5s_infinite]';
            } else if (phase === 'wiping') {
              bgStyle = 'bg-rose-950/60 border-rose-500/50 text-rose-200';
            }

            return (
              <div 
                key={idx} 
                className={`border rounded p-1 flex flex-col items-center justify-between h-[28px] transition-all duration-300 ${bgStyle}`}
              >
                <span className="text-[5px] text-neutral-500 font-bold">{cellAddr}</span>
                <span className="text-[7px] font-black">{cell}</span>
              </div>
            );
          })}

          {/* Sweep Line during wiping phase */}
          {phase === 'wiping' && (
            <div className="absolute inset-y-0 w-2 bg-rose-500/20 shadow-[0_0_15px_#f43f5e] pointer-events-none z-20 animate-[wipeRight_1s_ease-in-out_infinite]" />
          )}
        </div>

        {/* Status bar */}
        <div className="flex justify-between items-center text-[7px] text-neutral-500 border-t border-neutral-800/50 pt-2 z-10">
          <span>WRITE BLOCK: <span className="text-emerald-500 font-bold">LOCKED</span></span>
          <span>SYSTEM DISK STATUS: <span className="text-emerald-500 font-bold">0x00 WRITTEN</span></span>
        </div>
      </div>

      {/* Right: Security Telemetry & Readout */}
      <div className="w-[170px] flex flex-col justify-between text-left space-y-3 font-mono border-l border-neutral-100 pl-4 py-1">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-neutral-800 tracking-tight">Sandbox Telemetry</div>
          <p className="text-[8px] text-neutral-400 font-semibold leading-relaxed">
            Monitors real-time transient RAM states during diagnostic classification.
          </p>
        </div>

        <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 space-y-2 flex-1 flex flex-col justify-center">
          <div className="space-y-1.5">
            <div className="text-[7px] font-extrabold uppercase tracking-wider text-neutral-400">Operation Monitor</div>
            <div className="text-[9px] font-black text-neutral-800 tracking-tight h-5 flex items-center">
              {phase === 'idle' && (
                <span className="text-neutral-400 font-semibold">SYSTEM STANDBY</span>
              )}
              {phase === 'writing' && (
                <span className="text-indigo-600 animate-pulse flex items-center gap-1">
                  <RefreshCw className="size-3 animate-spin" /> RAM ALLOC WRITE
                </span>
              )}
              {phase === 'processing' && (
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <Activity className="size-3" /> GPU INFERENCE
                </span>
              )}
              {phase === 'wiping' && (
                <span className="text-rose-600 flex items-center gap-1 font-bold">
                  <Lock className="size-3" /> WIPE OVERWRITE
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[6px] text-neutral-400 font-bold">CURRENT TASK STATUS:</div>
            <p className="text-[7px] text-neutral-600 leading-tight font-semibold">
              {phase === 'idle' && "Standby mode. No medical scans loaded in memory sandbox."}
              {phase === 'writing' && "Writing raw pixel arrays and high-frequency channels into RAM registers."}
              {phase === 'processing' && "Dual-Stream ResNet-50 accessing active registers for forward propagation."}
              {phase === 'wiping' && "Wiping addresses via zeros-fill overwrite sweep. RAM sanitization active."}
            </p>
          </div>
        </div>

        {/* Protection indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-100">
          <ShieldCheck className="size-3 text-emerald-600" />
          <span className="text-[7px] font-extrabold uppercase tracking-wider">Sanitization Guaranteed</span>
        </div>
      </div>
    </div>
  );
}

interface HomePageProps {
  onNavigate: (page: 'analysis' | 'contact') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [hoveredRegion, setHoveredRegion] = useState<'chest' | 'blood' | null>('chest');
  const [activeLobe, setActiveLobe] = useState<string | null>(null);
  const [lobeResult, setLobeResult] = useState<any>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeFeature, setActiveFeature] = useState<'learning' | 'mapping' | 'privacy'>('learning');

  // Auto hover check timer
  useEffect(() => {
    setActiveLobe(null);
    setLobeResult(null);
  }, [hoveredRegion]);

  return (
    <div className="min-h-screen bg-white text-black relative">
      {/* Structural layout grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-[0.6]" />
      
{/* Light subtle visual glow gradients */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[120px] pointer-events-none -z-10 opacity-60" />
      <div className="absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[140px] pointer-events-none -z-10 opacity-50" />

      {/* 1. HERO SECTION WITH SPLIT SCANNER (Qure.ai Style) */}
      <section className="relative min-h-[90vh] flex items-center py-16 overflow-hidden bg-white">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Typography, Single CTA, Stats */}
            <div className="lg:col-span-5 space-y-10 text-left">
              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-5xl lg:text-6.5xl font-black tracking-tight text-black leading-[1.1]"
                >
                  AI-Powered Medical Diagnosis.
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-sm text-neutral-500 leading-relaxed max-w-lg"
                >
                  Quickly and accurately screen for Pneumonia and Malaria. Upload scans to get instant, explainable results for clinical care.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button
                  size="lg"
                  onClick={() => onNavigate('analysis')}
                  className="bg-black hover:bg-black/90 text-white px-8 h-12 rounded-full transition-all duration-300 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2"
                >
                  Start Screening
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>

              {/* Stats Row (arranged horizontally like Qure.ai) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center gap-8 pt-8 border-t border-neutral-100"
              >
                {[
                  { value: '95%+', label: 'Accuracy' },
                  { value: '< 3s', label: 'Fast Results' },
                  { value: '100%', label: 'Free to Use' }
                ].map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-3xl font-black tracking-tight text-black">{stat.value}</div>
                    <div className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Interactive Scanner Console (Borderless & Sleek) */}
            <div className="lg:col-span-7 flex flex-col relative">
              
              {/* Node Switcher Tabs (Placed cleanly above the image box) */}
              <div className="flex items-center justify-between mb-4 select-none">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHoveredRegion('chest')}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                      hoveredRegion === 'chest' 
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_#abc9ff]' 
                        : 'text-black/50 border-black/10 hover:text-black hover:bg-black/[0.02]'
                    }`}
                  >
                    Lung Scanner
                  </button>
                  <button
                    onClick={() => setHoveredRegion('blood')}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                      hoveredRegion === 'blood' 
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_#abc9ff]' 
                        : 'text-black/50 border-black/10 hover:text-black hover:bg-black/[0.02]'
                    }`}
                  >
                    Blood Scanner
                  </button>
                </div>
              </div>

              {/* Main Comparison Slider Area (Modern, borderless, elevated shadow) */}
              <div className="relative w-full aspect-video md:aspect-square max-h-[460px] rounded-2xl overflow-hidden bg-neutral-950 select-none shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-neutral-900/10 group z-10">
                {/* 1. Base Image (Original Scan) */}
                <img 
                  src={hoveredRegion === 'chest' ? chestXrayTelemetry : bloodSmearAnalytics} 
                  alt="Original Diagnostic Scan"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                />
                
                {/* 2. Processed Image (AI Heatmap overlay - clipped dynamically) */}
                <div 
                  className="absolute inset-0 overflow-hidden pointer-events-none select-none z-10"
                  style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                >
                  <img 
                    src={hoveredRegion === 'chest' ? pneumoniaResult : malariaResult} 
                    alt="AI Triage Heatmap Reveal"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none mix-blend-screen"
                  />
                </div>

                {/* 3. Slider Handle Divider Line */}
                <div 
                  className="absolute inset-y-0 w-[1.5px] bg-white pointer-events-none z-20 shadow-[0_0_10px_white]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  {/* Circular Handle widget */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-7 rounded-full bg-white border border-black/10 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center z-30 transition-transform group-hover:scale-105">
                    <div className="flex gap-0.5 select-none pointer-events-none">
                      <span className="text-[10px] text-neutral-400 font-black font-mono">‹</span>
                      <span className="text-[10px] text-neutral-400 font-black font-mono">›</span>
                    </div>
                  </div>
                </div>

                {/* 4. Active scanning laser bar */}
                <div 
                  className="absolute inset-y-0 w-[4px] bg-[#abc9ff]/45 pointer-events-none blur-[2px] z-10"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                />

                {/* 5. Invisible HTML Slider overlay (anywhere dragging/clicking) */}
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sliderPosition} 
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />

                {/* HUD overlays inside image */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-mono text-white/90 z-20">
                  {hoveredRegion === 'chest' ? 'Lung Scan View' : 'Blood Scan View'}
                </div>
                
                <div className="absolute bottom-3 left-3 bg-black/75 border border-white/10 px-2 py-0.5 rounded text-[8px] font-mono text-white/70 select-none z-20">
                  Drag slider to reveal AI results
                </div>
              </div>

              {/* Minimal Telemetry Info Bar (No cards/boxes) */}
              <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-neutral-400 select-none">
                <span>SYSTEM ACTIVE</span>
                <span className="font-bold text-neutral-900">
                  {hoveredRegion === 'chest' ? 'Accuracy: 95.8%' : 'Accuracy: 97.2%'}
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. SPECIFICATION FEATURE GRID */}
      <section className="relative py-24 bg-white">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dash {
            to {
              stroke-dashoffset: -40;
            }
          }
          @keyframes sweep {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          @keyframes wipeRight {
            0% { left: -5%; }
            100% { left: 105%; }
          }
        `}} />
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-left max-w-xl mb-16 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 font-mono">SPECIFICATIONS</span>
              <h2 className="text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">Architecture Capabilities</h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Enterprise-grade clinical triage running on highly optimized convolutional streams.
              </p>
            </div>

            <div className="space-y-24 lg:space-y-36">
              {/* Feature 1: Smart Learning */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Text Content */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="text-[10px] font-bold font-mono tracking-widest text-indigo-600 uppercase">Dual-Stream ConvNet Engine</span>
                  <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">Smart Learning Model</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Our engine uses two separate ResNet-50 streams to process medical scans. The spatial stream extracts structural and anatomical features from the raw scan, while the frequency stream isolates fine textures and edge patterns. The outputs are fused dynamically to detect abnormalities with clinical-grade accuracy.
                  </p>
                </div>
                {/* Visualizer Container */}
                <div className="lg:col-span-7 relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50/50 shadow-elegant-sm flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
                  <SmartLearningVisualizer />
                </div>
              </div>

              {/* Feature 2: Visual AI Mapping (Alternated - Image on Left, Text on Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Visualizer Container */}
                <div className="lg:col-span-7 order-2 lg:order-1 relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50/50 shadow-elegant-sm flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
                  <VisualMappingVisualizer />
                </div>
                {/* Text Content */}
                <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left lg:pl-8">
                  <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-600 uppercase">Explainable Saliency Engine</span>
                  <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">Visual AI Mapping</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Rather than acting as a black box, HealthGuard AI projects heatmaps directly onto the scans using Grad-CAM. This highlights the precise pixel coordinates that triggered the model's prediction, giving medical professionals visual proof of the underlying diagnosis.
                  </p>
                </div>
              </div>

              {/* Feature 3: Instant Privacy Protection (Text on Left, Image on Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Text Content */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="text-[10px] font-bold font-mono tracking-widest text-sky-600 uppercase">Privacy Protection Security Architecture</span>
                  <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">Instant Privacy Protection</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Patient confidentiality is guaranteed by our memory sandbox architecture. Uploaded diagnostic scans are loaded into transient RAM arrays, processed in-memory for inference, and immediately overwritten. Scans are never written to disk, databases, or third-party servers.
                  </p>
                </div>
                {/* Visualizer Container */}
                <div className="lg:col-span-7 relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50/50 shadow-elegant-sm flex items-center justify-center p-6">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
                  <img 
                    src="/privacy.png" 
                    alt="Privacy Protection Security Architecture" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. EPIDEMIOLOGY: TRANSMISSION AND VECTOR PATHWAYS */}
      <section className="py-20 bg-[#f4f7f6] border-t border-b border-black/[0.02]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 font-mono">EPIDEMIOLOGY</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Transmission Vectors</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              
              {/* Malaria Card */}
              <div className="bg-white border border-black/[0.04] rounded-2xl p-8 space-y-6 hover:shadow-elegant-sm transition-all duration-300">
                <div className="size-20 rounded-xl overflow-hidden border border-black/5 bg-slate-50 flex items-center justify-center shrink-0">
                  <img 
                    src="/mosquito.jpg" 
                    alt="Mosquito" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-black tracking-tight">Malaria Transmission</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Transmitted by the female Anopheles mosquito vector, which injects Plasmodium parasites directly into the host's bloodstream during a blood meal.
                  </p>
                </div>
              </div>

              {/* Pneumonia Card */}
              <div className="bg-white border border-black/[0.04] rounded-2xl p-8 space-y-6 hover:shadow-elegant-sm transition-all duration-300">
                <div className="size-20 rounded-xl overflow-hidden border border-black/5 bg-slate-50 flex items-center justify-center shrink-0">
                  <img 
                    src="/pnemonia.jpg" 
                    alt="Pneumonia" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-black tracking-tight">Pneumonia Transmission</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Spread through respiratory secretions or airborne droplets from coughing and sneezing, leading to acute infection of the lung's alveolar air sacs.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. CLINICAL TRIAGES: INTERACTIVE LOBE CHECKER */}
      <section className="py-24 bg-white border-t border-black/[0.05]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center max-w-xl mx-auto mb-20 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-black/40">Interactive Scanning</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-black">Interactive Lung Scan</h2>
              <p className="text-sm text-black/50 leading-relaxed">
                Click on different areas of the lung diagram below to see how the AI scans and identifies healthy or infected lung lobes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Dynamic interactive scan (7 Cols) */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="relative w-full max-w-lg aspect-square bg-slate-900 border border-black/[0.08] rounded-2xl p-6 shadow-elegant-lg flex items-center justify-center overflow-hidden">
                  
                  {/* Faint Chest X-Ray backdrop image */}
                  <img 
                    src={chestXrayTelemetry} 
                    alt="Chest backdrop" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-lighten"
                  />
                  
                  {/* Interactive Lung Lobes SVG Overlay */}
                  <svg className="absolute inset-0 w-full h-full p-6 text-white/5 z-10" viewBox="0 0 200 200">
                    <rect x="0" y="0" width="200" height="200" fill="none" />
                    
                    {/* Ribcage backdrops */}
                    <path d="M20 50 Q100 20 180 50 M20 80 Q100 50 180 80 M20 110 Q100 80 180 110 M20 140 Q100 110 180 140" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="none" />
                    
                    {/* Lobe paths */}
                    <path 
                      d="M90 30 C70 20 40 40 40 70 C40 85 55 90 85 85 C88 75 88 50 90 30 Z" 
                      className={`cursor-pointer transition-colors duration-300 ${
                        activeLobe === 'upper-left' ? 'fill-indigo-500/30' : 'fill-white/10 hover:fill-white/20'
                      }`}
                      onClick={() => {
                        setActiveLobe('upper-left');
                        setLobeResult({ outcome: 'Healthy Upper Lobe', confidence: 99.4, desc: 'Left upper lung area looks clear. Normal air flow and no fluid detected.' });
                      }}
                    />
                    
                    <path 
                      d="M85 85 C55 90 40 85 40 100 C40 130 60 150 85 145 C88 135 88 100 85 85 Z" 
                      className={`cursor-pointer transition-colors duration-300 ${
                        activeLobe === 'lower-left' ? 'fill-rose-500/30' : 'fill-white/10 hover:fill-rose-500/20'
                      }`}
                      onClick={() => {
                        setActiveLobe('lower-left');
                        setLobeResult({ outcome: 'Potential Infection Flagged', confidence: 92.4, desc: 'Left lower lung area shows signs of fluid build-up or potential infection.' });
                      }}
                    />
                    
                    <path 
                      d="M110 30 C130 20 160 40 160 70 C160 85 145 90 115 85 C112 75 112 50 110 30 Z" 
                      className={`cursor-pointer transition-colors duration-300 ${
                        activeLobe === 'upper-right' ? 'fill-indigo-500/30' : 'fill-white/10 hover:fill-white/20'
                      }`}
                      onClick={() => {
                        setActiveLobe('upper-right');
                        setLobeResult({ outcome: 'Healthy Upper Lobe', confidence: 99.1, desc: 'Right upper lung area looks clear with normal air flow.' });
                      }}
                    />
                    
                    <path 
                      d="M115 85 C145 90 160 85 160 100 C160 130 140 150 115 145 C112 135 112 100 115 85 Z" 
                      className={`cursor-pointer transition-colors duration-300 ${
                        activeLobe === 'lower-right' ? 'fill-indigo-500/30' : 'fill-white/10 hover:fill-white/20'
                      }`}
                      onClick={() => {
                        setActiveLobe('lower-right');
                        setLobeResult({ outcome: 'Healthy Lower Lobe', confidence: 98.7, desc: 'Right lower lung area looks clear with no abnormal shadows.' });
                      }}
                    />
                    
                    <rect x="97" y="20" width="6" height="135" fill="rgba(0,0,0,0.04)" />
                  </svg>

                  {/* Lobe Text Labels Overlay - Removed for clean visual */}
                  <div className="absolute bottom-4 inset-x-4 bg-black/75 border border-white/10 px-3 py-1 rounded-lg text-[9px] font-mono text-emerald-400 flex items-center justify-center gap-1.5 select-none z-20">
                    <Activity className="size-3 text-emerald-400 animate-pulse" />
                    CLICK ON LUNG LOBES TO SCAN
                  </div>
                </div>
              </div>

              {/* Right: Selected diagnostic metrics (5 Cols) */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-black/40">Interactive Scan</span>
                  <h3 className="text-3xl font-bold tracking-tight text-black">Scan Results</h3>
                  <p className="text-sm text-black/50 leading-relaxed">
                    See how the AI checks each lung area. Click a lobe on the diagram to see the results.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {lobeResult ? (
                    <motion.div 
                      key={lobeResult.outcome}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 border border-black/[0.06] bg-slate-50/50 rounded-2xl space-y-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center pb-3 border-b border-black/[0.04]">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-black/40">Lung Area Status</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          lobeResult.outcome.includes('Flagged') 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {lobeResult.outcome.includes('Flagged') ? 'Infection Flagged' : 'Healthy'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-black">{lobeResult.outcome}</div>
                        <p className="text-xs text-black/50 leading-relaxed">{lobeResult.desc}</p>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-2.5 border-t border-black/[0.03]">
                        <span className="text-black/40 font-semibold">AI Confidence:</span>
                        <span className="font-bold text-black">{lobeResult.confidence}%</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-6 border border-dashed border-black/10 rounded-2xl text-center text-black/35 text-xs font-semibold py-12">
                      Please click on the lung diagram to see scan results.
                    </div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={() => onNavigate('analysis')}
                  className="bg-black hover:bg-black/90 text-white h-11 px-5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-elegant"
                >
                  Enter Sandbox Console
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CLINICAL CALL TO ACTION */}
      <section className="py-24 bg-white border-t border-black/[0.05] relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto border border-black/[0.06] rounded-3xl p-10 md:p-14 bg-slate-50/50 shadow-sm space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-black leading-tight">
              Deploy AI Diagnostics to the Field
            </h2>
            <p className="text-sm text-black/50 leading-relaxed max-w-xl mx-auto">
              Empower medical field workers with explainable AI screening tools. Connect instantly to district clinics.
            </p>
            <div className="flex flex-wrap gap-3.5 justify-center pt-2">
              <Button
                size="lg"
                onClick={() => onNavigate('analysis')}
                className="bg-black hover:bg-black/90 text-white h-12 px-7 rounded-xl shadow-elegant transition-all duration-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Access Sandbox
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('contact')}
                className="border border-black/10 hover:bg-black/5 h-12 px-7 rounded-xl transition-all duration-300 text-sm font-bold uppercase tracking-wider cursor-pointer"
              >
                Submit Partnership Inquiry
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-black/[0.05] py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10 text-left">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-[20px] font-extrabold tracking-[-0.04em] text-black leading-none">HEALTH</span>
                <span className="text-[20px] font-light tracking-[-0.04em] text-black/55 leading-none ml-0.5">GUARD</span>
                <span className="text-[8px] font-bold tracking-[0.3em] text-black/40 ml-2.5 leading-none border border-black/10 bg-slate-50 px-1.5 py-0.5 rounded">AI</span>
              </div>
              <p className="text-black/45 text-xs leading-relaxed">
                Empowering healthcare providers and field workers with visual diagnostic models.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-black/70 font-sans">Triage Sandboxes</h4>
              <ul className="space-y-2.5 text-black/50 text-xs">
                <li><a href="#" className="hover:text-black transition-colors">Chest Pneumonia</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Blood Malaria</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Visual heatmaps</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-black/70 font-sans">Clinical Resources</h4>
              <ul className="space-y-2.5 text-black/50 text-xs">
                <li><a href="#" className="hover:text-black transition-colors">R&D Documentation</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Field Guidelines</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Encryption Privacy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-black/70 font-sans">Support Hours</h4>
              <div className="space-y-2 text-black/50 text-xs leading-relaxed">
                <p>Clinic support: Mon-Fri 9-6</p>
                <p>R&D Hub: Bangalore, India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-black/[0.05] pt-6 flex flex-col md:flex-row justify-between items-center text-[11px] text-black/40 gap-4">
            <p>© 2026 HealthGuard AI. Free triage tool for public health centers.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Local keyframes for scanner animation */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
}