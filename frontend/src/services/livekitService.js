import { Room, createLocalAudioTrack } from 'livekit-client';

const API_BASE = "http://localhost:8000";

class LiveKitService {
  constructor() {
    this.room = null;
    this.onRemoteAudio = null; // callback when agent speaks
    this.onConnectionStatus = null; // callback for connection changes
  }

  /**
   * Fetch a token from the backend for connecting to LiveKit
   */
  async fetchToken(roomName, identity) {
    try {
      const res = await fetch(
        `${API_BASE}/token?room=${encodeURIComponent(roomName)}&identity=${encodeURIComponent(identity)}`
      );
      if (!res.ok) throw new Error(`Failed to fetch token: ${res.statusText}`);
      const data = await res.json();
      return data.token;
    } catch (err) {
      console.error('Error fetching token:', err);
      throw err;
    }
  }

  /**
   * Connect to LiveKit room and publish microphone audio
   */
  async startCall(livekitUrl, roomName, identity) {
    try {
      // Get token from backend
      const token = await this.fetchToken(roomName, identity);

      // Create a new Room instance
      this.room = new Room({
        audio: true,
        video: false,
        autoSubscribe: true,
      });

      // Connect to LiveKit
      await this.room.connect(livekitUrl, token);
      console.log('Connected to LiveKit room:', roomName);

      // Create and publish local audio track (microphone)
      const audioTrack = await createLocalAudioTrack();
      await this.room.localParticipant.publishTrack(audioTrack);
      console.log('Published local audio track');

      // Handle remote participants (the agent)
      this.room.on('participantConnected', (participant) => {
        console.log('Participant joined:', participant.identity);
        this.setupRemoteAudioPlayback(participant);
      });

      this.room.on('participantDisconnected', (participant) => {
        console.log('Participant left:', participant.identity);
      });

      if (this.onConnectionStatus) {
        this.onConnectionStatus({ connected: true, roomName });
      }

      return true;
    } catch (err) {
      console.error('Failed to start LiveKit call:', err);
      if (this.onConnectionStatus) {
        this.onConnectionStatus({ connected: false, error: err.message });
      }
      throw err;
    }
  }

  /**
   * Set up audio playback for a remote participant
   */
  setupRemoteAudioPlayback(participant) {
    participant.audioTracks.forEach((audioPublication) => {
      if (audioPublication.isSubscribed) {
        this.playRemoteAudio(audioPublication.track);
      }
    });

    participant.on('trackSubscribed', (track) => {
      if (track.kind === 'audio') {
        this.playRemoteAudio(track);
      }
    });
  }

  /**
   * Play remote audio track
   */
  playRemoteAudio(track) {
    // Create an audio element to play the remote audio
    const audioElement = new Audio();
    audioElement.srcObject = new MediaStream([track.mediaStreamTrack]);
    audioElement.play().catch((err) => console.error('Error playing remote audio:', err));

    // Notify parent that agent is speaking
    if (this.onRemoteAudio) {
      this.onRemoteAudio(true);
    }

    // Track when audio stops
    track.mediaStreamTrack.onended = () => {
      if (this.onRemoteAudio) {
        this.onRemoteAudio(false);
      }
    };
  }

  /**
   * Disconnect from LiveKit room
   */
  async stopCall() {
    try {
      if (this.room) {
        await this.room.disconnect();
        this.room = null;
        console.log('Disconnected from LiveKit room');

        if (this.onConnectionStatus) {
          this.onConnectionStatus({ connected: false });
        }
      }
    } catch (err) {
      console.error('Error stopping call:', err);
      throw err;
    }
  }

  /**
   * Check if currently connected
   */
  isConnected() {
    return this.room && this.room.state === 'connected';
  }
}

export default new LiveKitService();
