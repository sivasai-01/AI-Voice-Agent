/**
 * Speech Recognition Service using Web Speech API
 * Provides real-time transcription of user speech
 */

class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not available in this browser');
      this.recognition = null;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.isListening = false;
    this.transcript = '';
    this.interimTranscript = '';
    this.isFinal = false;
    this.shouldRestart = false; // Flag to auto-restart listening

    // Callbacks
    this.onTranscript = null; // Called with { transcript, interim, isFinal }
    this.onStart = null;
    this.onEnd = null;
    this.onError = null;

    this.setupRecognition();
  }

  setupRecognition() {
    if (!this.recognition) return;

    // When recognition starts
    this.recognition.onstart = () => {
      this.isListening = true;
      this.transcript = '';
      this.interimTranscript = '';
      if (this.onStart) this.onStart();
    };

    // Continuous audio input
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    // Process results
    this.recognition.onresult = (event) => {
      this.interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.transcript += transcript + ' ';
        } else {
          this.interimTranscript += transcript;
        }
      }

      // Call the callback with both final and interim transcripts
      if (this.onTranscript) {
        this.onTranscript({
          transcript: this.transcript,
          interim: this.interimTranscript,
          isFinal: event.results[event.results.length - 1].isFinal,
        });
      }
    };

    // When recognition ends
    this.recognition.onend = () => {
      this.isListening = false;
      
      // Auto-restart if user is still recording (solves the auto-stop issue)
      if (this.shouldRestart) {
        console.log('Recognition ended, restarting...');
        try {
          this.recognition.start();
        } catch (err) {
          console.warn('Could not restart recognition:', err);
        }
      }
      
      if (this.onEnd) this.onEnd();
    };

    // Handle errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onError) this.onError(event.error);
    };
  }

  /**
   * Start listening for speech
   */
  start() {
    if (!this.recognition) {
      console.error('Speech Recognition not supported');
      return;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    this.shouldRestart = true; // Enable auto-restart
    this.transcript = '';
    this.interimTranscript = '';
    
    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Start recognition error (already started?):', err);
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (!this.recognition) return;

    this.shouldRestart = false; // Disable auto-restart
    this.recognition.stop();
    return this.transcript.trim();
  }

  /**
   * Abort recognition
   */
  abort() {
    if (!this.recognition) return;
    this.shouldRestart = false;
    this.recognition.abort();
  }

  /**
   * Check if browser supports Speech Recognition
   */
  isSupported() {
    return this.recognition !== null;
  }

  /**
   * Get current transcript
   */
  getTranscript() {
    return this.transcript.trim();
  }
}

export default new SpeechRecognitionService();
