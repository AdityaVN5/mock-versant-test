export async function playTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported");
      resolve();
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (e) => {
      console.error("TTS Error", e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function playBeep(): Promise<void> {
  return new Promise((resolve) => {
    // Fallback if AudioContext is not supported
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      resolve();
      return;
    }

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    
    setTimeout(() => {
      osc.stop();
      ctx.close();
      resolve();
    }, 200); // 200ms beep
  });
}

// Monitors an audio stream for a spike in volume to detect speaking
export class SilenceDetector {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  
  start(stream: MediaStream, threshold: number, onDetected: () => void) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.microphone = this.audioCtx.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    // Check volume every 100ms
    this.checkInterval = setInterval(() => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume or max volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const maxVolume = Math.max(...Array.from(dataArray));
      
      // If we detect a loud enough sound, trigger callback
      if (maxVolume > threshold) {
        this.stop(); // Stop detecting once triggered
        onDetected();
      }
    }, 100);
  }

  stop() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch (e) {
        console.error(e);
      }
    }
    this.analyser = null;
    this.microphone = null;
  }
}
