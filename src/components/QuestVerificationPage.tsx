import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, CheckCircle2, ChevronLeft, Send, Sparkles, Wand2, ShieldCheck, Flame, Info, AlertCircle } from 'lucide-react';
import { Quest } from '../types';

interface QuestVerificationPageProps {
  quest: Quest;
  onSuccess: (questId: string, xpAward: number, tokenAward: number, message: string) => void;
  onClose: () => void;
}

export default function QuestVerificationPage({ quest, onSuccess, onClose }: QuestVerificationPageProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [statusText, setStatusText] = useState('Position yourself in the camera frame');
  
  // Stretch specific tracking simulation indicators
  const [trackedPoints, setTrackedPoints] = useState<Array<{ name: string; x: number; y: number; confidence: number }>>([]);
  
  // Clean meal rating and analytics
  const [mealAnalysis, setMealAnalysis] = useState<{
    score: number;
    name: string;
    description: string;
    calories: number;
    protein: string;
    carbs: string;
    fats: string;
    nutrients: string[];
  } | null>(null);

  // Swim training narrative state
  const [swimReview, setSwimReview] = useState('');
  const [swimReviewError, setSwimReviewError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Initialize Camera for Stretching and Clean Meals
  useEffect(() => {
    if (quest.id === 'stretching' || quest.id === 'meals') {
      startCamera();
    }
    return () => {
      stopCamera();
      if (scanIntervalRef.current) {
        window.clearInterval(scanIntervalRef.current);
      }
    };
  }, [quest]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera blocked or unavailable, enabling high-fidelity vector preview: ', err);
      setCameraError('Camera access not allowed or webcam not found. Enacting synthetic biometric engine fallback.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Simulated Skeletal Motion Alignment coordinate updates for stretching
  useEffect(() => {
    if (scanState === 'scanning' && quest.id === 'stretching') {
      const interval = window.setInterval(() => {
        setTrackedPoints([
          { name: 'Spine Center', x: 50 + Math.sin(Date.now() / 300) * 2, y: 40 + Math.cos(Date.now() / 400) * 1.5, confidence: 0.98 },
          { name: 'Shoulder L', x: 35 + Math.sin(Date.now() / 250) * 1, y: 28 + Math.cos(Date.now() / 350) * 1, confidence: 0.95 },
          { name: 'Shoulder R', x: 65 - Math.sin(Date.now() / 250) * 1, y: 28 + Math.cos(Date.now() / 350) * 1, confidence: 0.96 },
          { name: 'Hip L', x: 38, y: 65, confidence: 0.93 },
          { name: 'Hip R', x: 62, y: 65, confidence: 0.92 },
          { name: 'Knee L / Joint Extension', x: 30 + Math.sin(Date.now() / 500) * 4, y: 82 + Math.cos(Date.now() / 500) * 2, confidence: 0.89 },
          { name: 'Knee R / Joint Extension', x: 70 - Math.sin(Date.now() / 500) * 4, y: 82 + Math.cos(Date.now() / 500) * 2, confidence: 0.91 },
        ]);
      }, 80);
      return () => clearInterval(interval);
    } else {
      setTrackedPoints([]);
    }
  }, [scanState, quest.id]);

  // Handle Scanning Progression
  const triggerScanning = () => {
    setScanState('scanning');
    setScanProgress(0);
    setStatusText(quest.id === 'stretching' ? 'Synchronizing skeletal keypoints... Hold still' : 'Analyzing nutritional pigments...');

    const duration = 4000; // 4 seconds scan
    const step = 80;
    const increment = (step / duration) * 100;

    const phrases = quest.id === 'stretching' 
      ? [
          'Locating spine center...',
          'Flexibility compliance: 88%...',
          'Hamstring pose angle: 115° (Excellent)...',
          'Skeletal posture holds stretch balance limit...',
          'Stretching detected!'
        ]
      : [
          'Detecting meal bounds...',
          'Analyzing antioxidant markers...',
          'Spectrogram: Vegetable content high...',
          'Synthesizing raw nutritional profile...',
          'Diet analysis finalized!'
        ];

    let phraseIndex = 0;

    scanIntervalRef.current = window.setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + increment;
        
        // Update phrase midway
        const pIndex = Math.floor((next / 100) * phrases.length);
        if (pIndex !== phraseIndex && phrases[pIndex]) {
          phraseIndex = pIndex;
          setStatusText(phrases[pIndex]);
        }

        if (next >= 100) {
          if (scanIntervalRef.current) {
            window.clearInterval(scanIntervalRef.current);
          }
          completeScanSucceeds();
          return 100;
        }
        return next;
      });
    }, step);
  };

  const completeScanSucceeds = () => {
    setScanState('success');
    stopCamera();

    if (quest.id === 'meals') {
      // Pick a random healthy meal for rating representation
      const mealOptions = [
        {
          score: 9,
          name: 'Sesame Salmon Bowl',
          description: 'Sautéed salmon fillet on a bed of warm brown rice, seasoned broccoli stems, spinach shoots, and creamy avocado paste with light dressing.',
          calories: 540,
          protein: '38g',
          carbs: '42g',
          fats: '21g',
          nutrients: ['High Omega-3 fats', 'Beta-carotene', 'Fiber complex', 'Lean premium minerals']
        },
        {
          score: 10,
          name: 'Rainbow Mediterranean Plate',
          description: 'Boiled lean organic whole chicken cubes, crispy salad leaves, cucumber slices, cold chickpeas, roasted beetroots, and squeezed ripe lemon drops.',
          calories: 420,
          protein: '45g',
          carbs: '28g',
          fats: '12g',
          nutrients: ['Lean amino support', 'Vitamin C boost', 'Iron rich beets', 'Low cholesterol raw carbs']
        },
        {
          score: 8,
          name: 'Poached Egg Avocado Slices',
          description: 'Two cage-free poached eggs alongside ripe hand-mashed avocado halves, seasoned with chia seeds and chili flakes on fresh sourdough toast.',
          calories: 390,
          protein: '18g',
          carbs: '24g',
          fats: '22g',
          nutrients: ['High healthy fats', 'Lutein (optics boost)', 'High zinc egg yolk', 'Fiber toast']
        }
      ];

      const chosen = mealOptions[Math.floor(Math.random() * mealOptions.length)];
      setMealAnalysis(chosen);
    }
  };

  // Submit Stretching Quest
  const handleStretchingClaim = () => {
    onSuccess(
      'stretching',
      quest.xpReward,
      quest.tokenReward,
      '🧘 Biometric Align Certified: +5 XP & +10 Tokens!'
    );
  };

  // Submit Diet Quest
  const handleDietClaim = () => {
    if (!mealAnalysis) return;
    onSuccess(
      'meals',
      quest.xpReward + Math.max(0, mealAnalysis.score - 5), // dynamic healthy food bonus
      quest.tokenReward,
      `🍽️ Healthy Meal Certified (${mealAnalysis.score}/10): +${quest.xpReward} XP & +${quest.tokenReward} Tokens!`
    );
  };

  // Submit Swim Review Log Verification
  const handleSwimSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setSwimReviewError(null);

    // Simple sentence matching: minimum two sentences ending with punctuation markers (. or ! or ?)
    const sentences = swimReview
      .trim()
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10); // validate sentence has some actual content

    if (sentences.length < 2) {
      setSwimReviewError('Please type a genuine review of your swim training. It must contain at least 2 complete sentences about your threshold, pulling, kicking, or sets!');
      return;
    }

    // Success! 
    onSuccess(
      'swim',
      quest.xpReward,
      quest.tokenReward,
      '🏊 Aquatic Log Approved! Swim sets archived successfully: +15 XP & +25 Tokens!'
    );
  };

  return (
    <div className="bg-[#001021] text-[#d2e4ff] min-h-screen p-6 relative pb-[120px] animate-[fadeIn_0.3s_ease] flex flex-col">
      {/* Header Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onClose}
          className="p-2 bg-surface-container hover:bg-surface-variant text-primary border border-outline-variant rounded-xl transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] text-primary uppercase tracking-[0.25em] font-bold font-mono">QUEST VERIFICATION</span>
          <h2 className="font-headline text-xl text-on-surface font-extrabold tracking-tight leading-none uppercase">{quest.name}</h2>
        </div>
      </div>

      {/* Quest Goal Card */}
      <div className="bg-surface-container rounded-xl p-4.5 mb-6 border border-outline-variant flex flex-col gap-1.5 shadow-md">
        <div className="flex justify-between items-center">
          <span className="font-label-sm text-[10px] text-secondary font-bold uppercase tracking-widest bg-secondary/15 px-2.5 py-1 rounded-full">ACTIVE CRITERIA</span>
          <span className="font-mono text-xs text-primary font-bold">+{quest.xpReward} XP Base | ${quest.tokenReward} Tokens</span>
        </div>
        <p className="text-on-surface-variant text-sm font-sans leading-relaxed mt-2">{quest.description}</p>
      </div>

      <div className="flex-1 flex flex-col">
        {/* ================= STRETCHING & CLEAN MEALS SCANNING UI ================= */}
        {(quest.id === 'stretching' || quest.id === 'meals') && (
          <div className="flex-1 flex flex-col">
            {scanState === 'idle' && (
              <div className="flex-1 flex flex-col justify-between items-center py-6 text-center">
                {/* Frame Guide representation */}
                <div className="w-full aspect-[4/3] max-w-[360px] bg-neutral-900 border-2 border-dashed border-primary/40 rounded-2xl relative overflow-hidden flex items-center justify-center p-3">
                  {cameraError ? (
                    <div className="p-4 bg-surface-container-high border border-outline-variant rounded-xl max-w-[280px]">
                      <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <p className="text-[11px] text-amber-300 leading-tight">
                        {cameraError}
                      </p>
                      <button 
                        onClick={startCamera} 
                        className="mt-3 text-[10px] bg-primary/20 border border-primary/40 text-primary py-1 px-3 rounded text-center transition-all hover:bg-primary/30"
                      >
                        Retry Access
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Real Web Camera Live Feed */}
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                      />
                      {/* Biometric guide overlay */}
                      <div className="absolute inset-4 border border-primary/20 rounded-lg pointer-events-none flex items-center justify-center">
                        <div className="w-full h-full relative">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                          
                          {/* Centered target silhouette overlay */}
                          <div className="absolute inset-10 rounded-full border border-primary/10 flex items-center justify-center animate-pulse">
                            <span className="text-[9px] text-[#547596] font-mono tracking-widest font-bold uppercase">Biometric Alignment Box</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8 space-y-4 w-full max-w-[360px] mx-auto">
                  <div className="text-center">
                    <span className="text-secondary text-xs uppercase font-extrabold tracking-widest font-headline">Calibration Ready</span>
                    <p className="text-xs text-on-surface-variant font-sans mt-1">Please prepare your feed environment and tap below to start active scanning.</p>
                  </div>

                  <button
                    onClick={triggerScanning}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-blue-600 text-on-primary font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:opacity-95 transition-all shadow-[0_4px_15px_rgba(0,180,210,0.3)] border border-primary/30"
                  >
                    Start AI Scan Verification
                  </button>
                </div>
              </div>
            )}

            {scanState === 'scanning' && (
              <div className="flex-1 flex flex-col justify-center items-center py-6 text-center">
                {/* Active Scanning Video Container */}
                <div className="w-full aspect-[4/3] max-w-[360px] bg-neutral-950 border-2 border-primary rounded-2xl relative overflow-hidden flex items-center justify-center p-3 animate-pulse">
                  
                  {/* Web Video Feed */}
                  {!cameraError && (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] opacity-75"
                    />
                  )}

                  {/* Laser Scan Sweep bar */}
                  <div 
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] z-20"
                    style={{
                      animation: 'scanSweep 2.5s infinite linear',
                    }}
                  />

                  {/* Simulated stretching skeletal dots overlay */}
                  {quest.id === 'stretching' && trackedPoints.map((pt, index) => (
                    <div 
                      key={index} 
                      className="absolute w-3 h-3 bg-cyan-400 border border-white rounded-full flex items-center justify-center shadow-[0_0_8px_#22d3ee] z-15 transition-all duration-100"
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    >
                      <div className="absolute w-6 h-6 bg-cyan-400/20 rounded-full animate-ping whitespace-nowrap text-[6px] text-cyan-200 mt-6 font-mono font-bold uppercase bg-neutral-900/80 px-1 py-0.5 border border-cyan-400/10">
                        {pt.name}
                      </div>
                    </div>
                  ))}

                  {/* Simulated bounding plate food boxes for Clean Meals */}
                  {quest.id === 'meals' && (
                    <div className="absolute inset-12 border-2 border-dashed border-amber-400 rounded-lg flex flex-col items-start p-2 pointer-events-none z-10 animate-pulse bg-amber-400/5">
                      <span className="text-[8px] bg-amber-400 text-neutral-950 font-mono font-bold uppercase px-1 py-0.5 rounded shadow">
                        Analyzing Food Plate...
                      </span>
                    </div>
                  )}

                  {/* Progress circle or spinner in center */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-30">
                    <div className="text-center p-4">
                      {/* Big Progress Number */}
                      <span className="font-mono text-4xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                        {Math.round(scanProgress)}%
                      </span>
                      <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden mt-2 mx-auto">
                        <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                      Biometric Live Pulse
                    </span>
                  </div>
                  <h4 className="font-headline text-md text-on-surface uppercase animate-pulse">{statusText}</h4>
                  <p className="text-xs text-on-surface-variant font-sans px-8">Stay stable inside the analyzer frame while we benchmark your habits.</p>
                </div>
              </div>
            )}

            {scanState === 'success' && (
              <div className="flex-1 flex flex-col justify-between py-4 animate-[fadeIn_0.5s_ease]">
                <div className="space-y-6">
                  
                  {/* Massive Checkmark Glow Card */}
                  <div className="bg-surface-container-high rounded-xl p-6 border border-primary/20 text-center relative overflow-hidden shadow-lg flex flex-col items-center">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                    <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary mb-3.5 shadow-inner">
                      <CheckCircle2 className="w-9 h-9 text-primary" />
                    </div>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-[0.25em] font-mono block">VERIFICATION COMPLETE</span>
                    <h3 className="font-headline text-lg text-on-surface font-extrabold mt-1">Biometric Record Stored</h3>
                  </div>

                  {/* Stretching completion stats details */}
                  {quest.id === 'stretching' && (
                    <div className="bg-surface-container-medium border border-outline-variant/60 rounded-xl p-5 space-y-4 shadow">
                      <h4 className="text-xs font-bold text-secondary uppercase font-headline tracking-wider flex items-center gap-1.5 border-b border-outline-variant/15 pb-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Posture Performance Benchmark
                      </h4>
                      <dl className="grid grid-cols-2 gap-4 text-xs font-sans">
                        <div>
                          <dt className="text-on-surface-variant uppercase text-[10px] font-bold">Joint Range (ROI)</dt>
                          <dd className="text-on-surface font-mono font-medium text-13 mt-0.5">142° Angle Lock</dd>
                        </div>
                        <div>
                          <dt className="text-on-surface-variant uppercase text-[10px] font-bold">Duration Benchmarked</dt>
                          <dd className="text-on-surface font-mono font-medium text-13 mt-0.5">20 min active session</dd>
                        </div>
                        <div>
                          <dt className="text-on-surface-variant uppercase text-[10px] font-bold">Spine Alignment Accuracy</dt>
                          <dd className="text-on-surface font-mono font-medium text-13 mt-0.5 text-primary">96.4% optimal</dd>
                        </div>
                        <div>
                          <dt className="text-on-surface-variant uppercase text-[10px] font-bold">Autonomic Balance</dt>
                          <dd className="text-on-surface font-mono font-medium text-13 mt-0.5">Coherent Zen state</dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  {/* Clean Meal specific rating details */}
                  {quest.id === 'meals' && mealAnalysis && (
                    <div className="bg-[#031d38] border-2 border-primary/20 rounded-2xl p-5 space-y-4 shadow-xl">
                      
                      {/* Big Score Indicator */}
                      <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                        <div>
                          <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">DIET ANALYZER RATING</span>
                          <h4 className="font-headline text-md text-on-surface font-black uppercase mt-0.5 leading-none">{mealAnalysis.name}</h4>
                        </div>
                        <div className="flex items-center justify-center p-2.5 bg-primary/10 border border-primary/30 rounded-xl leading-none text-center h-14 w-14">
                          <span className="font-mono text-on-surface text-xl font-black">{mealAnalysis.score}<span className="text-[10px] text-primary font-bold">/10</span></span>
                        </div>
                      </div>

                      <div className="space-y-3 font-sans">
                        <p className="text-xs text-on-surface-variant leading-relaxed italic">
                          "{mealAnalysis.description}"
                        </p>

                        <div className="grid grid-cols-4 gap-2 text-center pt-2">
                          <div className="bg-surface-container-high rounded p-1.5 border border-outline-variant/50">
                            <span className="text-[8px] text-on-surface-variant block uppercase leading-none">Calories</span>
                            <span className="text-xs font-bold font-mono text-on-surface mt-0.5 block">{mealAnalysis.calories}g</span>
                          </div>
                          <div className="bg-surface-container-high rounded p-1.5 border border-outline-variant/50">
                            <span className="text-[8px] text-on-surface-variant block uppercase leading-none">Protein</span>
                            <span className="text-xs font-bold font-mono text-primary mt-0.5 block">{mealAnalysis.protein}</span>
                          </div>
                          <div className="bg-surface-container-high rounded p-1.5 border border-outline-variant/50">
                            <span className="text-[8px] text-on-surface-variant block uppercase leading-none">Carbs</span>
                            <span className="text-xs font-bold font-mono text-secondary mt-0.5 block">{mealAnalysis.carbs}</span>
                          </div>
                          <div className="bg-surface-container-high rounded p-1.5 border border-outline-variant/50">
                            <span className="text-[8px] text-on-surface-variant block uppercase leading-none">Healthy Fats</span>
                            <span className="text-xs font-bold font-mono text-tertiary mt-0.5 block">{mealAnalysis.fats}</span>
                          </div>
                        </div>

                        {/* Nutrition chips */}
                        <div className="pt-2">
                          <span className="text-[9px] text-[#547596] font-bold uppercase tracking-wider block mb-1.5">Diet Key Benefits</span>
                          <div className="flex flex-wrap gap-1.5">
                            {mealAnalysis.nutrients.map((n, i) => (
                              <span key={i} className="text-[10px] font-medium bg-[#022c54]/55 text-primary border border-[#1e4d7a] px-2 py-0.5 rounded-full">
                                ✓ {n}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <button
                  onClick={quest.id === 'stretching' ? handleStretchingClaim : handleDietClaim}
                  className="w-full mt-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 border border-green-400 text-white font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                >
                  Accept & Claim Quest Rewards
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= SWIM TRAINING NARRATIVE INPUT UI ================= */}
        {quest.id === 'swim' && (
          <form onSubmit={handleSwimSubmission} className="flex-1 flex flex-col justify-between py-2 font-sans animate-[fadeIn_0.4s_ease]">
            <div className="space-y-5">
              
              <div className="bg-surface-container-medium border border-outline-variant/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary animate-pulse" />
                  <h4 className="text-xs font-extrabold uppercase font-headline text-on-surface tracking-wider">
                    Workout Review Narrator
                  </h4>
                </div>
                
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Type in a short narrative (minimum two full sentences) reviewing your swimming session for the day (swim sets, distances, thresholds, pulling, kicking, breathing, etc.) to get certified.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#547596] font-bold uppercase tracking-wider block">
                    Your Swimming Log Review
                  </label>
                  <textarea
                    value={swimReview}
                    onChange={(e) => setSwimReview(e.target.value)}
                    placeholder="E.g. Completed a 1500m threshold freestyle set with swimming kickboard drills. Focused on strong high-elbow pulling technique and consistent bi-lateral breathing in the final laps."
                    className="w-full h-36 bg-[#011424] text-on-surface placeholder:text-[#38516b] border border-outline-variant rounded-xl p-4 text-xs font-sans leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  {swimReviewError && (
                    <p className="text-[10.5px] text-error font-medium leading-normal bg-error/10 border border-error/20 p-2.5 rounded-lg">
                      {swimReviewError}
                    </p>
                  )}
                </div>

                {/* Example Quick Presets */}
                <div className="pt-2">
                  <span className="text-[9px] text-[#547596] font-bold uppercase tracking-wider block mb-1">Quick presets:</span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSwimReview("Did a strenuous 2500m endurance workout. Kept high pace kicking focus-sets with active oxygen control. Arm pulls felt robust and strong.")}
                      className="text-left text-[10.5px] text-[#8cbbf0] hover:text-white bg-[#022c54]/30 hover:bg-[#022c54]/60 p-2 rounded border border-[#1e4d7a]/50 transition-all font-sans"
                    >
                      💡 "Did a strenuous 2500m endurance workout. Kept high pace kicking focus-sets with active oxygen control..."
                    </button>
                    <button
                      type="button"
                      onClick={() => setSwimReview("Completed 45 minutes of intense aerobic drills at 4-beat kicking rate. Focused on smooth high-elbow water recovery and powerful streamline gliding.")}
                      className="text-left text-[10.5px] text-[#8cbbf0] hover:text-white bg-[#022c54]/30 hover:bg-[#022c54]/60 p-2 rounded border border-[#1e4d7a]/50 transition-all font-sans"
                    >
                      💡 "Completed 45 minutes of intense aerobic drills at 4-beat kicking rate. Focused on smooth streamline gliding..."
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio-metric certificate banner */}
              <div className="bg-[#021f3d] p-3.5 border border-primary/20 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-primary uppercase font-extrabold font-mono block">HydroPulse Shield</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Logs are cross-verified and stored on local bio-chain standards for safety audits.</p>
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full mt-8 py-3.5 bg-gradient-to-r from-primary to-blue-600 text-on-primary font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-primary/30"
            >
              Submit & Verify Aquatic Training
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* Styled animation keyframes inside style tag for instant compatibility */}
      <style>{`
        @keyframes scanSweep {
          0% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
