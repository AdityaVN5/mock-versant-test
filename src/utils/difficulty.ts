import { Question } from '../types';

/**
 * Programmatically adapts prompt texts, scenario texts, and time limits of questions
 * based on the selected difficulty level (easy, medium, hard).
 */
export function adaptQuestionForDifficulty(
  q: Question,
  sectionId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Question {
  // Deep clone the question object
  const adapted = { ...q };

  if (difficulty === 'medium') {
    // Medium is the baseline (original definitions)
    return adapted;
  }

  // Helper to slice or pad a simple sentence to a target word count range
  const formatSentenceLength = (text: string, targetWords: number): string => {
    const cleanText = text.replace(/[.!?]/g, '').trim();
    const words = cleanText.split(/\s+/);
    
    if (difficulty === 'easy') {
      // Return 5-6 words
      if (words.length > targetWords) {
        return words.slice(0, targetWords).join(' ') + '.';
      }
      return text;
    } else {
      // Hard: Return 11-12 words
      if (words.length < targetWords) {
        // Pad with contextual phrases
        if (text.toLowerCase().includes('package')) words.push('by the courier today');
        else if (text.toLowerCase().includes('walk')) words.push('instead of riding the bus');
        else if (text.toLowerCase().includes('lights')) words.push('before exiting the building');
        else if (text.toLowerCase().includes('project')) words.push('as soon as possible');
        else if (text.toLowerCase().includes('satisfaction')) words.push('in every department');
        else if (text.toLowerCase().includes('work')) words.push('for a long period');
        else if (text.toLowerCase().includes('call')) words.push('without any further delay');
        else if (text.toLowerCase().includes('files')) words.push('in the shared directory');
        else if (text.toLowerCase().includes('oil')) words.push('due to global demand');
        else if (text.toLowerCase().includes('payment')) words.push('due to system maintenance');
        else if (text.toLowerCase().includes('seatbelt')) words.push('during the entire flight');
        else if (text.toLowerCase().includes('meeting')) words.push('due to unforeseen conflicts');
        else if (text.toLowerCase().includes('phone')) words.push('near the conference table');
        else if (text.toLowerCase().includes('shoes')) words.push('at the department store');
        else words.push('under the current circumstances');
      }
      return words.slice(0, targetWords).join(' ') + '.';
    }
  };

  switch (sectionId) {
    case 'part-a': // Read Aloud
      if (difficulty === 'easy') {
        // Only show first sentence (shorter)
        adapted.promptText = q.promptText.split('.')[0] + '.';
        adapted.timeLimit = 20; // shorter time limit for easy
      } else if (difficulty === 'hard') {
        // Add a third complex sentence
        adapted.promptText = q.promptText + " Consequently, individuals are urged to allocate sufficient time for proper examination of all related exhibits.";
        adapted.timeLimit = 40; // longer time limit for hard
      }
      break;

    case 'part-b': // Repeat
    case 'part-j': // Diagnostics
      if (difficulty === 'easy') {
        adapted.promptText = formatSentenceLength(q.promptText, 6);
      } else if (difficulty === 'hard') {
        adapted.promptText = formatSentenceLength(q.promptText, 11);
      }
      break;

    case 'part-c': // Sentence Builds (jumbled string, e.g. "in the park / the dog / was running")
      const parts = q.promptText.split(' / ');
      if (difficulty === 'easy') {
        // Keep 3 phrases (usually already 3, let's keep first 3)
        adapted.promptText = parts.slice(0, 3).join(' / ');
      } else if (difficulty === 'hard') {
        // Add adverbs/qualifiers as a 4th and 5th segment
        adapted.promptText = [...parts, "quickly", "yesterday morning"].join(' / ');
      }
      break;

    case 'part-d': // Conversations
      if (difficulty === 'easy') {
        // Shorten the scenario and make answer simple
        adapted.scenarioText = "Person 1: Where is the report? Person 2: It is on the desk.";
        adapted.promptText = "Where is the report?";
      } else if (difficulty === 'hard') {
        // Lengthen with advanced vocabulary
        adapted.scenarioText = "Person 1: I have searched extensively but cannot locate the quarterly audit statement. Person 2: I recall leaving it situated directly on the conference table.";
        adapted.promptText = "Where exactly was the quarterly audit statement left?";
      }
      break;

    case 'part-e': // Typing
      if (difficulty === 'easy') {
        adapted.promptText = "The quick brown fox jumps.";
        adapted.timeLimit = 15;
      } else if (difficulty === 'hard') {
        adapted.promptText = "The quick brown fox jumps over the lazy dog repeatedly while the active cat sleeps peacefully under the wooden table.";
        adapted.timeLimit = 45;
      }
      break;

    case 'part-f': // Sentence Completion
      if (difficulty === 'easy') {
        adapted.promptText = q.promptText.replace('delayed due to severe ________ conditions at the destination airport', 'delayed because of bad ________ at the airport');
      } else if (difficulty === 'hard') {
        adapted.promptText = q.promptText.replace('delayed due to severe ________ conditions at the destination airport', 'unavoidably delayed due to highly adverse meteorological ________ at the target terminal');
      }
      break;

    case 'part-g': // Dictation
      if (difficulty === 'easy') {
        adapted.promptText = formatSentenceLength(q.promptText, 6);
      } else if (difficulty === 'hard') {
        adapted.promptText = formatSentenceLength(q.promptText, 11);
      }
      break;

    case 'part-h': // Passage Reconstruction
      if (difficulty === 'easy') {
        adapted.promptText = "The company reported a profit in the third quarter due to its software launch.";
        adapted.preparationTime = 15;
        adapted.timeLimit = 45;
      } else if (difficulty === 'hard') {
        adapted.promptText = q.promptText + " Furthermore, their international marketing campaign succeeded in establishing solid footholds in both Asian and European markets, guaranteeing sustained revenue growth for the foreseeable fiscal year.";
        adapted.preparationTime = 40;
        adapted.timeLimit = 120;
      }
      break;

    case 'part-i': // Summary and Opinion
      if (difficulty === 'easy') {
        adapted.promptText = "Some schools want year-round classes. Do you support this?";
        adapted.timeLimit = 30;
      } else if (difficulty === 'hard') {
        adapted.promptText = q.promptText + " Please address the economic, psychological, and logistical ramifications of this systemic schedule restructuring in your analytical summary.";
        adapted.timeLimit = 60;
      }
      break;

    default:
      break;
  }

  return adapted;
}
