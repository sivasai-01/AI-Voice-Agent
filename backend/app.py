import os
import asyncio
import subprocess
import sys
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from livekit import api
import uvicorn
from pypdf import PdfReader
import io

# Import modular services
from services.rag_service import RAGService
from services.llm_service import LLMService

load_dotenv()

app = FastAPI(title="Voice AI Orchestrator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared System Prompt and RAG service
system_prompt_storage = {
    "current": "You are a real-time conversational AI voice assistant. Speak naturally and concisely. Use KB context first when available. Do not hallucinate."
}

rag_service = RAGService()
llm_service = LLMService()

class PromptUpdate(BaseModel):
    prompt: str

@app.post("/set_prompt")
async def set_prompt(data: PromptUpdate):
    system_prompt_storage["current"] = data.prompt
    return {"status": "success", "prompt": data.prompt}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = ""
        
        # Check if it's a PDF
        if file.filename.lower().endswith('.pdf'):
            try:
                pdf_file = io.BytesIO(content)
                pdf_reader = PdfReader(pdf_file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            except Exception as pdf_err:
                raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(pdf_err)}")
        else:
            # Try to decode as UTF-8, ignoring invalid characters
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                text = content.decode("utf-8", errors="ignore")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="File is empty or not readable. Please upload a valid text or PDF file.")
        
        num_chunks = await rag_service.ingest_text(text, file.filename)
        return {"status": "success", "chunks_indexed": num_chunks}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint for Render."""
    return {"status": "ok"}

@app.get("/livekit-config")
async def get_livekit_config():
    """Return LiveKit config for the frontend."""
    return {
        "livekit_url": os.getenv('LIVEKIT_URL', 'ws://localhost:7880')
    }

@app.get("/token")
async def get_token(room: str, identity: str):
    """Generates a LiveKit token for the frontend to connect."""
    token = api.AccessToken(
        os.getenv('LIVEKIT_API_KEY'),
        os.getenv('LIVEKIT_API_SECRET')
    ).with_identity(identity).with_grants(api.VideoGrants(
        room_join=True,
        room=room,
    ))
    return {"token": token.to_jwt()}

@app.post("/voice")
async def voice_query(text: str = Form(...)):
    """Simulated voice/text interaction endpoint for UI components."""
    # 1. Retrieve Context
    context_chunks = rag_service.retrieve(text)
    context_text = "\n".join([c['text'] for c in context_chunks])
    
    # 2. Get LLM Reply
    reply = await llm_service.generate_reply(
        system_prompt_storage["current"],
        context_text,
        text
    )
    
    return {
        "reply": reply,
        "rag_sources": context_chunks
    }

if __name__ == "__main__":
    # Ensure environment variables are set
    required_vars = ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "GOOGLE_API_KEY"]
    for var in required_vars:
        if not os.getenv(var):
            print(f"Warning: {var} is not set in environment.")
    
    # Get port from environment (Render sets $PORT, default to 8000 for local)
    port = int(os.getenv("PORT", 8000))
    
    # Start the LiveKit agent as a subprocess (non-blocking)
    # This uses the same Python interpreter and runs services/livekit_agent.py with the
    # 'dev' argument (matching how you'd run it manually).
    agent_script = os.path.join(os.path.dirname(__file__), "services", "livekit_agent.py")
    if os.path.exists(agent_script):
        try:
            print("Starting LiveKit agent subprocess...")
            subprocess.Popen([sys.executable, agent_script, "dev"], cwd=os.path.dirname(__file__))
        except Exception as e:
            print(f"Failed to start LiveKit agent subprocess: {e}")
            # Continue anyway - the API will still work
    else:
        print(f"LiveKit agent script not found at {agent_script}; skipping agent startup.")

    uvicorn.run(app, host="0.0.0.0", port=port)