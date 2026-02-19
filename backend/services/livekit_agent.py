import logging
from livekit.agents import JobContext, WorkerOptions, cli, llm
from livekit.agents.llm import ChatContext, ChatMessage
from livekit.plugins import openai, google
from rag_service import RAGService

# Setup logger
logger = logging.getLogger("voice-agent")
logger.setLevel(logging.INFO)

# Global RAG instance (in production, this might be a singleton or DB-backed)
rag_service = RAGService()

async def entrypoint(ctx: JobContext):
    """
    The main entry point for the LiveKit agent worker.
    This orchestrates the STT -> RAG -> LLM -> TTS pipeline.
    """
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect()

    # Define the initial chat context with system prompt
    initial_message = "You are a real-time conversational AI voice assistant. Use KB context first."
    
    chat_context = ChatContext(
        messages=[
            ChatMessage(
                role="system",
                content=initial_message
            )
        ]
    )

    # Process user speech and inject RAG context
    async def process_user_speech(msg: ChatMessage):
        """
        Hook called when user finishes speaking.
        We use this to perform RAG and inject context before the LLM generates a response.
        """
        query = msg.content
        logger.info(f"User said: {query}")
        
        # Retrieve context from RAG service
        chunks = rag_service.retrieve(query)
        if chunks:
            context_str = "\n".join([c['text'] for c in chunks])
            rag_instruction = f"\n\nContext from documents:\n{context_str}"
            # Add context to chat
            chat_message = ChatMessage(role="system", content=rag_instruction)
            chat_context.messages.append(chat_message)

    # Create LLM instance
    llm_instance = google.LLM(model="gemini-3-flash-preview")
    
    # Create speech-to-text instance
    stt_instance = openai.STT()
    
    # Create text-to-speech instance
    tts_instance = google.TTS()
    
    # Start with initial greeting
    await ctx.say("Hello! I am connected and ready to help. How can I assist you today?")
    
    # Note: Full agent pipeline would require integrating with LiveKit's agent framework
    # This is a simplified structure. For production, you'd typically use:
    # - ctx.room to handle room events
    # - Custom handler for processing audio and managing the conversation flow

if __name__ == "__main__":
    # This allows running the agent as a standalone worker: 
    # python services/livekit_agent.py dev
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))