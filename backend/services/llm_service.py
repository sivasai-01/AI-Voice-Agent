import asyncio
import os
from google import genai

class LLMService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        self.client = genai.Client(api_key=api_key)

    async def generate_reply(self, system_prompt: str, context: str, user_query: str):
        full_prompt = f"""
{system_prompt}

RELEVANT CONTEXT FROM DOCUMENTS:
{context if context else "No relevant context found."}

USER QUESTION:
{user_query}

REPLY:
"""
        try:
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model='gemini-3-flash-preview',
                contents=full_prompt,
            )
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}"
