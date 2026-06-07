import { ExamData } from '../types';

export const mockExamData: ExamData = {
  modules: [
    {
      id: "all-parts",
      title: "Versant English Placement Test",
      sections: [
        {
          id: "part-a",
          title: "Part A: Read Aloud",
          instructionText: "Read the passage aloud smoothly and naturally in a clear voice. You will be stopped after 30 seconds. This is not a speed reading test. You may not be able to finish reading the entire passage, but that is okay. When your time is up, you will automatically move on to the next item.",
          itemCountText: "8 Questions",
          skillsTested: "Reading comprehension, pronunciation, word stress, and oral fluency.",
          questions: [
            {
              id: "a-1",
              type: "speaking",
              promptText: "The local museum is offering free admission this weekend. Visitors can explore a large collection of historical paintings, sculptures, and interactive science displays designed for all ages.",
              timeLimit: 30,
              displayPrompt: true
            },
            {
              id: "a-2",
              type: "speaking",
              promptText: "Many universities are transitioning to digital library databases. Students can now access thousands of rare manuscript scans directly from their dorm rooms or local cafes.",
              timeLimit: 30,
              displayPrompt: true
            }
          ]
        },
        {
          id: "part-b",
          title: "Part B: Repeat",
          instructionText: "Repeat each sentence exactly as you hear it.",
          itemCountText: "16 Questions",
          skillsTested: "Sentence structures, vocabulary recall, pronunciation, and accent tracking.",
          questions: [
            {
              id: "b-1",
              type: "speaking",
              promptText: "The package was delivered late yesterday afternoon.",
              timeLimit: 15,
              displayPrompt: false
            },
            {
              id: "b-2",
              type: "speaking",
              promptText: "She decided to walk to work instead of taking the bus.",
              timeLimit: 15,
              displayPrompt: false
            }
          ]
        },
        {
          id: "part-c",
          title: "Part C: Sentence Builds",
          instructionText: "Listen to three or four jumbled phrases and say them back as a single, grammatically correct sentence.",
          itemCountText: "10 Questions",
          skillsTested: "Syntactic structure, syntax memory, logic, and lexical organization.",
          questions: [
            {
              id: "c-1",
              type: "speaking",
              promptText: "in the park / the dog / was running",
              timeLimit: 15,
              displayPrompt: false
            },
            {
              id: "c-2",
              type: "speaking",
              promptText: "to the office / walked / she / quickly",
              timeLimit: 15,
              displayPrompt: false
            }
          ]
        },
        {
          id: "part-d",
          title: "Part D: Conversations",
          instructionText: "Listen to 2 people have a short conversation. Then, answer a question about the conversation with a few words or a short phrase.",
          itemCountText: "6 Questions",
          skillsTested: "Active audio tracking, semantic inference, and prompt verbalization.",
          questions: [
            {
              id: "d-1",
              type: "speaking",
              scenarioText: "Person 1: I can't find the quarterly report. Person 2: I left it on the conference table.",
              promptText: "Where is the quarterly report?",
              timeLimit: 8,
              displayPrompt: false
            }
          ]
        },
        {
          id: "part-e",
          title: "Part E: Typing",
          instructionText: "Exotic characters or typing speeds are measured key-by-key. Copy the paragraph displayed below exactly. Typing speed and accuracy will be assessed.",
          itemCountText: "10 Questions",
          skillsTested: "Typing speed, spelling accuracy, motor skill coordination, and visual tracking.",
          questions: [
            {
              id: "e-1",
              type: "dictation", // Re-use dictation component for custom typing text input
              promptText: "The quick brown fox jumps over the lazy dog repeatedly.",
              timeLimit: 30,
              displayPrompt: true
            }
          ]
        },
        {
          id: "part-f",
          title: "Part F: Sentence Completion",
          instructionText: "Read a sentence that has one missing word. Type the single word that best fits the blank.",
          itemCountText: "12 Questions",
          skillsTested: "Reading comprehension, lexicography, syntax, and vocabulary placement.",
          questions: [
            {
              id: "f-1",
              type: "writing",
              promptText: "The flight was delayed due to severe ________ conditions at the destination airport.",
              timeLimit: 25,
              displayPrompt: true
            },
            {
              id: "f-2",
              type: "writing",
              promptText: "He forgot his keys, so he had to call his roommate to ________ the front door.",
              timeLimit: 25,
              displayPrompt: true
            }
          ]
        },
        {
          id: "part-g",
          title: "Part G: Dictation",
          instructionText: "You will hear a sentence. Type exactly what you hear. Speed and accurate spelling are important.",
          itemCountText: "10 Questions",
          skillsTested: "Sound-to-grapheme decoding, auditory retention, orthography, and active syntax parsing.",
          questions: [
            {
              id: "g-1",
              type: "dictation",
              promptText: "Please make sure to submit the required forms by Friday afternoon.",
              timeLimit: 25,
              displayPrompt: false
            }
          ]
        },
        {
          id: "part-h",
          title: "Part H: Passage Reconstruction",
          instructionText: "Read a short paragraph for exactly 30 seconds. The text disappears, and you have 90 seconds to type and reconstruct it with as many details as possible.",
          itemCountText: "8 Questions",
          skillsTested: "Syntactic structure, vocabulary, visual memory, and advanced cohesive text generation.",
          questions: [
            {
              id: "h-1",
              type: "reading-writing",
              promptText: "The company announced a significant increase in profits for the third quarter. This success was mainly driven by the launch of their new software platform, which attracted thousands of new subscribers worldwide.",
              preparationTime: 30,
              timeLimit: 90,
              displayPrompt: false
            }
          ]
        },
        {
          id: "part-i",
          title: "Part I: Summary and Opinion",
          instructionText: "You will hear a short passage or debate scenario. Please summarize the debate first, then state your clear opinion and why you support it.",
          itemCountText: "2 Questions",
          skillsTested: "Pragmatic speaking, high-level structural summarization, oral rhetoric, and fluid critical feedback loops.",
          questions: [
            {
              id: "i-1",
              type: "speaking",
              promptText: "Some schools are proposing that students should attend class year-round with shorter, more frequent breaks, rather than having a long summer vacation. What is your perspective on this, and why?",
              timeLimit: 40,
              displayPrompt: false
            }
          ]
        },
        {
          id: "part-j",
          title: "Part J: Diagnostics & Quick Practice Repeat",
          instructionText: "Listen to the sentence and repeat it exactly. This section works as a high-fidelity diagnostic calibration check to verify speech rate and pronounciation metrics.",
          itemCountText: "2 Questions",
          skillsTested: "Microphone levels, physical pronunciation speed, audio clarity, and echo resilience.",
          questions: [
            {
              id: "j-1",
              type: "speaking",
              promptText: "The virtual classroom provides tutor feedback.",
              timeLimit: 15,
              displayPrompt: false
            },
            {
              id: "j-2",
              type: "speaking",
              promptText: "Our speech algorithm analyzes pitch variance.",
              timeLimit: 15,
              displayPrompt: false
            }
          ]
        }
      ]
    }
  ]
};
