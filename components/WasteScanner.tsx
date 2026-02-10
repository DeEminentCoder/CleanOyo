
import React, { useRef, useState, useCallback } from 'react';
import { analyzeWasteImage } from '../services/geminiService';

interface WasteScannerProps {
  onClose: () => void;
}

export const WasteScanner: React.FC<WasteScannerProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ category: string, advice: string, impact: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Draw video frame to canvas
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8);
    
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const aiResult = await analyzeWasteImage(base64Image);
      setResult(aiResult);
      stopCamera();
    } catch (err) {
      setError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">AI Waste Scanner</h3>
            <p className="text-xs text-slate-500">Point at waste to identify and get advice</p>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            ✕
          </button>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center">
          {!isCameraActive && !result && !isAnalyzing && (
            <div className="text-center p-8">
              <span className="text-5xl block mb-4">📸</span>
              <button 
                onClick={startCamera}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700"
              >
                Start Camera
              </button>
            </div>
          )}

          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
          />
          
          <canvas ref={canvasRef} className="hidden" />

          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Analyzing with Gemini AI...</p>
              <p className="text-xs opacity-60">Checking Ibadan disposal guidelines</p>
            </div>
          )}

          {isCameraActive && !isAnalyzing && (
            <div className="absolute inset-0 pointer-events-none border-[20px] border-white/10 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-emerald-400/50 rounded-3xl relative">
                <div className="absolute inset-0 bg-emerald-400/10 animate-pulse"></div>
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-500"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-500"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-500"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-500"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-4 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {result ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Category</p>
                  <p className="text-lg font-bold text-emerald-600">{result.category}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Disposal Advice</p>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{result.advice}"</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Environmental Impact</p>
                <p className="text-sm text-orange-800 font-medium">{result.impact}</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setResult(null); startCamera(); }}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200"
                >
                  Scan Again
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700"
                >
                  Done
                </button>
              </div>
            </div>
          ) : isCameraActive ? (
            <button 
              onClick={captureAndAnalyze}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Capture & Analyze
            </button>
          ) : !isAnalyzing && (
            <button 
              onClick={onClose}
              className="w-full border-2 border-slate-100 text-slate-400 py-3 rounded-2xl font-bold hover:bg-slate-50"
            >
              Close Scanner
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
