import { useState, useEffect } from 'react';
import { TestStatus, TestResult, Attempt } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TestEngine from './components/TestEngine';
import Results from './components/Results';
import { generateAiRating } from './utils/scoring';

const INITIAL_ATTEMPT: Attempt = {
  id: 'attempt-1',
  date: '26 May 2026',
  tin: '28842427',
  overallScore: 64,
  speaking: 58,
  listening: 73,
  reading: 62,
  writing: 62,
  responses: [
    {
      questionId: 'a-1',
      sectionId: 'part-a',
      sectionTitle: 'Part A: Read Aloud',
      promptText: 'The local museum is offering free admission this weekend. Visitors can explore a large collection of historical paintings, sculptures, and interactive science displays designed for all ages.',
      userResponse: 'The local museum is offering free admission this weekend. Visitors can explore some historical pictures...',
      aiScore: 78,
      evaluationNote: 'Clear oral fluency. Word boundaries matched displaying high articulation values.'
    }
  ]
};

export default function App() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [viewingAttempt, setViewingAttempt] = useState<Attempt | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('versant_auth') === 'true';
  });
  const [status, setStatus] = useState<TestStatus>(() => {
    return sessionStorage.getItem('versant_auth') === 'true' ? 'dashboard' : 'login';
  });

  // Initialize attempts from localStorage or default list
  useEffect(() => {
    const saved = localStorage.getItem('versant_attempts');
    if (saved) {
      try {
        setAttempts(JSON.parse(saved));
      } catch (e) {
        setAttempts([INITIAL_ATTEMPT]);
      }
    } else {
      setAttempts([INITIAL_ATTEMPT]);
      localStorage.setItem('versant_attempts', JSON.stringify([INITIAL_ATTEMPT]));
    }
  }, []);

  // Synchronize App state from the URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#login';
      
      if (!isAuthenticated) {
        if (hash !== '#login') {
          window.location.hash = '#login';
        }
        setStatus('login');
        setViewingAttempt(null);
        return;
      }

      if (hash.startsWith('#login')) {
        window.location.hash = '#dashboard';
      } else if (hash.startsWith('#dashboard')) {
        setStatus('dashboard');
        setViewingAttempt(null);
        setTargetSectionId(undefined);
        const params = new URLSearchParams(hash.substring(hash.indexOf('?') !== -1 ? hash.indexOf('?') : hash.length));
        const diff = params.get('difficulty') as 'easy' | 'medium' | 'hard';
        if (diff) {
          setDifficulty(diff);
        }
      } else if (hash.startsWith('#test')) {
        setStatus('testing');
        setViewingAttempt(null);
        const params = new URLSearchParams(hash.substring(hash.indexOf('?') !== -1 ? hash.indexOf('?') : hash.length));
        const section = params.get('section');
        const diff = params.get('difficulty') as 'easy' | 'medium' | 'hard';
        setTargetSectionId(section || undefined);
        if (diff) {
          setDifficulty(diff);
        }
      } else if (hash.startsWith('#results')) {
        setStatus('completed');
        const params = new URLSearchParams(hash.substring(hash.indexOf('?') !== -1 ? hash.indexOf('?') : hash.length));
        const attemptId = params.get('attemptId');
        if (attemptId) {
          const found = attempts.find(a => a.id === attemptId);
          if (found) {
            setViewingAttempt(found);
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial sync
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [attempts, isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('versant_auth', 'true');
    window.location.hash = '#dashboard';
  };

  const handleDifficultyChange = (diff: 'easy' | 'medium' | 'hard') => {
    setDifficulty(diff);
    window.location.hash = `#dashboard?difficulty=${diff}`;
  };

  const handleStartExam = (sectionId?: string) => {
    const hash = sectionId 
      ? `#test?section=${sectionId}&difficulty=${difficulty}` 
      : `#test?difficulty=${difficulty}`;
    window.location.hash = hash;
  };

  const handleComplete = async (finalResults: TestResult[]) => {
    // First, map the blobs to base64
    const resultsWithBase64 = await Promise.all(finalResults.map(async (r) => {
      if (r.blob) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(r.blob!);
        });
        return { ...r, audioBlobBase64: base64 };
      }
      return r;
    }));

    // Determine user score based on percentage of non-skipped items
    const aiReport = generateAiRating(resultsWithBase64);

    // Create unique TIN number
    const tinNumber = String(Math.floor(10000000 + Math.random() * 90000000));
    const today = new Date().toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newAttempt: Attempt = {
      id: `attempt-${Date.now()}`,
      date: today,
      tin: tinNumber,
      overallScore: aiReport.overallScore,
      speaking: aiReport.speaking,
      listening: aiReport.listening,
      reading: aiReport.reading,
      writing: aiReport.writing,
      isPartJPractice: targetSectionId === 'part-j',
      responses: aiReport.responses
    };

    const updatedAttempts = [newAttempt, ...attempts];
    setAttempts(updatedAttempts);
    localStorage.setItem('versant_attempts', JSON.stringify(updatedAttempts));

    setViewingAttempt(newAttempt);
    setStatus('completed');
    window.location.hash = `#results?attemptId=${newAttempt.id}`;
    
    // Log results payload for potential whisper/LLM backend processing
    console.log("=== EXAM SUBMITTED TO BACKEND PROXIES ===");
    console.log("Generated Scorecard:", newAttempt);
    console.log("Raw user response blobs & text tokens:", finalResults);
  };

  const handleBackToDashboard = () => {
    window.location.hash = '#dashboard';
  };

  return (
    <div className="h-screen bg-[var(--color-neutral-base)] text-[#171717] font-sans selection:bg-neutral-200 flex flex-col justify-between overflow-hidden">
      <div className={`flex-1 flex flex-col min-h-0 ${status === 'testing' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {/* If the user is currently viewing a specific attempt scorecard */}
        {viewingAttempt ? (
          <Results attempt={viewingAttempt} onBack={handleBackToDashboard} onNavigateToDiagnostics={() => handleStartExam('part-j')} />
        ) : (
          <>
            {status === 'login' && <Login onLogin={handleLogin} />}
            
            {status === 'dashboard' && (
              <Dashboard 
                onStart={() => handleStartExam(undefined)} 
                onStartDiagnostic={() => handleStartExam('part-j')}
                attempts={attempts}
                onViewAttempt={(att) => setViewingAttempt(att)}
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
              />
            )}
            
            {status === 'testing' && <TestEngine onComplete={handleComplete} targetSectionId={targetSectionId} difficulty={difficulty} />}
            
            {status === 'completed' && (
              <Results onBack={handleBackToDashboard} onNavigateToDiagnostics={() => handleStartExam('part-j')} />
            )}
          </>
        )}
      </div>

      {/* Global persistent Footer on EVERY page */}
      <footer className="py-4 border-t border-neutral-200 bg-[#FAFAFA] text-center text-xs shrink-0 z-50">
        <a
          href="https://adityavn.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-bold tracking-widest text-neutral-600 hover:text-black transition-colors"
        >
          ║▌║█║ FORGED 𝖡𝖸 ADITYA ║█║▌║
        </a>
      </footer>
    </div>
  );
}
