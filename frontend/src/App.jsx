import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Settings, 
  Upload, 
  FileText, 
  MessageSquare, 
  ChevronRight,
  Database,
  Activity,
  Menu,
  X,
  Square,
  Volume2,
  VolumeX
} from 'lucide-react';

import livekitService from './services/livekitService';
import speechRecognitionService from './services/speechRecognitionService';
import ttsService from './services/ttsService';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const App = () => {
  // State
  const [isCalling, setIsCalling] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("You are a real-time conversational AI voice assistant. Behavior: Speak naturally and concisely. Use KB context first when available. Do not hallucinate.");
  const [transcript, setTranscript] = useState([]);
  const [ragSources, setRagSources] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [callError, setCallError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Setup LiveKit callbacks
  useEffect(() => {
    livekitService.onConnectionStatus = (status) => {
      if (!status.connected && status.error) {
        setCallError(status.error);
        setIsCalling(false);
      }
    };

    return () => {
      livekitService.onConnectionStatus = null;
    };
  }, []);

  // Setup Speech Recognition callbacks
  useEffect(() => {
    speechRecognitionService.onTranscript = (result) => {
      setInterimSpeech(result.interim);
      if (result.isFinal) {
        // Auto-send final transcript when user has finished speaking
        if (result.transcript.trim()) {
          handleSendTranscript(result.transcript.trim());
        }
      }
    };

    speechRecognitionService.onStart = () => {
      setIsRecording(true);
      setCallError(null);
    };

    speechRecognitionService.onEnd = () => {
      setIsRecording(false);
      setInterimSpeech("");
    };

    speechRecognitionService.onError = (error) => {
      setCallError(`Speech recognition error: ${error}`);
      setIsRecording(false);
    };

    return () => {
      speechRecognitionService.onTranscript = null;
      speechRecognitionService.onStart = null;
      speechRecognitionService.onEnd = null;
      speechRecognitionService.onError = null;
    };
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(`Success: ${data.chunks_indexed} chunks indexed.`);
    } catch (err) {
      setUploadStatus("Upload failed.");
    }
  };

  const updatePrompt = async () => {
    try {
      await fetch(`${API_BASE}/set_prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: systemPrompt }),
      });
      alert("System prompt updated!");
    } catch (err) {
      alert("Failed to update prompt.");
    }
  };

  const toggleCall = async () => {
    try {
      setCallError(null);
      
      if (!isCalling) {
        // Fetch LiveKit URL from backend
        const configRes = await fetch(`${API_BASE}/livekit-config`);
        const config = await configRes.json();
        const LIVEKIT_URL = config.livekit_url;
        
        const roomName = 'voice-chat-room';
        const identity = `user-${Date.now()}`;

        setTranscript(prev => [...prev, { role: 'system', content: 'Voice call started. Connecting to LiveKit...' }]);
        
        await livekitService.startCall(LIVEKIT_URL, roomName, identity);
        setIsCalling(true);
        
        setTranscript(prev => [...prev, { role: 'system', content: 'Connected! Click "Start Recording" to speak, or type a message.' }]);
      } else {
        // Stop the voice call
        if (isRecording) {
          speechRecognitionService.stop();
          setIsRecording(false);
        }
        await livekitService.stopCall();
        setIsCalling(false);
        setTranscript(prev => [...prev, { role: 'system', content: 'Voice call ended.' }]);
      }
    } catch (err) {
      console.error('Call toggle error:', err);
      setCallError(err.message);
      setIsCalling(false);
      setTranscript(prev => [...prev, { role: 'system', content: `Error: ${err.message}` }]);
    }
  };

  const startRecording = () => {
    if (!speechRecognitionService.isSupported()) {
      setCallError('Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    speechRecognitionService.start();
  };

  const stopRecording = () => {
    const transcript = speechRecognitionService.stop();
    setIsRecording(false);
    if (transcript) {
      handleSendTranscript(transcript);
    }
  };

  const handleSendTranscript = async (text) => {
    if (!text.trim() || isThinking) return;

    setTranscript(prev => [...prev, { role: 'user', content: text }]);
    setInterimSpeech("");
    setIsThinking(true);
    setCallError(null);

    try {
      const formData = new FormData();
      formData.append("text", text);

      const res = await fetch(`${API_BASE}/voice`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      
      setTranscript(prev => [...prev, { role: 'agent', content: data.reply }]);
      setRagSources(data.rag_sources || []);
      
      // Speak out the agent's reply if TTS is supported
      if (ttsService.isSupported) {
        ttsService.speak(data.reply, {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        }, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: (error) => console.error('TTS error:', error),
        });
      }
    } catch (err) {
      console.error('Error sending query:', err);
      setCallError(err.message);
      setTranscript(prev => [...prev, { role: 'system', content: `Error: ${err.message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendQuery = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    const userMsg = inputText;
    setInputText("");
    setTranscript(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);
    setCallError(null);

    try {
      const formData = new FormData();
      formData.append("text", userMsg);

      const res = await fetch(`${API_BASE}/voice`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      setTranscript(prev => [...prev, { role: 'agent', content: data.reply }]);
      setRagSources(data.rag_sources || []);
      
      // Speak out the agent's reply if TTS is supported
      if (ttsService.isSupported) {
        ttsService.speak(data.reply, {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        }, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: (error) => console.error('TTS error:', error),
        });
      }
    } catch (err) {
      console.error('Error sending query:', err);
      setCallError(err.message);
      setTranscript(prev => [...prev, { role: 'agent', content: `Error: ${err.message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 -ml-2 mr-2 rounded-lg bg-white border border-indigo-500 text-slate-900 shadow-sm flex items-center justify-center w-10 h-10 hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X size={18} className="text-slate-900" />
            ) : (
              <Menu size={18} className="text-slate-900" />
            )}
          </button>
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Activity size={20} className="sm:hidden" />
            <Activity size={24} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">Voice AI</h1>
            <p className="text-xs sm:text-xs text-slate-500 uppercase tracking-widest font-semibold hidden sm:block">Real-Time RAG Pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {isCalling && speechRecognitionService.isSupported() && (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full font-bold transition-all shadow-md ${
                  isRecording
                    ? "bg-green-100 text-green-600 hover:bg-green-200 animate-pulse"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                {isRecording ? (
                  <><Square size={16} /> Stop<span className="hidden sm:inline"> Recording</span></>
                ) : (
                  <><Mic size={16} /> <span className="hidden sm:inline">Start Recording</span></>
                )}
              </button>
            </>
          )}
          {isSpeaking && ttsService.isSupported && (
            <button
              onClick={() => ttsService.stop()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full font-bold bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all shadow-md animate-pulse"
              title="Stop speaking"
            >
              <VolumeX size={16} /><span className="hidden sm:inline">Mute</span>
            </button>
          )}
          <button 
            onClick={toggleCall}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full font-bold transition-all shadow-md ${
              isCalling 
              ? "bg-red-100 text-red-600 hover:bg-red-200" 
              : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isCalling ? <><MicOff size={18} /> <span className="hidden sm:inline">Stop Call</span></> : <><Mic size={18} /> Start Call</>}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Settings & Knowledge Base */}
        <aside className="hidden md:flex w-80 border-r bg-white flex-col overflow-y-auto p-6 gap-8">
          {/* Prompt Editor */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
              <Settings size={18} className="text-indigo-600" />
              <h3>System Prompt</h3>
            </div>
            <textarea 
              className="w-full h-32 p-3 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <button 
              onClick={updatePrompt}
              className="mt-2 w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Update Agent Behavior
            </button>
          </section>

          {/* KB Management */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
              <Database size={18} className="text-indigo-600" />
              <h3>Knowledge Base</h3>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                onChange={handleUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto text-slate-400 mb-2" size={24} />
              <p className="text-xs text-slate-500 font-medium">Drop documents to index (TXT, PDF)</p>
            </div>
            {uploadStatus && (
              <p className="mt-2 text-xs font-semibold text-indigo-600 bg-indigo-50 p-2 rounded">{uploadStatus}</p>
            )}
          </section>

          {/* RAG Sources */}
          <section className="flex-1">
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
              <FileText size={18} className="text-indigo-600" />
              <h3>RAG Sources</h3>
            </div>
            <div className="space-y-3">
              {ragSources.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No sources retrieved yet.</p>
              ) : (
                ragSources.map((source, i) => (
                  <div key={i} className="p-3 bg-slate-50 border rounded-lg text-xs leading-relaxed group hover:border-indigo-300 transition-colors">
                    <p className="font-bold text-indigo-600 mb-1 flex items-center gap-1">
                      <ChevronRight size={12} /> {source.source}
                    </p>
                    <p className="text-slate-600">{source.text}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-30">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 bg-white border-r p-6 overflow-y-auto">
              {/* Reuse the same aside content by duplicating structure */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                  <Settings size={18} className="text-indigo-600" />
                  <h3>System Prompt</h3>
                </div>
                <textarea 
                  className="w-full h-32 p-3 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
                <button 
                  onClick={updatePrompt}
                  className="mt-2 w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Update Agent Behavior
                </button>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                  <Database size={18} className="text-indigo-600" />
                  <h3>Knowledge Base</h3>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    onChange={handleUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                  <p className="text-xs text-slate-500 font-medium">Drop documents to index (TXT, PDF)</p>
                </div>
                {uploadStatus && (
                  <p className="mt-2 text-xs font-semibold text-indigo-600 bg-indigo-50 p-2 rounded">{uploadStatus}</p>
                )}
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                  <FileText size={18} className="text-indigo-600" />
                  <h3>RAG Sources</h3>
                </div>
                <div className="space-y-3">
                  {ragSources.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No sources retrieved yet.</p>
                  ) : (
                    ragSources.map((source, i) => (
                      <div key={i} className="p-3 bg-slate-50 border rounded-lg text-xs leading-relaxed group hover:border-indigo-300 transition-colors">
                        <p className="font-bold text-indigo-600 mb-1 flex items-center gap-1">
                          <ChevronRight size={12} /> {source.source}
                        </p>
                        <p className="text-slate-600">{source.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center Panel: Chat/Transcript */}
        <section className="flex-1 flex flex-col bg-slate-50">
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6">
            {transcript.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <MessageSquare size={32} />
                </div>
                <p className="font-medium text-lg text-slate-500">How can I help you today?</p>
                <p className="text-sm max-w-xs text-center leading-relaxed">
                  Start a voice call or type a message. I'll use your uploaded documents to answer.
                </p>
              </div>
            )}
            
            {transcript.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : msg.role === 'system'
                  ? 'bg-slate-200 text-slate-600 text-xs font-mono uppercase tracking-wider rounded-lg mx-auto'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isRecording && (
              <div className="flex justify-start">
                <div className="bg-blue-50 text-blue-600 px-4 py-3 rounded-2xl rounded-tl-none border border-blue-200 shadow-sm max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-sm font-bold">Listening...</span>
                  </div>
                  {interimSpeech && <p className="mt-2 text-sm italic">{interimSpeech}</p>}
                </div>
              </div>
            )}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white text-indigo-600 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm font-bold italic">Agent is thinking...</span>
                </div>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-6 bg-white border-t">
            <form onSubmit={handleSendQuery} className="max-w-4xl mx-auto flex gap-2 sm:gap-4">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or use voice..."
                className="flex-1 px-3 sm:px-5 py-2 sm:py-3 bg-slate-100 border-none rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-sm sm:text-base"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white font-bold rounded-lg sm:rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md text-sm sm:text-base"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;