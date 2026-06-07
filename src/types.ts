export type TestStatus = 'login' | 'dashboard' | 'testing' | 'completed';

export type QuestionPhase = 'instruction' | 'buffer' | 'playing' | 'preparing' | 'recording' | 'writing';

export type QuestionType = 'speaking' | 'writing' | 'reading-writing' | 'dictation';

export interface Question {
  id: string;
  type: QuestionType;
  promptText: string;     // Text for TTS, display, or dictation
  scenarioText?: string;  // Extra context read before the question
  displayPrompt?: boolean;// Whether to show the text to the user
  timeLimit: number;      // Seconds allowed for recording/writing
  preparationTime?: number; // Seconds allowed for reading before writing
}

export interface Section {
  id: string;
  title: string;
  instructionText: string;
  skillsTested?: string;
  itemCountText?: string;
  questions: Question[];
}

export interface ExamData {
  modules: {
    id: string;
    title: string;
    sections: Section[];
  }[];
}

export interface TestResult {
  questionId: string;
  blob?: Blob;
  text?: string;
  skipped?: boolean;
  audioBlobBase64?: string;
}

export interface AttemptResponse {
  questionId: string;
  sectionId: string;
  sectionTitle: string;
  promptText: string;
  userResponse: string; // text transcript or placeholder like "Recorded Voice Sample"
  aiScore: number;       // calculated similarity range 10-90
  evaluationNote: string; // smart feedback sentence
  audioBlobBase64?: string;
}

export interface Attempt {
  id: string;
  date: string;
  tin: string;
  overallScore: number;
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
  isPartJPractice?: boolean;
  responses?: AttemptResponse[];
}


