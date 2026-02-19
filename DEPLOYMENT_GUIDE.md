# Deployment Guide: Voice AI Agent to Vercel

## Overview

You have two deployment options:

### Option 1: Both Frontend & Backend on Vercel (Faster Setup)
- ⚠️ **Limitations**: Backend has 15-second timeout, WebSocket/LiveKit streaming limited
- ✅ Single platform, easier to manage
- Suitable if: You only need text-based queries (current `/voice` endpoint)

### Option 2: Frontend on Vercel + Backend on Render/Railway (Recommended) ⭐
- ✅ **No limitations**: Full WebSocket support, unlimited execution time
- Better for: Real-time voice agent, background processes
- Slightly more complex: Two platforms

---

## Step 1: Prepare Your Code for Git

### 1.1 Initialize Git (if not already done)
```bash
cd c:\Users\chatr\Documents\AI Voice Agent
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `AI-Voice-Agent`
3. Don't add .gitignore or README (you have them)
4. Copy the repository URL
5. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/AI-Voice-Agent.git
git branch -M main
git push -u origin main
```

---

## OPTION 1: Deploy Both to Vercel

### Step 2A: Frontend Deployment to Vercel

**2A.1 Connect to Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Click "Log in with GitHub" (or sign up)
3. Click "New Project"
4. Select your `AI-Voice-Agent` repository
5. Leave default settings and click "Deploy"

**2A.2 Set Frontend Environment Variables:**
1. In Vercel dashboard, go to your project settings
2. Click "Environment Variables"
3. Add these variables:
   ```
   VITE_API_BASE=https://your-backend-url.vercel.app
   ```
   (You'll set the backend URL after deploying it)

**2A.3 Update Frontend API_BASE:**
In `frontend/src/App.jsx`, change:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
```

---

### Step 2B: Backend Deployment to Vercel (Limited)

**⚠️ WARNING: These limitations apply:**
- 15-second execution timeout
- WebSockets work but with limitations
- Background subprocess won't work
- LiveKit audio streaming may timeout

**2B.1 Create Vercel Backend Configuration:**

Create `vercel.json` in backend root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ],
  "env": {
    "LIVEKIT_URL": "@LIVEKIT_URL",
    "LIVEKIT_API_KEY": "@LIVEKIT_API_KEY",
    "LIVEKIT_API_SECRET": "@LIVEKIT_API_SECRET",
    "GOOGLE_API_KEY": "@GOOGLE_API_KEY"
  }
}
```

**2B.2 Modify `backend/app.py` for Vercel:**

Remove the subprocess agent startup since it won't work in serverless:

```python
# Remove or comment out this section:
# if __name__ == "__main__":
#     agent_script = os.path.join(...)
#     agent_proc = subprocess.Popen(...)
```

**2B.3 Deploy:**
1. In Vercel dashboard, create a new project from the same repo
2. Set Root Directory to `backend/`
3. Skip Build Step (FastAPI doesn't need build)
4. Add Environment Variables:
   - `LIVEKIT_URL`: Your LiveKit URL
   - `LIVEKIT_API_KEY`: Your API key
   - `LIVEKIT_API_SECRET`: Your API secret
   - `GOOGLE_API_KEY`: Your Google API key
5. Click "Deploy"

**2B.4 Get Backend URL:**
After deployment, copy your Vercel URL (e.g., `https://ai-voice-agent.vercel.app`)

**2B.5 Update Frontend:**
In Vercel frontend project settings, update Environment Variables:
```
VITE_API_BASE=https://ai-voice-agent-backend.vercel.app
```

---

## OPTION 2: Frontend on Vercel + Backend on Render (Recommended)

### Step 2: Frontend to Vercel (Same as Option 1)

### Step 3: Backend to Render

**3.1 Create Render Account:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Grant repository access

**3.2 Deploy Backend:**
1. Click "New +" → "Web Service"
2. Select your `AI-Voice-Agent` repository
3. Configure:
   - **Name**: `ai-voice-agent-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `.` (blank for root)
4. Click "Create Web Service"

**3.3 Add Environment Variables on Render:**
1. In Render dashboard, go to your service
2. Click "Environment"
3. Add:
   ```
   LIVEKIT_URL=wss://ai-voice-agent-q263s6bf.livekit.cloud
   LIVEKIT_API_KEY=APIQYAtrB33vEFT
   LIVEKIT_API_SECRET=9PyucputUV4DCVPF4vwmWx5QbQOAe1cUu9fInArpJux
   GOOGLE_API_KEY=AIzaSyAwtnSCRAZBtbjvdrOC0F0iyBfpZwHT6CE
   ```

**3.4 Get Backend URL:**
Your Render URL will be like: `https://ai-voice-agent-api.onrender.com`

**3.5 Update Frontend on Vercel:**
1. In Vercel, update environment variable:
   ```
   VITE_API_BASE=https://ai-voice-agent-api.onrender.com
   ```
2. Redeploy frontend

---

## Step 4: Verify Deployment

### Frontend Test:
1. Visit your Vercel frontend URL
2. Should load the Voice AI interface

### Backend Test:
```bash
curl https://your-backend-url/livekit-config
```
Should return:
```json
{"livekit_url": "wss://ai-voice-agent-q263s6bf.livekit.cloud"}
```

### Full Integration Test:
1. Start voice call in UI
2. Record speech
3. Should transcribe and get LLM response with TTS

---

## Step 5: Custom Domain (Optional)

### Add Domain to Vercel:
1. Vercel dashboard → Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Add Domain to Render:
1. Render dashboard → Service → Settings → Custom Domain
2. Add your domain
3. Follow DNS instructions

---

## Recommended Setup Summary

| Component | Service | Why |
|-----------|---------|-----|
| Frontend (React/Vite) | **Vercel** | Native support, auto-deploy on push |
| Backend (FastAPI) | **Render** | Full Python support, WebSocket, no timeout limit |
| Database | None yet | Consider Firebase/MongoDB for persistence |
| Voice Agent | Backend | Runs as subprocess, full audio streaming |

---

## Troubleshooting

### "Backend URL not working"
- Check backend logs in Vercel/Render dashboard
- Verify environment variables are set
- Test endpoint: `/livekit-config`

### "CORS errors"
- Backend already has `CORSMiddleware` configured
- Make sure frontend URL is included in CORS origins

### "WebSocket connection failed"
- If on Vercel: Upgrade to Pro (Vercel serverless has WebSocket limits)
- If on Render: WebSockets work fine

### "Agent not responding"
- On Vercel: Agent subprocess won't start in serverless
- Solution: Use Render or other dedicated server

---

## Cleanup Before Deployment

```bash
# Remove environment file from git
git rm --cached backend/.env
echo ".env" >> backend/.gitignore
git add backend/.gitignore
git commit -m "Remove .env from tracking"
git push
```

---

## Environment Variables Safe Storage

**NEVER commit your .env file!** Instead:

1. Create a `backend/.env.example`:
```
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
GOOGLE_API_KEY=your-google-key
```

2. Add to git:
```bash
git add backend/.env.example
git commit -m "Add env example"
git push
```

3. Users follow the guide:
   - Copy `.env.example` to `.env`
   - Fill in their values

---

## Next Steps After Deployment

1. **Monitor**: Check Vercel/Render logs for errors
2. **Test**: Verify all features work in production
3. **Iterate**: Push changes, auto-deploy happens
4. **Scale**: Add database for persistence, if needed
5. **Security**: Hide API keys, use environment secrets

---

## Questions?

Common issues:
- Frontend builds but can't connect to backend → Update VITE_API_BASE
- Backend error 404 → Check Start Command path
- WebSocket timeout → Use Render instead of Vercel for backend
