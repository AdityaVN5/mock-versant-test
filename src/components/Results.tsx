import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Attempt } from '../types';
import { ArrowLeft, CheckCircle2, Play, AudioLines, Flame, Lightbulb, ClipboardCopy } from 'lucide-react';

interface ResultsProps {
  attempt?: Attempt;
  onBack?: () => void;
  onNavigateToDiagnostics?: () => void;
}

function getVersant(gse: number): number {
  return Math.min(80, Math.max(20, gse - 3));
}

function getCEFR(gse: number): string {
  if (gse < 22) return '<A1';
  if (gse < 30) return 'A1';
  if (gse < 36) return 'A2';
  if (gse < 43) return 'A2+';
  if (gse < 51) return 'B1';
  if (gse < 59) return 'B1+';
  if (gse < 67) return 'B2';
  if (gse < 76) return 'B2+';
  if (gse < 85) return 'C1';
  return 'C2';
}

export default function Results({ attempt, onBack, onNavigateToDiagnostics }: ResultsProps) {
  // Let's use the provided attempt or fallback to the standard mock attempt
  const score = attempt || {
    id: 'default',
    date: '26 May 2026',
    tin: '28842427',
    overallScore: 64,
    speaking: 58,
    listening: 73,
    reading: 62,
    writing: 62,
    isPartJPractice: false,
    responses: []
  };

  const chartData = [
    { name: 'Listening', score: score.listening, fill: '#171717' },
    { name: 'Overall', score: score.overallScore, fill: '#737373' },
    { name: 'Reading', score: score.reading, fill: '#171717' },
    { name: 'Writing', score: score.writing, fill: '#171717' },
    { name: 'Speaking', score: score.speaking, fill: '#171717' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-neutral-base)] flex flex-col justify-start text-[#171717] w-full">
      <div className="w-full bg-white border-x border-neutral-200 min-h-screen">
        
        {/* Navigation Bar if onBack is provided */}
        {onBack && (
          <div className="border-b border-neutral-200 px-8 py-4 bg-[#FAFAFA] flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#171717] hover:opacity-75 transition-opacity py-1 px-3 border border-neutral-200 bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}

        {/* Header */}
        <header className="border-b border-neutral-200 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-6">Versant 4 Skills Essential Test</h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-3xl font-sans">
            Versant scores are aligned to the Global Scale of English (GSE). The GSE runs from 10 to 90, with clear statements of what a learner can achieve at any point on the scale.
          </p>
        </header>

        {/* Dynamic Items Response Analysis Report Card */}
        {score.responses && score.responses.length > 0 && (
          <div className="p-8 md:p-12 border-b border-neutral-200 bg-[#FAFAFA]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-neutral-200 pb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#171717] bg-neutral-200 px-2 py-1">AI Evaluator</span>
                <h3 className="text-2xl font-serif italic tracking-tight mt-2 text-neutral-900">Consolidated Item-by-Item AI Feedback</h3>
              </div>
              <p className="text-xs text-neutral-500 max-w-sm">
                Each response was evaluated by our simulated speech calibration and syntactic matching rating rules.
              </p>
            </div>

            <div className="space-y-6">
              {score.responses.map((item, index) => {
                const isDiagnostic = item.promptText.toLowerCase().includes("high-quality audio") || 
                  item.promptText.toLowerCase().includes("position your microphone") ||
                  item.promptText.toLowerCase().includes("sound articulation") ||
                  item.promptText.toLowerCase().includes("speech algorithm") ||
                  item.promptText.toLowerCase().includes("tutor feedback");

                return (
                  <div 
                    key={index} 
                    className="bg-white border border-neutral-200 p-6 hover:border-black transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-neutral-400">
                            {item.sectionTitle}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-black mt-1 font-mono">Question ID: {item.questionId}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">AI Match Rating:</span>
                        <span className="px-2 py-1 border border-neutral-200 font-mono text-xs font-extrabold text-neutral-900 bg-white">
                          {item.aiScore}/90
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed">
                      <div className={`space-y-2 rounded transition-all ${
                        isDiagnostic ? 'p-3 bg-amber-50/40 border border-amber-200/70 shadow-2xs' : ''
                      }`}>
                        <p className={`uppercase tracking-widest text-[9px] font-bold ${
                          isDiagnostic ? 'text-amber-800' : 'text-neutral-400'
                        }`}>
                          Original Prompt Context {isDiagnostic && "⚡"}
                        </p>
                        <blockquote className={`pl-3 italic font-serif py-1 rounded-r border-l-2 ${
                          isDiagnostic 
                            ? 'border-amber-500 text-amber-950 bg-amber-50/70' 
                            : 'border-neutral-300 text-neutral-600'
                        }`}>
                          "{item.promptText}"
                        </blockquote>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="uppercase tracking-widest text-[9px] font-bold text-neutral-400">Your Recorded Response</p>
                        <div className="bg-neutral-50 border border-neutral-200 p-3 italic font-semibold text-neutral-800 rounded">
                          {item.userResponse}
                        </div>
                        {item.audioBlobBase64 && (
                          <div className="mt-3">
                            <audio src={item.audioBlobBase64} controls className="w-full h-8 outline-none" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-start gap-2 text-xs bg-stone-50 p-3 rounded">
                      <Lightbulb className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-900 block text-[9px] uppercase tracking-wider mb-1">AI Diagnostic Note</span>
                        <p className="text-stone-700 leading-relaxed font-sans">{item.evaluationNote}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Stats Section */}
        <div className="flex flex-col lg:flex-row border-b border-neutral-200">
          
          {/* Overall Score */}
          <div className="lg:w-1/3 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col justify-center">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 mb-6">Overall GSE Score</h2>
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-7xl font-serif italic tracking-tight">{score.overallScore}</span>
              <span className="text-sm font-bold uppercase tracking-widest text-[#171717] px-2 py-1 border border-neutral-200">
                CEFR: {score.overallScore >= 76 ? 'C1' : score.overallScore >= 59 ? 'B2' : score.overallScore >= 43 ? 'B1' : 'A2'}
              </span>
            </div>
            <div className="w-full h-1 bg-neutral-100 my-6 relative rounded-full overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-black" style={{ width: `${(score.overallScore / 90) * 100}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 font-bold mb-6">
              <span>10</span>
              <span>90</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Candidate easily handles a wide variety of discourse and speaking styles, and can contribute to a native-paced discussion. Speech is generally fluent, smooth and intelligible. Candidate controls appropriate language structures for speaking about complex material. Candidate understands texts from a wide variety of written genres, and can produce texts for most purposes. Writing is usually effective and clear.
            </p>
          </div>

          {/* Skill Breakdown */}
          <div className="lg:w-2/3 flex flex-col">
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200">
              <div className="p-8 border-r border-b md:border-b-0 border-neutral-200 text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2">Speaking</p>
                <p className="text-3xl font-serif italic">{score.speaking}</p>
              </div>
              <div className="p-8 border-r border-b md:border-b-0 border-neutral-200 text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2">Listening</p>
                <p className="text-3xl font-serif italic">{score.listening}</p>
              </div>
              <div className="p-8 border-r border-neutral-200 text-center flex-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2">Reading</p>
                <p className="text-3xl font-serif italic">{score.reading}</p>
              </div>
              <div className="p-8 text-center flex-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2">Writing</p>
                <p className="text-3xl font-serif italic">{score.writing}</p>
              </div>
            </div>

            {/* Scale Chart visually */}
            <div className="flex-1 p-8 flex flex-col justify-center bg-[#FAFAFA]">
               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                      <XAxis type="number" domain={[10, 90]} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 'bold', fill: '#737373' }} width={80} />
                      <Bar dataKey="score" barSize={12} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#171717', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="flex flex-col md:flex-row border-b border-neutral-200 text-xs">
          <div className="w-full p-6 flex justify-between items-center bg-[var(--color-neutral-base)]">
            <span className="uppercase font-bold tracking-widest text-neutral-400 text-[10px]">Test Completion Date (GMT)</span>
            <span className="font-mono font-bold">{score.date}</span>
          </div>
        </div>

        <div className="p-8 md:p-12 border-b border-neutral-200 bg-white">
           <h3 className="text-2xl font-serif italic tracking-tight mb-6">Understanding the Skills</h3>
           <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed text-neutral-600">
             <div>
               <h4 className="font-bold text-black mb-2 uppercase tracking-widest text-[10px]">Overall Score</h4>
               <p>The Overall score of the test represents the ability to understand spoken and written English and respond appropriately in speaking and writing on everyday and workplace topics, at an appropriate pace and in intelligible English. Scores are based on a weighted combination of the four skill scores.</p>
             </div>
             <div>
               <h4 className="font-bold text-black mb-2 uppercase tracking-widest text-[10px]">GSE</h4>
               <p className="mb-4">The Global Scale of English (GSE) is a standardized, granular scale from 10 to 90, which measures English language proficiency. Visit English.com/gse to learn more.</p>
               <p className="font-mono font-bold text-black text-xs">GSE {score.overallScore}/90 is equivalent to Versant {getVersant(score.overallScore)}/80</p>
             </div>
           </div>
        </div>

        {/* Current Capabilities in Detail */}
        <div className="p-8 md:p-12">
          <h3 className="text-2xl font-serif italic tracking-tight mb-8">Current Capabilities in Detail</h3>
          
          <div className="space-y-12">
            
            {/* Speaking */}
            <div className="border-l border-neutral-200 pl-6">
              <div className="flex flex-wrap items-baseline gap-4 mb-4">
                <h4 className="text-lg font-bold">Speaking</h4>
                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  <span>GSE: <strong className="text-black">{score.speaking}/90</strong></span>
                  <span>Versant: <strong className="text-black">{getVersant(score.speaking)}/80</strong></span>
                  <span className="px-2 py-0.5 border border-neutral-200 text-black">CEFR: {getCEFR(score.speaking)}</span>
                </div>
              </div>
              <p className="text-sm text-[#171717] leading-relaxed mb-6">
                Candidate produces some simple and meaningful sentences. Candidate speaks with adequate rhythm but some sections are uneven. Many words are produced clearly, but some sounds are mispronounced.
              </p>
              <div className="bg-neutral-50 p-6 mb-6">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 mb-3">Tips to improve:</h5>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                  <li>Practice explaining your opinion on a topic with supporting details.</li>
                  <li>Practice discussing the main points of news stories about familiar topics with classmates or friends.</li>
                </ul>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed border-t border-neutral-100 pt-4">
                <strong className="text-black">Speaking</strong> reflects the ability to produce intelligible communication in everyday and workplace situations. The score is based on the ability to produce consonants, vowels, and stress in a native-like manner, use accurate syntax, and use appropriate rhythm, phrasing, and timing.
              </p>
            </div>

            {/* Listening */}
            <div className="border-l border-neutral-200 pl-6">
              <div className="flex flex-wrap items-baseline gap-4 mb-4">
                <h4 className="text-lg font-bold">Listening</h4>
                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  <span>GSE: <strong className="text-black">{score.listening}/90</strong></span>
                  <span>Versant: <strong className="text-black">{getVersant(score.listening)}/80</strong></span>
                  <span className="px-2 py-0.5 border border-neutral-200 text-black">CEFR: {getCEFR(score.listening)}</span>
                </div>
              </div>
              <p className="text-sm text-[#171717] leading-relaxed mb-6">
                Candidate follows much of what is said around him/her on general topics provided speech is clear, although occasionally information is lost.
              </p>
              <div className="bg-neutral-50 p-6 mb-6">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 mb-3">Tips to improve:</h5>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                  <li>Practice listening to complex podcasts and extracting the key points and important details.</li>
                  <li>Practice listening to TV news reports and current affairs programs and identifying the key information.</li>
                </ul>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed border-t border-neutral-100 pt-4">
                <strong className="text-black">Listening</strong> reflects the ability to understand specific details and main ideas from everyday and workplace speech. The score is based on the ability to track meaning and infer the message from English that is spoken at a conversational pace.
              </p>
            </div>

            {/* Reading */}
            <div className="border-l border-neutral-200 pl-6">
              <div className="flex flex-wrap items-baseline gap-4 mb-4">
                <h4 className="text-lg font-bold">Reading</h4>
                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  <span>GSE: <strong className="text-black">{score.reading}/90</strong></span>
                  <span>Versant: <strong className="text-black">{getVersant(score.reading)}/80</strong></span>
                  <span className="px-2 py-0.5 border border-neutral-200 text-black">CEFR: {getCEFR(score.reading)}</span>
                </div>
              </div>
              <p className="text-sm text-[#171717] leading-relaxed mb-6">
                Candidate reads, understands, and responds to texts on everyday and workplace topics at a moderate pace. In more complex texts, specific details will be lost.
              </p>
              <div className="bg-neutral-50 p-6 mb-6">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 mb-3">Tips to improve:</h5>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                  <li>Practice using an English dictionary to check the meaning of words, rather than a bilingual dictionary.</li>
                  <li>Practice reading and following the exchanges on a discussion board of a website.</li>
                </ul>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed border-t border-neutral-100 pt-4">
                <strong className="text-black">Reading</strong> reflects the ability to understand written English texts on everyday and workplace topics. The score is based on the ability to operate at functional speeds to extract details and main ideas, infer the message, and construct meaning.
              </p>
            </div>

            {/* Writing */}
            <div className="border-l border-neutral-200 pl-6">
              <div className="flex flex-wrap items-baseline gap-4 mb-4">
                <h4 className="text-lg font-bold">Writing</h4>
                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  <span>GSE: <strong className="text-black">{score.writing}/90</strong></span>
                  <span>Versant: <strong className="text-black">{getVersant(score.writing)}/80</strong></span>
                  <span className="px-2 py-0.5 border border-neutral-200 text-black">CEFR: {getCEFR(score.writing)}</span>
                </div>
              </div>
              <p className="text-sm text-[#171717] leading-relaxed mb-6">
                Candidate writes clear, connected texts on a variety of subjects using a sufficient range of grammatical structures and a good range of common English words.
              </p>
              <div className="bg-neutral-50 p-6 mb-6">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 mb-3">Tips to improve:</h5>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                  <li>Practice writing detailed descriptions of people and places that you know.</li>
                  <li>Practice writing advice that you would give to a friend, including reasons.</li>
                </ul>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed border-t border-neutral-100 pt-4">
                <strong className="text-black">Writing</strong> reflects the ability to produce accurate and appropriate written responses at a functional pace on everyday and workplace topics. The score is based on the ability to present information in a logical sequence, use a wide range of appropriate words, and a variety of sentence structures.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
