/**
 * Text-to-Speech Service using Web Speech API
 * Provides voice output for agent replies
 */

class TTSService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isSupported = !!this.synth;
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  /**
   * Speak text out loud
   * @param {string} text - Text to speak
   * @param {Object} options - Optional settings (rate, pitch, volume)
   * @param {Function} onEnd - Callback when speaking finishes
   */
  speak(text, options = {}, onEnd = null) {
    if (!this.isSupported) {
      console.warn('Text-to-Speech not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    if (this.isSpeaking) {
      this.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';

    // Event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('TTS error:', event.error);
      this.isSpeaking = false;
      if (options.onError) options.onError(event.error);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Stop speaking immediately
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Pause/Resume speaking
   */
  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.isSpeaking) {
      this.synth.resume();
    }
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.synth ? this.synth.getVoices() : [];
  }

  /**
   * Set preferred voice
   */
  setVoice(voiceIndex) {
    const voices = this.getVoices();
    if (voices[voiceIndex] && this.currentUtterance) {
      this.currentUtterance.voice = voices[voiceIndex];
    }
  }
}

export default new TTSService();
