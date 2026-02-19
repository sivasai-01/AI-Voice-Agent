# AI Voice Agent - Deployment Quick Start

## 📋 Prerequisites

- GitHub account
- Vercel account (vercel.com)
- Render account (render.com) - for backend (recommended)
- LiveKit credentials
- Google API key

## 🚀 Quick Deployment Steps

### Option A: Frontend on Vercel + Backend on Render (Recommended)

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/AI-Voice-Agent.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Framework: Vite (auto-detected)
5. Root Directory: `frontend`
6. Add Environment Variable:
   ```
   VITE_API_BASE=https://your-backend-url.onrender.com
   ```
   (Get this after deploying backend)
7. Click "Deploy"

#### Step 3: Deploy Backend to Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Configure:
   - **Start Command**: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `.`
5. Add Environment Variables (in Render dashboard):
   ```
   LIVEKIT_URL=wss://your-livekit-url
   LIVEKIT_API_KEY=your-api-key
   LIVEKIT_API_SECRET=your-api-secret
   GOOGLE_API_KEY=your-google-api-key
   ```
6. Click "Create Web Service"
7. Copy the service URL (e.g., `https://ai-voice-agent-api.onrender.com`)

#### Step 4: Update Frontend URL
1. Go to Vercel project settings
2. Update Environment Variable:
   ```
   VITE_API_BASE=https://ai-voice-agent-api.onrender.com
   ```
3. Redeploy (or wait for auto-redeploy on next push)

#### Step 5: Test
- Visit your Vercel frontend URL
- Start a voice call
- Record speech → Should hear agent response

---

### Option B: Both on Vercel (Faster but Limited)

⚠️ **Not recommended** - WebSocket/real-time features limited to 15 seconds

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📁 Project Structure

```
├── frontend/              # React + Vite
│   ├── src/
│   ├── vercel.json       # Vercel config
│   └── .env.example      # Environment template
├── backend/              # FastAPI
│   ├── app.py           # Main server
│   ├── requirements.txt  # Python dependencies
│   ├── services/
│   ├── vercel.json      # Vercel config (if using Vercel)
│   └── .env.example     # Environment template
├── DEPLOYMENT_GUIDE.md   # Full deployment guide
└── README.md
```

---

## 🔐 Secrets Management

**Never commit `.env` files!**

For local development:
```bash
# Create from template
cp backend/.env.example backend/.env
# Edit with your values
nano backend/.env
```

For production:
- Vercel: Settings → Environment Variables
- Render: Environment tab in service settings

---

## 📊 Recommended Architecture

| Component | Service | Auto-Deploy |
|-----------|---------|-------------|
| Frontend | Vercel | ✅ On git push |
| Backend | Render | ✅ On git push |
| Database | Firebase/MongoDB | - |

---

## 🔗 Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

## ❓ Troubleshooting

**Frontend shows "Cannot connect to API"**
- Check `VITE_API_BASE` environment variable in Vercel
- Verify backend service is running on Render
- Test backend with: `curl https://your-backend-url/livekit-config`

**Backend gives 500 errors**
- Check Render logs
- Verify all environment variables are set
- Ensure `requirements.txt` is in backend directory

**Voice features not working**
- On Vercel backend: Not supported (serverless timeout)
- On Render backend: Should work fine
- Check browser console for errors

---

## ✨ Features Deployed

- ✅ Real-time voice transcription (Web Speech API)
- ✅ LLM responses (Google Gemini)
- ✅ Text-to-speech (Browser SpeechSynthesis)
- ✅ Document upload (PDF, TXT)
- ✅ RAG-based context retrieval
- ✅ Live chat transcript
- ✅ Mobile responsive UI
- ✅ Responsive buttons and layouts

---

## 🎯 Next Steps

After deployment:
1. Monitor: Check logs for errors
2. Optimize: Add database for persistence
3. Scale: Upgrade Render plan if needed
4. Enhance: Add authentication
5. Domain: Connect custom domain

**For detailed step-by-step instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**
