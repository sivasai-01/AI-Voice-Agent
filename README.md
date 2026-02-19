# 🎤 AI Voice Agent

A real-time conversational AI voice assistant with RAG (Retrieval-Augmented Generation) support. Speak naturally, get intelligent responses powered by LLM, with automatic document context retrieval.

## ✨ Key Features

### 🎙️ Speech-to-Text (STT)
- Browser Web Speech API for instant transcription
- Live interim speech display while speaking
- Auto-submit when user finishes speaking
- Continuous listening mode (no timeout until stop button clicked)
- Multi-language support

### 🤖 AI Intelligence
- Google Gemini LLM integration
- Context-aware responses using RAG
- Customizable system prompt (editable UI)
- Real-time LLM reply generation

### 📄 Document Management (RAG)
- Upload PDFs and text files
- Automatic text extraction and chunking
- Semantic relevance retrieval
- Display of RAG sources alongside responses
- Supports large documents with intelligent chunking

### 🔊 Text-to-Speech (TTS)
- Browser SpeechSynthesis API for automatic voice output
- Agent replies spoken aloud after generation
- Mute button to stop speaking
- Configurable voice parameters (rate, pitch, volume)

### 📞 Real-Time Voice Communication
- LiveKit WebRTC integration
- Live room-based audio streaming
- Multi-participant support
- Token-based secure access

### 📱 UI/UX Features
- Fully responsive design (mobile, tablet, desktop)
- Live chat transcript with message history
- System status messages and indicators
- Animated "Listening..." and "Thinking..." states
- Mobile hamburger menu overlay
- Knowledge base sidebar (desktop) with RAG sources list
- Dark-optimized color scheme with Indigo accent

### 🔐 Security
- Environment variables for secrets
- CORS support
- LiveKit API key management
- Safe API endpoint handling

## 🏗️ Architecture

### High-Level Flow
```
User Speech
    ↓
Web Speech API (STT)
    ↓
Live Transcript Display
    ↓
Auto-Send to /voice API
    ↓
RAG Retrieval (from uploaded docs)
    ↓
Google Gemini LLM Generation
    ↓
Browser SpeechSynthesis (TTS)
    ↓
Agent Speaks Response ✓
```

### System Architecture
```
Frontend (React + Vite)
    ├── Live Chat UI
    ├── Voice Call Manager (LiveKit)
    ├── STT Handler (Web Speech API)
    └── TTS Handler (SpeechSynthesis)
           ↓
Backend (FastAPI)
    ├── /upload → RAG Ingestion
    ├── /voice → LLM + RAG Pipeline
    ├── /livekit-config → Config Delivery
    └── /token → LiveKit Token Generation
           ↓
External Services
    ├── LiveKit Cloud (WebRTC)
    ├── Google Gemini (LLM)
    └── Document Storage (In-Memory)
```

## � Tech Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI Framework | 18.2.0 |
| Vite | Build Tool & Dev Server | 4.3.9 |
| Tailwind CSS | Styling | 3.3.2 |
| Lucide React | Icons | 0.284.0 |
| LiveKit Client | WebRTC Communication | 2.17.1 |
| Web Speech API | STT/TTS | Browser Native |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| FastAPI | HTTP API Framework | 0.104.1 |
| Uvicorn | ASGI Server | 0.24.0 |
| Python | Runtime | 3.10+ |
| LiveKit SDK | Token Generation & Room Mgmt | 0.8.0 |
| Google Generative AI | LLM (Gemini Flash) | 0.3.0 |
| PyPDF | PDF Text Extraction | 3.17.1 |
| Python Multipart | File Upload Handling | 0.0.6 |

### External Services
- **Google Gemini 1.5 Flash** - LLM for intelligent responses
- **LiveKit Cloud** - Real-time audio/video infrastructure  
- **Web Speech API** - Browser-native STT/TTS

## �🚀 Quick Start
### Complete Setup Guide (5 Minutes)

**Prerequisites:**
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Python 3.10+ ([python.org](https://www.python.org))
- Git ([git-scm.com](https://git-scm.com))

**Step 1: Get Your API Keys** (2 minutes)
1. Create Google API Key at [ai.google.dev](https://ai.google.dev) → "Get API Key"
2. Create LiveKit account at [livekit.io](https://livekit.io) → Create project → Copy URL, API Key, Secret

**Step 2: Clone & Install** (1 minute)
```bash
# Clone the repository
git clone <your-repo-url>
cd AI\ Voice\ Agent

# Frontend setup
cd frontend
npm install

# Backend setup (new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Step 3: Configure Environment** (1 minute)
```bash
# In backend/ directory
cp .env.example .env

# Edit .env with your actual API keys:
# GOOGLE_API_KEY=AIzaSyD...
# LIVEKIT_URL=wss://your-project.livekit.cloud
# LIVEKIT_API_KEY=your-key
# LIVEKIT_API_SECRET=your-secret
```

**Step 4: Run** (1 minute)
```bash
# Terminal 1: Backend
cd backend
uvicorn app:app --reload
# Backend loads at http://localhost:8000

# Terminal 2: Frontend  
cd frontend
npm run dev
# Frontend loads at http://localhost:5173
```

**Step 5: Test**
- Open http://localhost:5173
- Click "Start Call" → allow microphone
- Click "Start Recording" → speak → "Stop Recording"
- Agent should respond with voice
### Local Development

#### Prerequisites
- Node.js 18+ (frontend)
- Python 3.10+ (backend)
- LiveKit account ([livekit.io](https://livekit.io))
- Google API key ([ai.google.dev](https://ai.google.dev))

#### Setup

1. **Clone & Install**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure Environment**
```bash
# Backend
cp .env.example .env
# Edit .env with your credentials

# Frontend (optional for local dev)
cp .env.example .env.local
# Set VITE_API_BASE=http://localhost:8000
```

3. **Run**
```bash
# Terminal 1: Backend
cd backend
uvicorn app:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

4. **Access**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### API Endpoints

| Method | Endpoint | Parameters | Purpose |
|--------|----------|------------|---------|
| GET | `/livekit-config` | None | Returns LiveKit WebRTC server URL |
| GET | `/token` | `room`, `identity` | Generates JWT token for LiveKit room access |
| POST | `/upload` | `file` (multipart) | Uploads PDF/TXT, chunks & indexes for RAG |
| POST | `/voice` | `text` (form data) | Processes query with RAG retrieval + LLM |
| POST | `/set_prompt` | `prompt` (JSON body) | Updates system prompt for LLM |

### Detailed Endpoint Specifications

#### 1. `/livekit-config` (GET)
Returns LiveKit server configuration for frontend.
```bash
curl http://localhost:8000/livekit-config
```
Response:
```json
{
  "livekit_url": "wss://your-livekit-server.livekit.cloud"
}
```

#### 2. `/token` (GET)
Generates LiveKit access token for secure room connection.
```bash
curl http://localhost:8000/token?room=voice-chat&identity=user-123
```
Response:
```json
{
  "token": "eyJhbGc..."
}
```

#### 3. `/upload` (POST)
Uploads documents and indexes them for RAG retrieval.
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@document.pdf"
```
Response:
```json
{
  "status": "success",
  "chunks_indexed": 15
}
```

#### 4. `/voice` (POST)
Main endpoint for text-based queries with RAG + LLM.
```bash
curl -X POST http://localhost:8000/voice \
  -F "text=What is covered in the uploaded documents?"
```
Response:
```json
{
  "reply": "The documents cover machine learning, natural language processing...",
  "rag_sources": [
    {
      "source": "document.pdf",
      "text": "Machine learning is a subset of artificial intelligence..."
    }
  ]
}
```

#### 5. `/set_prompt` (POST)
Updates the system prompt used by LLM.
```bash
curl -X POST http://localhost:8000/set_prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "You are a helpful assistant specializing in Python programming."
  }'
```
Response:
```json
{
  "status": "success",
  "prompt": "You are a helpful assistant specializing in Python programming."
}
```

### Use Case Examples

**Example 1: Document-Based Q&A**
1. Upload company handbook (PDF)
2. Ask "What's the vacation policy?"
3. System retrieves relevant sections and provides accurate answer with citations

**Example 2: Real-Time Voice Conversation**
1. Start voice call
2. Say: "Summarize the main topics"
3. Browser transcribes → API processes with RAG → Agent speaks answer back

**Example 3: Multi-Document Knowledge Base**
1. Upload multiple PDFs (docs, manuals, etc.)
2. Ask complex questions requiring cross-document information
3. RAG retrieves from multiple sources → LLM synthesizes answer

## 📦 Deployment

### Option 1: Vercel Frontend + Render Backend (Recommended)

See [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md) for fast setup.

**Benefits:**
- ✅ Unlimited execution time for backend
- ✅ Full WebSocket support
- ✅ Auto-deploy on git push
- ✅ No serverless limitations

### Option 2: Both on Vercel

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

**⚠️ Limitations:**
- 15-second timeout per request
- WebSocket limitations
- Not suitable for real-time audio

## 🔐 Environment Variables & API Keys

### Getting API Keys

#### 1. Google Generative AI (Gemini)
**Where to get it:**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key" → "Create API key in new project"
3. Copy the API key
4. Add to backend `.env`: `GOOGLE_API_KEY=your-key-here`

**What it's for:** Powers the LLM responses (Gemini 1.5 Flash model)

#### 2. LiveKit Cloud
**Where to get it:**
1. Go to [livekit.io](https://livekit.io)
2. Sign up for free account
3. Create a new project
4. Copy: **WebRTC URL**, **API Key**, **API Secret**
5. Add to backend `.env`:
   ```env
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your-api-key
   LIVEKIT_API_SECRET=your-api-secret
   ```

**What it's for:** Real-time WebRTC audio/video infrastructure

### Backend (.env)
```env
# Google Gemini API
GOOGLE_API_KEY=AIzaSyD...your-actual-key...

# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Optional: Logging level (DEBUG, INFO, WARNING, ERROR)
LOG_LEVEL=INFO
```

### Frontend (.env.local for local dev, or Vercel env vars for deployment)
```env
# Backend API endpoint
VITE_API_BASE=http://localhost:8000

# Or for production:
# VITE_API_BASE=https://your-backend-url.onrender.com
```

### Environment Variable Reference

| Variable | Location | Purpose | Example |
|----------|----------|---------|---------|
| `GOOGLE_API_KEY` | Backend | Gemini LLM API authentication | `AIzaSyD...` |
| `LIVEKIT_URL` | Backend | WebRTC server endpoint | `wss://project.livekit.cloud` |
| `LIVEKIT_API_KEY` | Backend | LiveKit API authentication | `API...` |
| `LIVEKIT_API_SECRET` | Backend | LiveKit API secret key | `secret...` |
| `VITE_API_BASE` | Frontend | Backend API base URL | `http://localhost:8000` |
| `LOG_LEVEL` | Backend (optional) | Logging verbosity | `DEBUG`, `INFO` |

## 📱 UI Features

### Header
- Start/Stop Voice Call button
- Start/Stop Recording button (when in call)
- Mute button (when agent speaking)
- Mobile hamburger menu

### Chat Area
- Live transcript with user/agent messages
- System messages for call status
- "Agent is thinking..." indicator
- "Listening..." indicator with interim speech

### Sidebar (Desktop) / Overlay (Mobile)
- System Prompt editor
- Document uploader (drag & drop)
- RAG Sources display

## 🎯 Usage Guide

1. **Upload Documents** (optional)
   - Drag PDFs/TXT files to "Knowledge Base" area
   - System chunks and indexes them

2. **Start Voice Call**
   - Click "Start Call" button
   - Allow microphone access

3. **Record Speech**
   - Click "Start Recording" button
   - Speak naturally
   - Click "Stop Recording" when done

4. **Agent Response**
   - Automatically sends transcript
   - LLM generates response with RAG context
   - Agent speaks response aloud
   - Click "Mute" to stop speaking

5. **Type Messages** (alternative)
   - Type in message input at bottom
   - Click "Send"
   - Get response with RAG context

## 🔄 Real-Time Audio Pipeline

```
User Speech
    ↓
Web Speech API (STT)
    ↓
Transcript (displayed live)
    ↓
Auto-send to /voice endpoint
    ↓
RAG Retrieval
    ↓
LLM Generation (Gemini)
    ↓
Browser SpeechSynthesis (TTS)
    ↓
Agent Speaks Response
```

## 📊 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── App.jsx                          # Main React component (chat UI)
│   │   ├── index.css                        # Tailwind directives
│   │   ├── main.jsx                         # React entry point
│   │   ├── services/
│   │   │   ├── livekitService.js            # LiveKit room connection & audio
│   │   │   ├── speechRecognitionService.js  # Browser STT (Web Speech API)
│   │   │   └── ttsService.js                # Browser TTS (SpeechSynthesis)
│   │   └── assets/                          # Static assets
│   ├── public/                              # Public files
│   ├── vercel.json                          # Vercel deployment config
│   ├── package.json                         # NPM dependencies
│   ├── vite.config.js                       # Vite configuration
│   ├── tailwind.config.js                   # Tailwind CSS config
│   ├── postcss.config.cjs                   # PostCSS config
│   └── .env.example                         # Environment template
│
├── backend/
│   ├── app.py                               # FastAPI server (main entry point)
│   ├── requirements.txt                     # Python dependencies
│   ├── .env.example                         # Environment template
│   ├── .gitignore                           # Git ignore rules
│   ├── services/
│   │   ├── __init__.py                      # Package marker
│   │   ├── rag_service.py                   # RAG: chunking & retrieval
│   │   ├── llm_service.py                   # LLM: Google Gemini integration
│   │   ├── livekit_agent.py                 # LiveKit agent worker (future)
│   │   ├── stt_service.py                   # STT placeholder (for future)
│   │   └── tts_service.py                   # TTS placeholder (for future)
│   ├── vercel.json                          # Vercel config (if deploying to Vercel)
│   └── render.yaml                          # Render deployment config
│
├── DEPLOYMENT_GUIDE.md                      # Comprehensive deployment guide
├── DEPLOYMENT_QUICK_START.md                # 5-minute quick start
├── README.md                                # This file
└── .gitignore                               # Top-level git ignore
```

## 🚨 Troubleshooting

### Frontend Issues

#### "Cannot connect to API"
**Symptoms:** "Error: Failed to fetch from /voice endpoint"

**Solutions:**
- Verify `VITE_API_BASE` environment variable is set in Vercel
- Check backend is running: `curl https://backend-url/livekit-config`
- Ensure backend URL doesn't have trailing slash
- Check browser console for CORS errors
- Verify frontend is calling correct API URL

#### "Microphone not working"
**Symptoms:** "Permission denied" or no audio input
**Solutions:**
- Browser permission: Settings → Privacy → Microphone → Allow
- Test microphone: Open browser DevTools → Console → `await navigator.mediaDevices.getUserMedia({audio: true})`
- Try different browser (Chrome has best support)
- Windows: Settings → Privacy & Security → Microphone

#### "No speech recognized"
**Symptoms:** Click "Start Recording" but nothing happens
**Solutions:**
- Browser compatibility: Chrome/Edge (best), Safari (good), Firefox (limited)
- Check microphone is active: try voice recording app
- Allow browser microphone permission
- Speak clearly and wait 1-2 seconds before stopping
- Check browser console for "not-allowed" error

#### "Agent not speaking"
**Symptoms:** Text appears but no audio output
**Solutions:**
- Check browser volume and speaker
- Test browser TTS: Open DevTools → Console → `window.speechSynthesis.speak(new SpeechSynthesisUtterance('hello'))`
- Click "Mute" button to reset TTS state
- Check browser supports SpeechSynthesis (most modern browsers do)
- Verify system isn't muting browser audio

### Backend Issues

#### "Backend returns 500 error"
**Symptoms:** API calls fail with HTTP 500
**Solutions:**
- Check backend logs: `tail -f backend.log`
- Verify environment variables are set: `echo $GOOGLE_API_KEY`
- Test basic endpoint: `curl http://localhost:8000/livekit-config`
- Ensure Python dependencies installed: `pip install -r requirements.txt`
- Try restarting backend: `uvicorn app:app --reload`

#### "Cannot upload document"
**Symptoms:** "File is empty or not readable" error
**Solutions:**
- Ensure file is .pdf or .txt (case-insensitive)
- Check file size is > 1 KB
- For PDFs: Ensure they contain extractable text (not scanned images)
- Try converting image-based PDF to text first
- Check backend has write permissions

#### "RAG returns no sources"
**Symptoms:** Uploaded documents not being retrieved
**Solutions:**
- Verify document was uploaded successfully: count returned chunks
- Check query matches document content (semantic matching)
- Try exact phrases from document
- For PDFs: Ensure text is selectable, not image-based
- Check RAG chunking size isn't too large/small

### LiveKit Issues

#### "WebSocket connection failed"
**Symptoms:** "Failed to connect to LiveKit room"
**Solutions:**
- Verify LiveKit credentials in .env: URL, API Key, Secret
- Test LiveKit connection: `curl $LIVEKIT_URL`
- If deployed to Vercel backend: Switch to Render (Vercel has timeout)
- If on Render: Check server logs
- Ensure LiveKit account is active and not expired

#### "Cannot generate token"
**Symptoms:** "401 Unauthorized" when requesting token
**Solutions:**
- Verify `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are correct
- Check they match your LiveKit project
- Ensure no extra whitespace in env variables
- Regenerate credentials in LiveKit dash if needed

### Deployment Issues

#### "Frontend builds but backend doesn't"
**Solutions:**
- Check all environment variables are set in deployment platform
- Verify Python 3.10+ is available
- Ensure `requirements.txt` is in correct directory
- Check build/start commands match platform

#### "Works locally but not on Vercel/Render"
**Solutions:**
- Check environment variables are identical
- Verify paths are correct (use absolute paths if needed)
- Check for OS-specific issues (Windows vs Linux line endings)
- Look at platform logs for specific errors
- Test with `curl` to isolate frontend vs backend

### Performance Issues

#### "Responses are slow"
**Solutions:**
- If using Render free tier: May have startup delay
- Check Google Gemini API rate limits
- Large RAG documents: Optimize chunking size
- Too many uploaded documents: Consider cleanup
- Monitor backend CPU/memory usage

#### "Transcript missing words"
**Solutions:**
- Speak more slowly/clearly
- Reduce background noise
- Check browser STT language setting
- Web Speech API can be inconsistent in some browsers

## 💡 Debug Mode

Enable verbose logging:
```bash
# Backend
export LOG_LEVEL=DEBUG
uvicorn app:app --reload

# Frontend
localStorage.setItem('DEBUG', 'voice-agent:*')
# Then reload browser
```

## 🔍 Getting Help

1. Check browser console for errors (F12)
2. Check backend logs: `tail -f app.log`
3. Test individual components:
   - STT: Open DevTools console, enable recording
   - TTS: Test `window.speechSynthesis` in console
   - API: `curl http://localhost:8000/livekit-config`
4. Create detailed issue with error messages and environment info

## 🧠 Core Components & Services

### Frontend Services

#### `speechRecognitionService.js`
Browser-based speech-to-text using Web Speech API.
- Automatic speech recognition
- Continuous listening with auto-restart
- Real-time interim transcript display
- Automatic submission on speech end

#### `ttsService.js`
Browser-based text-to-speech using SpeechSynthesis API.
- Configurable voice, rate, pitch, volume
- Auto-cancel previous utterance
- Pause/resume support
- Voice selection capability

#### `livekitService.js`
WebRTC connection management for real-time audio.
- Room management (connect/disconnect)
- Local audio track publishing
- Remote participant audio playback
- Connection status callbacks

### Backend Services

#### `llm_service.py`
Google Gemini LLM integration.
```python
class LLMService:
    - generate_reply(system_prompt, context, query)
    - Uses Google Generative AI API
    - Integrates RAG context injection
```

#### `rag_service.py`
Retrieval-Augmented Generation with semantic search.
```python
class RAGService:
    - ingest_text(text, source_name): Process & chunk documents
    - retrieve(query): Find relevant chunks via semantic search
    - Uses embedding-based similarity matching
```

#### `app.py` (FastAPI)
Main REST API server.
- 5 main endpoints (`/upload`, `/voice`, `/token`, `/set_prompt`, `/livekit-config`)
- CORS enabled for cross-origin access
- File upload handling (PDF + TXT)
- LiveKit token generation
- Modular service integration

## ⚙️ Customization

### Common Modifications

#### Change LLM Provider (from Google to OpenAI)
**Current:** Uses Google Gemini 1.5 Flash
**To switch to OpenAI/Claude:**
1. Update [backend/services/llm_service.py](backend/services/llm_service.py):
   ```python
   import anthropic
   # Replace generate_reply() to use Claude instead
   ```
2. Update `.env`: `OPENAI_API_KEY=sk-...`
3. Test: `/voice` endpoint should work with new LLM

#### Add User Authentication
**Current:** No authentication (public)
**To add login:**
1. Install: `pip install python-jose[cryptography]`
2. Update [backend/app.py](backend/app.py) with JWT middleware
3. Add auth check to `/voice`, `/upload` endpoints
4. Frontend: Add login form to App.jsx

#### Store Conversations (Persistence)
**Current:** In-memory only
**To add database:**
1. Install: `pip install SQLAlchemy`
2. Create models for conversations/messages
3. Update [backend/services/](backend/services/) to save to DB
4. Add `/history` endpoint to retrieve past conversations

#### Multi-Language Support
**Current:** STT supports multiple languages, TTS does too
**To improve:**
1. Add language selector to App.jsx UI
2. Update `speechRecognitionService.js`: `recognition.lang = selectedLanguage`
3. Add language preference to `/set_prompt` endpoint

#### Use Different STT/TTS
**Current:** Browser Web Speech API
**To use cloud services:**
1. **STT:** Replace with Azure Speech Services, Google Cloud STT, or Assembly AI
2. **TTS:** Replace with Azure Text-to-Speech, Google Cloud TTS, or ElevenLabs
3. Update service files in [frontend/src/services/](frontend/src/services/)

#### Add Advanced RAG Features
**Current:** Basic semantic chunking
**To improve retrieval:**
1. Install: `pip install sentence-transformers`
2. Add reranking: Keep top-10 chunks, rerank with cross-encoder
3. Add hybrid search: BM25 + semantic similarity
4. Updated [backend/services/rag_service.py](backend/services/rag_service.py)

### Code Examples

**Example: Add Authentication**
```python
# backend/app.py
from jwt import decode, encode
from datetime import datetime, timedelta

@app.post("/login")
async def login(username: str, password: str):
    # Your auth logic here
    token = encode(payload, SECRET_KEY)
    return {"token": token}

def verify_token(token: str):
    # Middleware to check token on protected routes
    payload = decode(token, SECRET_KEY)
    return payload
```

**Example: Save Conversations to DB**
```python
# backend/models.py
from sqlalchemy import Column, String, DateTime
from datetime import datetime

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True)
    user_id = Column(String)
    message = Column(String)
    reply = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
```

## 🔜 Roadmap

### Phase 1: MVP (Current) ✅
- [x] Web Speech API STT
- [x] Browser SpeechSynthesis TTS
- [x] Google Gemini LLM
- [x] PDF/TXT upload & RAG
- [x] LiveKit WebRTC integration
- [x] Mobile responsive UI
- [x] Real-time transcript display
- [x] System prompt customization

### Phase 2: Enhancement (Next)
- [ ] Conversation history persistence (SQLite/Firebase)
- [ ] User authentication (OAuth/JWT)
- [ ] Multi-room concurrent sessions
- [ ] Voice model selection (different TTS voices)
- [ ] Chat history export (PDF/JSON)
- [ ] Custom OpenAI/Azure API support
- [ ] Streaming LLM responses

### Phase 3: Advanced (Future)
- [ ] Real-time agent audio (full audio streaming in call)
- [ ] Fine-tuned prompts & models
- [ ] Advanced RAG (reranking, hybrid search)
- [ ] Analytics dashboard
- [ ] Admin panel for multi-tenant
- [ ] Database archival & cleanup
- [ ] Rate limiting & quotas
- [ ] Webhook integrations

### Phase 4: Production (Enterprise)
- [ ] Load balancing & auto-scaling
- [ ] Advanced monitoring & alerting
- [ ] Compliance (GDPR, HIPAA)
- [ ] Multi-language support
- [ ] Custom branding
- [ ] White-label deployment
- [ ] SLA & support tiers

## 📄 License

MIT - Feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- 🐛 **Bug fixes**: Report issues with reproduction steps
- ✨ **Features**: New capabilities matching the roadmap
- 📚 **Documentation**: Improvements to guides & comments
- ⚡ **Performance**: Optimization of RAG, LLM, or UI
- 🧪 **Tests**: Unit & integration test coverage
- 🌍 **Localization**: Multi-language support

## 📞 Support

- **Documentation**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: GitHub Issues for bugs & feature requests
- **Discussions**: GitHub Discussions for questions & ideas

---

**Built with ❤️ using React, FastAPI, and LiveKit**
