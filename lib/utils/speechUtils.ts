// Speech Utilities for Web Speech API
// Provides TTS and STT functionality with browser compatibility

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class SpeechUtils {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
  private static onErrorCallback: ((error: string) => void) | null = null;
  private static onEndCallback: (() => void) | null = null;

  /**
   * Check if Speech Recognition is available
   */
  static isSpeechRecognitionAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  /**
   * Check if Speech Synthesis is available
   */
  static isSpeechSynthesisAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  /**
   * Get browser name for compatibility info
   */
  static getBrowserInfo(): { name: string; supportsSTT: boolean; supportsTTS: boolean } {
    if (typeof window === 'undefined') {
      return { name: 'Unknown', supportsSTT: false, supportsTTS: false };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    let browserName = 'Unknown';
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      browserName = 'Chrome';
    } else if (userAgent.includes('edg')) {
      browserName = 'Edge';
    } else if (userAgent.includes('firefox')) {
      browserName = 'Firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      browserName = 'Safari';
    }

    return {
      name: browserName,
      supportsSTT: this.isSpeechRecognitionAvailable(),
      supportsTTS: this.isSpeechSynthesisAvailable(),
    };
  }

  /**
   * Initialize Speech Recognition
   */
  private static initializeRecognition(): any {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0.5;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      const result: SpeechRecognitionResult = {
        transcript: finalTranscript || interimTranscript,
        confidence: maxConfidence || 0.5,
        isFinal: !!finalTranscript,
      };

      if (this.onResultCallback) {
        this.onResultCallback(result);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
    };

    recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    return recognition;
  }

  /**
   * Start listening for speech input
   */
  static startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): boolean {
    if (this.isListening) {
      console.warn('Already listening');
      return false;
    }

    if (!this.isSpeechRecognitionAvailable()) {
      if (onError) {
        onError('Speech recognition is not available in your browser. Please use Chrome or Edge.');
      }
      return false;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onEndCallback = onEnd || null;

    this.recognition = this.initializeRecognition();
    if (!this.recognition) {
      if (onError) {
        onError('Failed to initialize speech recognition');
      }
      return false;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error: any) {
      console.error('Error starting recognition:', error);
      this.isListening = false;
      if (onError) {
        onError('Failed to start speech recognition. Please try again.');
      }
      return false;
    }
  }

  /**
   * Stop listening for speech input
   */
  static stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
      }
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  static getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Speak text using Text-to-Speech
   */
  static speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voice?: SpeechSynthesisVoice;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSpeechSynthesisAvailable()) {
        const error = 'Text-to-speech is not available in your browser';
        if (options?.onError) {
          options.onError(error);
        }
        reject(new Error(error));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;
      
      if (options?.voice) {
        utterance.voice = options.voice;
      }

      utterance.onend = () => {
        if (options?.onEnd) {
          options.onEnd();
        }
        resolve();
      };

      utterance.onerror = (event) => {
        const error = `Speech synthesis error: ${event.error}`;
        console.error(error);
        if (options?.onError) {
          options.onError(error);
        }
        reject(new Error(error));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  static stopSpeaking(): void {
    if (this.isSpeechSynthesisAvailable()) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  static isSpeaking(): boolean {
    if (!this.isSpeechSynthesisAvailable()) return false;
    return window.speechSynthesis.speaking;
  }

  /**
   * Get available voices
   */
  static getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSynthesisAvailable()) return [];
    return window.speechSynthesis.getVoices();
  }

  /**
   * Wait for voices to load (they load asynchronously)
   */
  static waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = this.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      const checkVoices = () => {
        const loadedVoices = this.getVoices();
        if (loadedVoices.length > 0) {
          resolve(loadedVoices);
        } else {
          setTimeout(checkVoices, 100);
        }
      };

      // Some browsers fire the voiceschanged event
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(this.getVoices());
        };
      } else {
        checkVoices();
      }
    });
  }

  /**
   * Get preferred voice (English, natural-sounding)
   */
  static async getPreferredVoice(): Promise<SpeechSynthesisVoice | null> {
    const voices = await this.waitForVoices();
    
    // Prefer voices with "Google" or "Neural" in name (better quality)
    const preferred = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Natural'))
    );
    
    if (preferred) return preferred;

    // Fallback to any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) return englishVoice;

    // Fallback to first available
    return voices[0] || null;
  }
}







