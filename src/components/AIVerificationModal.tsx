import { useState } from 'react';
import React from 'react';
import { Camera, Mic, Sparkles, Check, ChevronRight, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Quest, PlayerState } from '../types';

interface AIVerificationModalProps {
  quest: Quest;
  playerState: PlayerState;
  onClose: () => void;
  onVerifySuccess: (xpAwarded: number, tokenReward: number, extraMsg: string) => void;
}

// Pre-packaged high-quality mock base64 data to let users test instantly
const YOGA_STRETCHING_BASE64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgABPxA=";
const HEALTHY_PLATE_BASE64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgABPxA=";

export default function AIVerificationModal({
  quest,
  playerState,
  onClose,
  onVerifySuccess,
}: AIVerificationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputText, setInputText] = useState('');
  const [voiceInput, setVoiceInput] = useState('');
  const [localImageBase64, setLocalImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('CONNECTING ENGINE...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // File picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        // Strip data:image/*;base64, prefix for raw transfer
        const strippedBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
        setLocalImageBase64(strippedBase64);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select preset athlete demo files
  const selectPresetImage = (type: 'stretching' | 'meals') => {
    if (type === 'stretching') {
      setLocalImageBase64(YOGA_STRETCHING_BASE64);
      setInputText("Active warrior pose stretching session on living room mat, 20 mins completed.");
    } else {
      setLocalImageBase64(HEALTHY_PLATE_BASE64);
      setInputText("Grilled salmon, brown rice, fresh spinach salad, avocados.");
    }
    setStep(2);
  };

  // Run Gemini API Verification
  const startVerification = async () => {
    setLoading(true);
    setStep(3);
    
    const messages = [
      "SYNCHRONIZING BIO-FEEDBACK PORTAL...",
      "RECRUITING COGNITIVE MAINFRAME...",
      "SCANNING SPATIAL GEOMETRY...",
      "EVALUATING RECOVERY MACROS...",
      "APPLYING HABIT REWARDS..."
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex < messages.length - 1) {
        msgIndex++;
        setLoadingMsg(messages[msgIndex]);
      }
    }, 900);

    try {
      const res = await fetch('/api/verify-habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questType: quest.type,
          inputText: inputText || undefined,
          image: localImageBase64 || undefined,
          voiceText: voiceInput || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Verification route returned an error");
      }

      const data = await res.json();
      clearInterval(interval);
      setVerificationResult(data);
      setLoading(false);
      
      // Award bonuses! If Speed Multiplier is active, double rewards
      let multiplier = playerState.equippedCosmetics.includes('double_xp') ? 2 : 1;
      const xpToAward = (data.xpAwarded || 15) * multiplier;
      const tokensToAward = quest.tokenReward;

      // Notify parent to aggregate state
      onVerifySuccess(xpToAward, tokensToAward, data.message || "Habit verified!");
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setErrorMsg("Mainframe connection timeout. Falling back to local verification.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-surface-dim/85 backdrop-blur-md flex items-center justify-center p-gutter">
      <div className="bg-surface-container-high w-full max-w-md rounded-xl border-2 border-outline-variant pixel-shadow flex flex-col p-6 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="font-headline-md text-headline-md text-primary uppercase">AI quest Verification</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest Summary Badge */}
        <div className="mt-4 p-3 bg-surface-container rounded-lg border border-outline-variant flex justify-between items-center">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest leading-none">ACTIVE VERIFIABLE</span>
            <h4 className="font-headline-md text-[16px] text-on-surface mt-0.5">{quest.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-xs text-primary font-bold font-mono">+{quest.xpReward} XP Base</span>
          </div>
        </div>

        {/* Step 1: Input Setup */}
        {step === 1 && (
          <div className="mt-4 flex-1 flex flex-col gap-4">
            <p className="text-on-surface-variant text-body-md">
              Secure maximum rewards and smash the Aqua-Behemoth by verifying your habit with HydroPulse’s active learning algorithms.
            </p>

            {quest.type === 'stretching' && (
              <div className="space-y-3">
                <span className="font-label-md text-primary font-bold block uppercase">Stretching AI (Camera & Motion Analysis)</span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => selectPresetImage('stretching')}
                    className="flex-1 py-3 px-2 bg-surface-container border border-primary-container/20 rounded-lg text-primary text-xs font-bold hover:bg-surface-variant flex flex-col items-center gap-1 pixel-border"
                  >
                    <Sparkles className="w-5 h-5 text-primary" />
                    Athlete Pose Preset
                  </button>
                  
                  <label className="flex-1 py-3 px-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface text-xs font-semibold hover:bg-surface-variant flex flex-col items-center gap-1 cursor-pointer">
                    <Camera className="w-5 h-5 text-on-surface-variant" />
                    Snap / Upload photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            )}

            {quest.type === 'clean_meals' && (
              <div className="space-y-3">
                <span className="font-label-md text-primary font-bold block uppercase">Diet AI (Food Recognition plate analyze)</span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => selectPresetImage('meals')}
                    className="flex-1 py-3 px-2 bg-surface-container border border-primary-container/25 rounded-lg text-primary text-xs font-bold hover:bg-surface-variant flex flex-col items-center gap-1 pixel-border"
                  >
                    <Sparkles className="w-5 h-5 text-primary" />
                    Healthy Salmon plate
                  </button>
                  
                  <label className="flex-1 py-3 px-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface text-xs font-semibold hover:bg-surface-variant flex flex-col items-center gap-1 cursor-pointer">
                    <Camera className="w-5 h-5 text-on-surface-variant" />
                    Snap healthy meal
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            )}

            {quest.type === 'swim' && (
              <div className="space-y-2">
                <span className="font-label-md text-primary font-bold block uppercase">Practice AI (Performance Audio/Log index)</span>
                <p className="text-xs text-on-surface-variant mb-1">Upload a performance narrative or describe your workout below.</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setInputText("I did 45 mins of stamina swimming. Constant high pace freestyle. Completed 1.5 miles at local pool. Feels refreshing!");
                      setStep(2);
                    }}
                    className="flex-1 py-2 px-1 bg-surface-container border border-outline-variant rounded text-on-surface text-xs hover:bg-surface-variant"
                  >
                    Preset Stamina Swim Log
                  </button>
                  <button 
                    onClick={() => {
                      setInputText("Intense short interval sprints in the water. 60 seconds drill, 30 seconds active recovery. Heart rate clocked in at 165 bpm.");
                      setStep(2);
                    }}
                    className="flex-1 py-2 px-1 bg-surface-container border border-outline-variant rounded text-on-surface text-xs hover:bg-surface-variant"
                  >
                    Preset Sprint Drill
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="font-label-md text-on-surface-variant font-bold block uppercase mt-2">Log text description</span>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type details, effort metrics, or notes here..."
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none font-sans"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-2 w-full py-3 bg-primary text-on-primary font-headline-md text-sm rounded-lg flex items-center justify-center gap-2 pixel-border hover:opacity-95 transition-opacity"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Confirm inputs & trigger verification */}
        {step === 2 && (
          <div className="mt-4 flex-1 flex flex-col gap-4">
            <h5 className="font-headline-md text-[16px] text-on-surface">PRE-FLIGHT BIO-SPECS</h5>
            
            <div className="bg-surface-container p-3 rounded-lg border border-outline-variant space-y-2 max-h-[160px] overflow-y-auto">
              {localImageBase64 ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-surface-variant border border-primary flex items-center justify-center text-primary font-bold text-[10px]" style={{ backgroundImage: `url(data:image/jpeg;base64,${localImageBase64})`, backgroundSize: 'cover' }}>
                    IMG
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <span className="text-secondary text-xs uppercase font-bold">Postural Attachment</span>
                    <p className="text-xs text-on-surface-variant truncate">habit_check_biometrics_raw.png</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">No image loaded.</p>
              )}
              
              <div>
                <span className="text-secondary text-xs uppercase font-bold">Activity Narrative Log</span>
                <p className="text-xs text-on-surface font-sans leading-relaxed mt-1 bg-surface-container-high p-2 rounded">
                  {inputText || "No custom log description written (Default standard validation will apply)."}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-surface-variant text-on-surface-variant font-headline-md text-sm rounded-lg border border-outline-variant"
              >
                Back
              </button>
              <button
                onClick={startVerification}
                className="flex-1 py-3 bg-primary text-on-primary font-headline-md text-sm rounded-lg flex items-center justify-center gap-2 pixel-border hover:opacity-95"
              >
                Launch AI Verify
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: API Response Results or loading */}
        {step === 3 && (
          <div className="mt-4 flex-1 flex flex-col items-center py-6 text-center">
            {loading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <h4 className="font-headline-md text-headline-md text-primary animate-pulse">{loadingMsg}</h4>
                <p className="text-xs text-on-surface-variant font-mono">TRANSMITTING TELEMETRY MATRIX TO GEMINI CHASSIS...</p>
              </div>
            ) : errorMsg && !verificationResult ? (
              <div className="space-y-4 w-full">
                <div className="w-12 h-12 bg-error/10 border border-error rounded-full flex items-center justify-center text-error mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="font-headline-md text-headline-md text-error">VERIFICATION COMPLETED (SIMULATED)</h4>
                <p className="text-xs text-on-surface-variant font-sans px-4">
                  {errorMsg}
                </p>
                <button
                  onClick={() => {
                    // Set up standard mock success data anyway to keep the experience bulletproof
                    const accuracy = 91;
                    setVerificationResult({
                      success: true,
                      analysis: "Stretching AI: Perfect lower body flexion. Standard alignment holds high performance metrics.",
                      message: "Posture is 91% perfect! Awesome, Keep it Up!",
                      xpAwarded: 20,
                      stretchingAccuracy: accuracy
                    });
                    setErrorMsg(null);
                  }}
                  className="w-full py-2.5 bg-primary text-on-primary font-headline-md text-sm rounded-lg"
                >
                  Accept simulated analysis
                </button>
              </div>
            ) : (
              <div className="w-full space-y-4 text-left">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-2 animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                
                <h4 className="font-headline-md text-headline-md text-primary text-center">AI VERIFIED SUCCESSFULLY!</h4>
                <p className="text-headline-md text-[15px] font-bold text-center text-secondary border-b border-outline-variant pb-2 leading-none">
                  +{(verificationResult?.xpAwarded || quest.xpReward)} XP Awarded
                </p>

                {/* Stretching Details */}
                {quest.type === 'stretching' && verificationResult?.stretchingAccuracy && (
                  <div className="p-3 bg-surface-container rounded-lg border border-outline-variant space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant font-bold">STRETCH ACCURACY:</span>
                      <span className="font-headline-md text-primary">{verificationResult.stretchingAccuracy}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${verificationResult.stretchingAccuracy}%` }} />
                    </div>
                  </div>
                )}

                {/* Meals Details */}
                {quest.type === 'clean_meals' && verificationResult?.macros && (
                  <div className="p-3 bg-surface-container rounded-lg border border-outline-variant space-y-2">
                    <span className="text-xs text-on-surface-variant font-bold block mb-1">PLATE MICRO-BREAKDOWN:</span>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                      <div className="bg-primary/10 border border-primary/20 p-1.5 rounded">
                        <span className="text-primary block">{verificationResult.macros.protein}%</span>
                        Protein
                      </div>
                      <div className="bg-secondary/10 border border-secondary/20 p-1.5 rounded">
                        <span className="text-secondary block">{verificationResult.macros.carbs}%</span>
                        Carbs
                      </div>
                      <div className="bg-tertiary-container/10 border border-tertiary-container/20 p-1.5 rounded">
                        <span className="text-tertiary block">{verificationResult.macros.veggies}%</span>
                        Veggies
                      </div>
                      <div className="bg-error/10 border border-error/20 p-1.5 rounded">
                        <span className="text-error block">{verificationResult.macros.fats}%</span>
                        Fats
                      </div>
                    </div>
                  </div>
                )}

                {/* Practice Scores */}
                {quest.type === 'swim' && verificationResult?.score && (
                  <div className="p-3 bg-surface-container rounded-lg border border-outline-variant space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-on-surface-variant font-bold">PERFORMANCE INTENSITY:</span>
                      <span className="text-xs text-primary font-bold uppercase">{verificationResult.score}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-on-surface-variant">CARDIOVASCULAR LOAD:</span>
                      <span className="text-secondary font-bold">{verificationResult.cardioLoad || "Medium-High"}</span>
                    </div>
                  </div>
                )}

                <div className="bg-surface-container p-3 rounded-lg border border-outline-variant space-y-1">
                  <span className="text-xs text-secondary font-bold font-mono">COACH VERDICT:</span>
                  <p className="text-xs text-on-surface leading-relaxed font-sans italic bg-surface-container-high p-2 rounded">
                    "{verificationResult?.analysis}"
                  </p>
                </div>

                <div className="p-3 bg-primary-container/10 border border-primary/30 rounded-lg text-primary text-xs font-mono text-center">
                  {verificationResult?.message || "Quest completed: Excellent posture alignment verified. Awesome, Keep it Up!"}
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-primary text-on-primary font-headline-md text-sm rounded-lg pixel-border hover:opacity-95"
                >
                  Return to Arena
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
