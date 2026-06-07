# Automated English Language Assessment: The Versant Practice Portal
An Interactive Speech, Typing, and Writing Diagnostic Environment aligned with the Global Scale of English (GSE) and the Common European Framework of Reference (CEFR).

---

## 1. Abstract & Research Context
Automated language assessment systems require high-fidelity modeling of acoustic, lexical, and syntactic features to approximate human grading. This application serves as a comprehensive simulation sandbox for the **Versant English Placement Test**. It allows researchers and candidates to examine how time limits, speech rate triggers, cognitive loads, and spelling accuracy translate into standardized proficiency metrics.

By modeling the 4 core language competencies—**Speaking, Listening, Reading, and Writing**—this platform provides a real-time web-based simulation of Pearson's automated scoring framework. It features Web Speech API integration, low-latency mic capture calibration, silence threshold detection, and a programmatical linguistic difficulty engine.

---

## 2. Assessment & Cognitive-Linguistic Architecture
The test consists of nine distinct sub-tests (Parts A through I), supplemented by a quick diagnostic loop (Part J). Each section isolates and evaluates different layers of cognitive-linguistic processing:

| Section | Title | Primary Skill | Input Modality | Cognitive Load / Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Part A** | Read Aloud | Speaking | Microphone | Grapheme-to-phoneme decoding, pronunciation, and oral fluency. |
| **Part B** | Repeat | Speaking/Listening | Microphone | Auditory short-term memory, syntax parsing, and accent tracking. |
| **Part C** | Sentence Builds | Speaking/Listening | Microphone | Syntactic structure generation, grammar logic, and lexical sorting. |
| **Part D** | Conversations | Speaking/Listening | Microphone | Active auditory tracking, semantic inference, and direct verbalization. |
| **Part E** | Typing | Writing | Keyboard | Visual-motor tracking speed, spelling, and character precision. |
| **Part F** | Sentence Completion | Writing/Reading | Keyboard | Contextual reading comprehension and lexical replacement. |
| **Part G** | Dictation | Writing/Listening | Keyboard | Sound-to-grapheme decoding, spelling, and auditory retention. |
| **Part H** | Passage Reconstruction | Writing/Reading | Keyboard | Paragraph structural coherence, retention, and cohesive text generation. |
| **Part I** | Summary & Opinion | Speaking/Listening | Microphone | Rhetoric, summarization, logical flow, and opinion structures. |
| **Part J** | Diagnostics | Speaking/Listening | Microphone | Audio level calibration, speech rate, and pronunciation metrics. |

---

## 3. The Programmatic Difficulty Calibration Engine
A major component of this research environment is the **3-Way Difficulty Segmented Switch** (Easy, Medium, Hard). It programmatically alters the linguistic complexity, syntax constraints, and temporal parameters of all prompts:

### Difficulty Scaling Rules
1. **Part A (Read Aloud)**:
   * **Easy**: Truncates passage to the first sentence only. Timelimit reduced to **20s** to ease phonetic endurance.
   * **Hard**: appends an additional compound-complex sentence (e.g., *"Consequently, individuals are urged to allocate sufficient time..."*). Timelimit extended to **40s**.

2. **Part B, G & J (Repeat / Dictation / Diagnostics)**:
   * **Easy**: Forces a simple sentence layout restricted to **5–6 words** (e.g., *"Where is the nearest train station?"*).
   * **Hard**: Expands syntactic structure to a dense **11–12 words** by appending contextual prepositional/adverbial phrases (e.g., *"She decided to walk to work today instead of riding the bus."*).

3. **Part C (Sentence Builds)**:
   * **Easy**: Retains basic 3-phrase jumbles.
   * **Hard**: Appends advanced adverbial phrases (like *"quickly"*, *"yesterday morning"*) creating complex 5-phrase jumbled pools.

4. **Part D (Conversations)**:
   * **Easy**: Simplified scenarios with immediate direct answers.
   * **Hard**: Advanced scenarios utilizing low-frequency, academic vocabulary.

5. **Part E (Typing)**:
   * **Easy**: A simple 5-word sentence (*"The quick brown fox jumps."*) with a **15s** threshold.
   * **Hard**: A compound sentence (*"The quick brown fox jumps over the lazy dog repeatedly..."*) with a **45s** threshold.

6. **Part H & I (Passage Reconstruction / Summary & Opinion)**:
   * Programmatically scales preparation times (from **15s** up to **40s**) and writing/speaking time windows (from **30s** up to **120s**) alongside passage syntactic density.

---

## 4. Evaluation Framework & Scoring Methodology
When an exam is submitted, the system's **AI grading model** calculates scores by evaluating speech transcriptions and textual inputs against reference criteria:

* **Oral Fluency & Pronunciation**: Assessed by measuring speech rate (words per minute), silent intervals, and phonetic alignment using the Web Speech API.
* **Grammatical Accuracy & Vocabulary**: Measured using Levenshtein distance, word error rate (WER), and semantic matches.
* **Score Alignment**: Scores are mapped to the Global Scale of English (GSE: 10–90) and the Common European Framework of Reference (CEFR: A1 to C2).

---

## 5. Technical Implementation & Tech Stack
* **Framework**: React 19 (TypeScript)
* **Build Tool**: Vite v6
* **Styling**: Tailwind CSS v4 & custom transition utilities
* **Icons & Visuals**: Lucide React
* **Speech Synthesis**: Browser Native `window.speechSynthesis` (SpeechSynthesisUtterance)
* **Speech Recognition**: Browser Native `webkitSpeechRecognition` / `SpeechRecognition`
* **Microphone Processing**: Web Audio API with custom volume spike detector for automatic silence threshold bypass.

---

## 6. Local Setup & Execution

**Prerequisites:** Node.js (v18 or higher recommended)

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```
2. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
3. **Build the Production Bundle**:
   ```bash
   npm run build
   ```
