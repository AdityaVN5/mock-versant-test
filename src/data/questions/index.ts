import { ExamData, Section } from '../../types';
import { PART_A_QUESTIONS } from './part-a';
import { PART_B_QUESTIONS } from './part-b';
import { PART_C_QUESTIONS } from './part-c';
import { PART_D_QUESTIONS } from './part-d';
import { PART_E_QUESTIONS } from './part-e';
import { PART_F_QUESTIONS } from './part-f';
import { PART_G_QUESTIONS } from './part-g';
import { PART_H_QUESTIONS } from './part-h';
import { PART_I_QUESTIONS } from './part-i';
import { PART_J_QUESTIONS } from './part-j';

function sampleRandom<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export const MASTER_SECTIONS_POOL: Section[] = [
  {
    id: "part-a",
    title: "Part A: Read Aloud",
    instructionText: "Read the passage aloud smoothly and naturally in a clear voice. You will be stopped after 30 seconds. This is not a speed reading test. You may not be able to finish reading the entire passage, but that is okay. When your time is up, you will automatically move on to the next item.",
    itemCountText: "8 Questions",
    skillsTested: "Reading comprehension, pronunciation, word stress, and oral fluency.",
    questions: PART_A_QUESTIONS
  },
  {
    id: "part-b",
    title: "Part B: Repeat",
    instructionText: "Repeat each sentence exactly as you hear it.",
    itemCountText: "16 Questions",
    skillsTested: "Sentence structures, vocabulary recall, pronunciation, and accent tracking.",
    questions: PART_B_QUESTIONS
  },
  {
    id: "part-c",
    title: "Part C: Sentence Builds",
    instructionText: "Listen to three or four jumbled phrases and say them back as a single, grammatically correct sentence.",
    itemCountText: "10 Questions",
    skillsTested: "Syntactic structure, syntax memory, logic, and lexical organization.",
    questions: PART_C_QUESTIONS
  },
  {
    id: "part-d",
    title: "Part D: Conversations",
    instructionText: "Listen to 2 people have a short conversation. Then, answer a question about the conversation with a few words or a short phrase.",
    itemCountText: "6 Questions",
    skillsTested: "Active audio tracking, semantic inference, and prompt verbalization.",
    questions: PART_D_QUESTIONS
  },
  {
    id: "part-e",
    title: "Part E: Typing",
    instructionText: "Exotic characters or typing speeds are measured key-by-key. Copy the paragraph displayed below exactly. Typing speed and accuracy will be assessed.",
    itemCountText: "1 Question",
    skillsTested: "Typing speed, spelling accuracy, motor skill coordination, and visual tracking.",
    questions: PART_E_QUESTIONS
  },
  {
    id: "part-f",
    title: "Part F: Sentence Completion",
    instructionText: "Read a sentence that has one missing word. Type the single word that best fits the blank.",
    itemCountText: "12 Questions",
    skillsTested: "Reading comprehension, lexicography, syntax, and vocabulary placement.",
    questions: PART_F_QUESTIONS
  },
  {
    id: "part-g",
    title: "Part G: Dictation",
    instructionText: "You will hear a sentence. Type exactly what you hear. Speed and accurate spelling are important.",
    itemCountText: "10 Questions",
    skillsTested: "Sound-to-grapheme decoding, auditory retention, orthography, and active syntax parsing.",
    questions: PART_G_QUESTIONS
  },
  {
    id: "part-h",
    title: "Part H: Passage Reconstruction",
    instructionText: "Read a short paragraph for exactly 30 seconds. The text disappears, and you have 90 seconds to type and reconstruct it with as many details as possible.",
    itemCountText: "1 Question",
    skillsTested: "Syntactic structure, vocabulary, visual memory, and advanced cohesive text generation.",
    questions: PART_H_QUESTIONS
  },
  {
    id: "part-i",
    title: "Part I: Summary and Opinion",
    instructionText: "You will hear a short passage or debate scenario. Please summarize the debate first, then state your clear opinion and why you support it.",
    itemCountText: "1 Question",
    skillsTested: "Pragmatic speaking, high-level structural summarization, oral rhetoric, and fluid critical feedback loops.",
    questions: PART_I_QUESTIONS
  },
  {
    id: "part-j",
    title: "Part J: Diagnostics & Quick Practice Repeat",
    instructionText: "Listen to the sentence and repeat it exactly. This section works as a high-fidelity diagnostic calibration check to verify speech rate and pronunciation metrics.",
    itemCountText: "2 Questions",
    skillsTested: "Microphone levels, physical pronunciation speed, audio clarity, and echo resilience.",
    questions: PART_J_QUESTIONS
  }
];

import { adaptQuestionForDifficulty } from '../../utils/difficulty';

export function generateRandomExam(
  targetSectionId?: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): ExamData {
  const allSections: Section[] = [
    {
      ...MASTER_SECTIONS_POOL[0],
      questions: sampleRandom(PART_A_QUESTIONS, 8).map(q => adaptQuestionForDifficulty(q, 'part-a', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[1],
      questions: sampleRandom(PART_B_QUESTIONS, 16).map(q => adaptQuestionForDifficulty(q, 'part-b', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[2],
      questions: sampleRandom(PART_C_QUESTIONS, 10).map(q => adaptQuestionForDifficulty(q, 'part-c', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[3],
      questions: sampleRandom(PART_D_QUESTIONS, 6).map(q => adaptQuestionForDifficulty(q, 'part-d', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[4],
      questions: sampleRandom(PART_E_QUESTIONS, 1).map(q => adaptQuestionForDifficulty(q, 'part-e', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[5],
      questions: sampleRandom(PART_F_QUESTIONS, 12).map(q => adaptQuestionForDifficulty(q, 'part-f', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[6],
      questions: sampleRandom(PART_G_QUESTIONS, 10).map(q => adaptQuestionForDifficulty(q, 'part-g', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[7],
      questions: sampleRandom(PART_H_QUESTIONS, 1).map(q => adaptQuestionForDifficulty(q, 'part-h', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[8],
      questions: sampleRandom(PART_I_QUESTIONS, 1).map(q => adaptQuestionForDifficulty(q, 'part-i', difficulty))
    },
    {
      ...MASTER_SECTIONS_POOL[9],
      questions: sampleRandom(PART_J_QUESTIONS, 2).map(q => adaptQuestionForDifficulty(q, 'part-j', difficulty))
    }
  ];

  // If we have a specific targetSectionId (like part-j), we only include that Section
  const filteredSections = targetSectionId 
    ? allSections.filter(s => s.id === targetSectionId)
    : allSections.filter(s => s.id !== 'part-j'); // for normal full practice, we exclude part-j diagnostic

  return {
    modules: [
      {
        id: "all-parts",
        title: "Versant English Placement Test",
        sections: filteredSections
      }
    ]
  };
}
