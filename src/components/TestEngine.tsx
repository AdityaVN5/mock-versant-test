import { useState, useEffect, useRef } from 'react';
import { generateRandomExam } from '../data/questions';
import { QuestionPhase, TestResult, Question } from '../types';
import { playTTS, playBeep, SilenceDetector } from '../lib/audioUtils';
import { Mic, Loader2, PlayCircle, EyeOff, CheckCircle, ArrowRight, BookOpen, Compass, Award, Play, Volume2 } from 'lucide-react';

interface DemoConfig {
  promptAudioText: string;
  promptDisplayText?: string;
  responseType: 'speaking' | 'writing';
  responseDemoText: string;
  explanation: string;
}

const SECTION_DEMOS: Record<string, DemoConfig> = {
  'part-a': {
    promptAudioText: "Please read the text aloud.",
    promptDisplayText: "The library remains open until midnight.",
    responseType: 'speaking',
    responseDemoText: "The library remains open until midnight.",
    explanation: "Read the displayed sentence aloud as soon as you hear the beep."
  },
  'part-b': {
    promptAudioText: "She decided to walk to work today.",
    responseType: 'speaking',
    responseDemoText: "She decided to walk to work today.",
    explanation: "Listen to the sentence (the text is hidden during the test) and repeat it exactly."
  },
  'part-c': {
    promptAudioText: "in the park ... the dog ... was running",
    responseType: 'speaking',
    responseDemoText: "The dog was running in the park.",
    explanation: "Rearrange the spoken jumbled phrases into a single correct sentence."
  },
  'part-d': {
    promptAudioText: "Person one: I need a pen. Person two: Here is one. Where is the pen?",
    responseType: 'speaking',
    responseDemoText: "On the desk.",
    explanation: "Listen to the short dialogue, and answer the question with a simple phrase."
  },
  'part-e': {
    promptAudioText: "",
    promptDisplayText: "The quick brown fox jumps over the lazy dog.",
    responseType: 'writing',
    responseDemoText: "The quick brown fox jumps over the lazy dog.",
    explanation: "Copy the displayed paragraph exactly. Speed and spelling count."
  },
  'part-f': {
    promptAudioText: "",
    promptDisplayText: "Please ________ the door when you leave.",
    responseType: 'writing',
    responseDemoText: "lock",
    explanation: "Type a single missing word that best completes the sentence."
  },
  'part-g': {
    promptAudioText: "Submit the required forms by Friday.",
    responseType: 'writing',
    responseDemoText: "Submit the required forms by Friday.",
    explanation: "Listen to the sentence and type exactly what you hear."
  },
  'part-h': {
    promptAudioText: "",
    promptDisplayText: "The project was a success. The team completed the goals on time.",
    responseType: 'writing',
    responseDemoText: "The project succeeded and the team met their goals on time.",
    explanation: "Read the passage for 30 seconds, then type a reconstruction of it in your own words."
  },
  'part-i': {
    promptAudioText: "Some schools propose year-round classes with short breaks. What is your opinion?",
    responseType: 'speaking',
    responseDemoText: "I believe year-round classes help students stay focused and retain information better.",
    explanation: "Listen to the passage, summarize it, and express your opinion with reasons."
  },
  'part-j': {
    promptAudioText: "High-quality audio is essential for processing.",
    responseType: 'speaking',
    responseDemoText: "High-quality audio is essential for processing.",
    explanation: "Diagnostic Repeat: Listen to the check sentence and repeat it exactly."
  }
};

interface TestEngineProps {
  onComplete: (results: TestResult[]) => void;
  targetSectionId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function TestEngine({ onComplete, targetSectionId, difficulty = 'medium' }: TestEngineProps) {
  const [modIdx, setModIdx] = useState(0);
  const [secIdx, setSecIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);

  const [showSectionIntro, setShowSectionIntro] = useState(true);
  const [phase, setPhase] = useState<QuestionPhase>('buffer');
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Storage
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentText, setCurrentText] = useState('');

  // Interactive Demo State
  const [demoState, setDemoState] = useState<'idle' | 'playing-prompt' | 'beeping' | 'response' | 'completed'>('idle');
  const [demoTypedResponse, setDemoTypedResponse] = useState('');
  const isDemoRunningRef = useRef(false);

  const cancelDemo = () => {
    isDemoRunningRef.current = false;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setDemoState('idle');
    setDemoTypedResponse('');
  };

  const startDemo = async () => {
    const config = SECTION_DEMOS[currentSection.id];
    if (!config) return;

    cancelDemo();
    isDemoRunningRef.current = true;
    
    // 1. Play Prompt Phase
    setDemoState('playing-prompt');
    if (config.promptAudioText) {
      await playTTS(config.promptAudioText);
    } else {
      await new Promise(r => setTimeout(r, 2500));
    }
    
    if (!isDemoRunningRef.current) return;

    // 2. Beep Phase (for speaking parts)
    setDemoState('beeping');
    if (config.responseType === 'speaking') {
      await playBeep();
    } else {
      await new Promise(r => setTimeout(r, 500));
    }

    if (!isDemoRunningRef.current) return;

    // 3. Response Phase
    setDemoState('response');
    if (config.responseType === 'writing') {
      const text = config.responseDemoText;
      for (let i = 0; i <= text.length; i++) {
        if (!isDemoRunningRef.current) return;
        setDemoTypedResponse(text.slice(0, i));
        await new Promise(r => setTimeout(r, 50));
      }
    } else {
      await new Promise(r => setTimeout(r, 2500));
    }

    if (!isDemoRunningRef.current) return;

    // 4. Completed
    setDemoState('completed');
  };

  // Auto cancel demo when changing sections or entering test phase
  useEffect(() => {
    cancelDemo();
    return () => {
      isDemoRunningRef.current = false;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [secIdx, showSectionIntro]);

  // Media
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const silenceDetectorRef = useRef<SilenceDetector | null>(null);
  
  // Timers
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [examData] = useState(() => generateRandomExam(targetSectionId, difficulty));
  const currentModule = examData.modules[modIdx];
  
  // Filter sections if a targetSectionId is passed (e.g. 'part-j' diagnostic)
  const availableSections = currentModule.sections;

  const currentSection = availableSections[secIdx];
  const currentQuestion = currentSection?.questions[qIdx];

  const cleanupTimers = () => {
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (silenceDetectorRef.current) {
      silenceDetectorRef.current.stop();
    }
  };

  // Global Progress Logic
  const advanceQuestion = (result?: TestResult) => {
    if (result) {
      setResults(prev => {
        // Prevent duplicate results for the same questionId
        const base = prev.filter(r => r.questionId !== result.questionId);
        return [...base, result];
      });
    }
    setCurrentText('');

    let nextQ = qIdx + 1;
    let nextSec = secIdx;
    let nextMod = modIdx;

    if (nextQ >= currentSection.questions.length) {
      nextQ = 0;
      nextSec++;
      setShowSectionIntro(true); // Always pop up instructions when advancing to a new section/part!
    }
    if (nextSec >= availableSections.length) {
      // Completed last section of the test run!
      const finalResults = results.filter(r => r.questionId !== (result?.questionId));
      const completedResults = finalResults.concat(result ? [result] : []);

      // Ensure EVERY question in the active exam has a result (default to skipped if missing)
      const allQuestionIds = new Set<string>();
      const filledResults: TestResult[] = [...completedResults];

      completedResults.forEach(r => allQuestionIds.add(r.questionId));

      availableSections.forEach(sec => {
        sec.questions.forEach(q => {
          if (!allQuestionIds.has(q.id)) {
            filledResults.push({
              questionId: q.id,
              skipped: true
            });
          }
        });
      });

      onComplete(filledResults);
      return;
    }

    setQIdx(nextQ);
    setSecIdx(nextSec);
    setModIdx(nextMod);
    setPhase('buffer');
  };

  useEffect(() => {
    if (!currentQuestion) return;
    if (showSectionIntro) return; // Block trigger when instructions screen is active

    let mounted = true;

    const runSequence = async () => {
      // 1. Buffer
      setPhase('buffer');
      await new Promise(r => setTimeout(r, 2000));
      if (!mounted) return;

      // Special case: reading-writing (Task 3) preparation
      if (currentQuestion.type === 'reading-writing' && currentQuestion.preparationTime) {
        setPhase('preparing');
        setTimeLeft(currentQuestion.preparationTime);
        await new Promise(r => {
          phaseTimerRef.current = setTimeout(r, currentQuestion.preparationTime! * 1000);
        });
        if (!mounted) return;
        startWritingPhase();
        return;
      }

      // 2. Play Audio
      const isReadAloud = currentSection.id === 'part-a';

      if (currentQuestion.type !== 'reading-writing' && !isReadAloud) {
        setPhase('playing');
        if (currentQuestion.scenarioText) {
          await playTTS(currentQuestion.scenarioText);
          await new Promise(r => setTimeout(r, 500)); // clear gap
        }
        await playTTS(currentQuestion.promptText);
      }

      if (!mounted) return;

      // 3. Action Phase
      if (currentQuestion.type === 'speaking') {
        await playBeep();
        if (!mounted) return;
        startRecordingPhase();
      } else {
        startWritingPhase();
      }
    };

    runSequence();

    return () => {
      mounted = false;
      cleanupTimers();
      stopRecording();
    };
  }, [modIdx, secIdx, qIdx, showSectionIntro]);

  // Timer Countdown Effect
  useEffect(() => {
    if ((phase === 'recording' || phase === 'writing' || phase === 'preparing') && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phase, timeLeft]);

  // Store the transcribed text in a ref so we can access it in the cleanup timeout
  const transcribedRef = useRef<string>('');

  const startRecordingPhase = async () => {
    setPhase('recording');
    setTimeLeft(currentQuestion.timeLimit);
    transcribedRef.current = "";
    setCurrentText("");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      let recognition: any = null;
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }
            if (finalTranscript) {
               transcribedRef.current += finalTranscript + " ";
               setCurrentText(transcribedRef.current);
            }
          };
          recognition.start();
        }
      } catch (e) {
        console.warn("Speech API not supported or failed to start", e);
      }

      mr.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstart = () => {
        let speechDetected = false;
        
        silenceDetectorRef.current = new SilenceDetector();
        silenceDetectorRef.current.start(stream, 30, () => {
          speechDetected = true;
          if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
        });

        skipTimerRef.current = setTimeout(() => {
          if (!speechDetected) {
            handleRecordingComplete(true); // skip automatically
          }
        }, 6000); // 6 seconds to start speaking
      };

      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (recognition) {
           try { recognition.stop(); } catch(e) {}
        }
      };

      mr.start();

      // End automatically when time limit is reached
      phaseTimerRef.current = setTimeout(() => {
        handleRecordingComplete(false);
      }, currentQuestion.timeLimit * 1000);

    } catch (err) {
      console.error("Recording failed", err);
      setTimeout(() => advanceQuestion({ questionId: currentQuestion.id, skipped: true }), 2000);
    }
  };

  const startWritingPhase = () => {
    setPhase('writing');
    setTimeLeft(currentQuestion.timeLimit);
    phaseTimerRef.current = setTimeout(() => {
      handleWritingComplete();
    }, currentQuestion.timeLimit * 1000);
  };

  const handleRecordingComplete = (skippedDueToSilence: boolean) => {
    stopRecording();
    cleanupTimers();

    setTimeout(() => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      advanceQuestion({
        questionId: currentQuestion.id,
        blob: skippedDueToSilence ? undefined : blob,
        text: transcribedRef.current || currentText,
        skipped: skippedDueToSilence
      });
    }, 100);
  };

  const handleWritingComplete = () => {
    cleanupTimers();
    advanceQuestion({
      questionId: currentQuestion.id,
      text: currentText,
      skipped: currentText.trim().length === 0
    });
  };

  if (!currentQuestion) return null;

  return (
    <div className="h-full flex items-stretch justify-center bg-[var(--color-neutral-base)] text-[#171717] w-full">
      <div className="w-full bg-white flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Sidebar Tracker */}
        <aside className="hidden md:flex w-80 border-r border-neutral-200 bg-white p-6 flex-col shrink-0 overflow-y-auto">
          <div className="mb-10">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-6">Test Progression</h2>
            <div className="space-y-3.5">
              {availableSections.map((sec, idx) => {
                const isActive = idx === secIdx;
                const isCompleted = idx < secIdx;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      cleanupTimers();
                      stopRecording();
                      // Auto save any text if current phase is writing
                      if (phase === 'writing' && currentText.trim()) {
                        setResults(prev => {
                          const base = prev.filter(r => r.questionId !== currentQuestion.id);
                          return [...base, {
                            questionId: currentQuestion.id,
                            text: currentText,
                            skipped: false
                          }];
                        });
                      }
                      setCurrentText('');
                      setSecIdx(idx);
                      setQIdx(0);
                      setShowSectionIntro(true);
                      setPhase('buffer');
                    }}
                    className={`flex items-center gap-3 w-full text-left transition-all hover:translate-x-1 duration-150 ${isCompleted ? 'opacity-50' : idx > secIdx ? 'text-neutral-400' : ''}`}
                  >
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-none shrink-0 ${isActive ? 'bg-black text-white font-black' : 'text-neutral-400 border border-neutral-200 bg-neutral-50'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-xs tracking-tight ${isActive ? 'font-bold text-black border-b border-black pb-0.5' : 'font-medium'}`}>
                      {sec.title.replace('Part ', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-neutral-100 shrink-0">
             <div className="flex items-center gap-2 text-neutral-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] uppercase tracking-widest font-bold font-sans">Secure Sandbox</span>
             </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col relative overflow-hidden h-full">
          
          {/* Custom Section Instruction Screen Overlay */}
          {showSectionIntro ? (
            <div className="flex-1 flex flex-col justify-between bg-white p-10 md:p-14 overflow-y-auto">
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-6 mb-8">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-neutral-400">Versant Practice Framework</span>
                <span className="px-2 py-0.5 bg-neutral-900 text-white font-mono text-[9px] font-bold uppercase tracking-widest">
                  {currentSection.itemCountText || 'Section Input'}
                </span>
              </div>

              {/* Main Content Info */}
              <div className="max-w-xl mx-auto flex-1 flex flex-col justify-center text-left py-4">
                <h1 className="text-3xl md:text-4xl font-serif italic tracking-tight text-neutral-900 mb-6 border-b border-neutral-200 pb-4">
                  {currentSection.title}
                </h1>
                
                <p className="text-neutral-600 text-sm leading-relaxed mb-10 font-sans">
                  {currentSection.instructionText}
                </p>

                {currentSection.skillsTested && (
                  <div className="bg-neutral-50 border border-neutral-200 p-6 flex gap-4 items-start mb-8">
                    <Award className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1 text-black">Skills Evaluated</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                        {currentSection.skillsTested}
                      </p>
                    </div>
                  </div>
                )}

                {/* Interactive Demo Section */}
                <div className="border border-neutral-200 bg-neutral-50/50 p-6 rounded-md mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Interactive Section Demo
                  </h4>
                  <p className="text-xs text-neutral-500 mb-4 leading-relaxed font-sans">
                    Watch or listen to a simulated question item to understand how the audio, visual indicators, and response window behave in this section.
                  </p>
                  
                  {demoState === 'idle' ? (
                    <button
                      onClick={startDemo}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-900 hover:bg-black hover:text-white text-black text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-sans"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Section Demo</span>
                    </button>
                  ) : (
                    <div className="bg-white border border-neutral-200 rounded p-4 space-y-4">
                      {/* Step Status */}
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">Demo Progress</span>
                        <span className="text-[9px] font-bold bg-neutral-100 px-2 py-0.5 uppercase tracking-wider text-neutral-800 rounded font-mono">
                          {demoState === 'playing-prompt' && "🔊 Playing Prompt"}
                          {demoState === 'beeping' && "🔔 Beep Signal"}
                          {demoState === 'response' && "⏳ Simulating Response"}
                          {demoState === 'completed' && "✅ Demo Complete"}
                        </span>
                      </div>

                      {/* Demo Display Screen */}
                      <div className="min-h-[100px] flex flex-col items-center justify-center text-center p-4 bg-neutral-50 border border-neutral-100 rounded">
                        {demoState === 'playing-prompt' && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">PROMPT PHASE</p>
                            {SECTION_DEMOS[currentSection.id]?.promptDisplayText ? (
                              <p className="text-sm font-serif italic text-black font-semibold">
                                "{SECTION_DEMOS[currentSection.id].promptDisplayText}"
                              </p>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <p className="text-sm font-serif italic text-neutral-500 font-semibold">🔊 Audio playing... (text hidden)</p>
                                <div className="flex items-center gap-1 mt-1 justify-center">
                                  <span className="w-1.5 h-4 bg-neutral-400 animate-pulse rounded-full"></span>
                                  <span className="w-1.5 h-6 bg-neutral-600 animate-pulse delay-75 rounded-full"></span>
                                  <span className="w-1.5 h-3 bg-neutral-500 animate-pulse delay-150 rounded-full"></span>
                                  <span className="w-1.5 h-5 bg-neutral-600 animate-pulse delay-200 rounded-full"></span>
                                  <span className="w-1.5 h-2 bg-neutral-400 animate-pulse delay-300 rounded-full"></span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {demoState === 'beeping' && (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest animate-pulse font-mono">🔔 BEEP!</span>
                            <p className="text-xs text-neutral-500 mt-1 font-sans">Speaker plays a tone indicating response window is active.</p>
                          </div>
                        )}

                        {demoState === 'response' && (
                          <div className="w-full max-w-md space-y-3">
                            <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">RESPONSE PHASE</p>
                            {SECTION_DEMOS[currentSection.id]?.responseType === 'speaking' ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-red-600 text-[9px] font-bold uppercase tracking-widest animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                  Simulated Speak Active
                                </div>
                                <p className="text-sm font-serif italic text-neutral-800 font-semibold mt-1">
                                  "{SECTION_DEMOS[currentSection.id].responseDemoText}"
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2 text-left">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Simulated Typing:</p>
                                <input
                                  readOnly
                                  type="text"
                                  className="w-full px-3 py-2 border border-neutral-300 bg-white text-xs font-mono rounded focus:outline-none"
                                  value={demoTypedResponse}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {demoState === 'completed' && (
                          <div className="space-y-2">
                            <p className="text-xs text-neutral-700 font-bold font-sans">Ready to start the section!</p>
                            <p className="text-[10px] text-neutral-400 leading-relaxed max-w-xs mx-auto font-sans">
                              {SECTION_DEMOS[currentSection.id]?.explanation}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Demo Controls */}
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={cancelDemo}
                          className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-black text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer font-sans"
                        >
                          Cancel Demo
                        </button>
                        
                        {demoState === 'completed' && (
                          <button
                            onClick={startDemo}
                            className="px-3 py-1.5 bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-widest transition-all hover:bg-black cursor-pointer animate-fade-in font-sans"
                          >
                            Play Again
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="border-t border-neutral-100 pt-6 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                  Total Questions in Section: <span className="text-black font-semibold font-mono">{currentSection.questions.length}</span>
                </p>
                <button
                  onClick={() => setShowSectionIntro(false)}
                  className="flex items-center gap-3 px-8 py-4 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all font-sans"
                >
                  <span>Begin Section</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-8 shrink-0">
                 <div className="flex items-center gap-6">
                    <span className="font-bold tracking-tight text-xl">VERSANT <span className="font-light opacity-50">MOCK</span></span>
                    {phase === 'recording' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#171717]">Recording Active</span>
                      </div>
                    )}
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Time Left</p>
                   <p className="text-sm font-mono font-bold">
                     {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                   </p>
                 </div>
              </header>

              {/* Content Area */}
              <div className="flex-1 p-10 flex flex-col items-center justify-center relative bg-white text-center">
                <div className="absolute top-8 left-8 text-left">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-300">
                    Item {String(qIdx + 1).padStart(2, '0')} of {String(currentSection.questions.length).padStart(2, '0')}
                  </span>
                </div>
              
                {phase === 'buffer' && (
                  <div className="text-center">
                    <h2 className="text-3xl font-serif italic mb-2 tracking-tight block">Preparing next item...</h2>
                    <div className="w-8 h-px bg-neutral-200 mx-auto mt-6 mb-4"></div>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">Please Wait</p>
                  </div>
                )}

                {phase === 'playing' && (
                   <div className="text-center">
                      <h2 className="text-3xl font-serif italic mb-2 tracking-tight">Listen carefully</h2>
                      <div className="flex items-center gap-1.5 mt-8 justify-center h-16">
                        <span className="w-1 h-6 bg-black rounded-full sound-wave-bar-1 origin-bottom"></span>
                        <span className="w-1 h-12 bg-black rounded-full sound-wave-bar-2 origin-bottom"></span>
                        <span className="w-1 h-16 bg-black rounded-full sound-wave-bar-3 origin-bottom"></span>
                        <span className="w-1 h-8 bg-black rounded-full sound-wave-bar-4 origin-bottom"></span>
                        <span className="w-1 h-14 bg-black rounded-full sound-wave-bar-5 origin-bottom"></span>
                      </div>
                      {currentQuestion.displayPrompt && (
                        <p className="mt-8 text-2xl font-serif text-[#171717] leading-relaxed max-w-xl mx-auto break-words px-8">
                          {currentQuestion.promptText.split('________').map((part, i, arr) => 
                            i === arr.length - 1 ? part : <span key={i}>{part}<span className="inline-block w-24 border-b border-black mx-2 translate-y-1"></span></span>
                          )}
                        </p>
                      )}
                   </div>
                )}

                {phase === 'preparing' && (
                  <div className="text-center w-full max-w-2xl px-8">
                    <p className="text-[10px] font-bold tracking-[0.3em] text-[#171717] uppercase mb-8">Memorize this text</p>
                    <div className="border-l border-neutral-200 pl-8 text-left text-2xl font-serif text-[#171717] leading-relaxed italic">
                      {currentQuestion.promptText}
                    </div>
                  </div>
                )}

                {phase === 'recording' && (
                  <div className="text-center flex flex-col items-center max-w-2xl mx-auto px-4">
                    {currentQuestion.displayPrompt && (
                      <div className="mb-8 p-6 bg-neutral-50 border border-neutral-200 rounded text-left text-xl font-serif text-[#171717] leading-relaxed italic select-none shadow-2xs">
                        {currentQuestion.promptText}
                      </div>
                    )}
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 relative">
                       {/* Radiating pulse waves */}
                       <div className="absolute inset-0 border-2 border-red-500 rounded-full mic-pulse-ring-1"></div>
                       <div className="absolute inset-0 border-2 border-red-400 rounded-full mic-pulse-ring-2"></div>
                       <div className="absolute inset-0 border-2 border-red-300 rounded-full mic-pulse-ring-3"></div>
                       {/* Center Mic icon and background */}
                       <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center relative z-10 shadow-lg shadow-red-200">
                          <Mic className="w-6 h-6 text-white animate-pulse" />
                       </div>
                    </div>
                    <h2 className="text-4xl font-serif italic mb-4 tracking-tight text-red-650 animate-pulse">"Speak now"</h2>
                    <p className="text-neutral-400 text-xs uppercase tracking-widest font-bold mb-6">Recording in progress</p>
                    
                    <button 
                      onClick={() => handleRecordingComplete(false)}
                      className="px-6 py-3 border border-neutral-900 bg-white hover:bg-neutral-950 hover:text-white text-neutral-950 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Next Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {phase === 'writing' && (
                  <div className="w-full max-w-2xl flex flex-col items-center px-4">
                     <h2 className="text-lg font-serif italic text-[#171717] mb-8">{currentSection.instructionText}</h2>
                     
                     {currentQuestion.type === 'writing' && currentQuestion.displayPrompt && (
                       <p className="mb-10 text-2xl text-[#171717] font-serif leading-relaxed">
                          {currentQuestion.promptText.split('________')[0]}
                          <input 
                            autoFocus
                            type="text"
                            className="mx-2 w-40 border-b border-neutral-300 focus:border-black outline-none text-center bg-transparent font-sans text-xl translate-y-1"
                            value={currentText}
                            onChange={e => setCurrentText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleWritingComplete() }}
                          />
                          {currentQuestion.promptText.split('________')[1]}
                       </p>
                     )}

                     {(currentQuestion.type === 'dictation' || currentQuestion.type === 'reading-writing') && (
                       <textarea
                         autoFocus
                         className="w-full h-48 p-6 border border-neutral-200 bg-[var(--color-neutral-base)] focus:border-black focus:outline-none resize-none text-lg font-serif"
                         placeholder="Type your response here..."
                         value={currentText}
                         onChange={e => setCurrentText(e.target.value)}
                       />
                     )}
                     
                     <button 
                       onClick={handleWritingComplete}
                       className="mt-8 px-8 py-4 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all font-sans flex items-center gap-3"
                     >
                       <span>Confirm Response</span>
                       <CheckCircle className="w-4 h-4" />
                     </button>
                  </div>
                )}
              </div>

              {/* Footer instructions */}
              <footer className="h-16 bg-[#FAFAFA] border-t border-neutral-200 px-8 flex items-center justify-between shrink-0 font-sans">
                 <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                   <span>Input: {phase === 'recording' ? 'Mic' : phase === 'writing' ? 'Keyboard' : 'None'}</span>
                 </div>
                 {(phase === 'recording' || phase === 'writing') && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#171717] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
                      Active Item
                    </p>
                 )}
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
