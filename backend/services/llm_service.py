import asyncio
import os
import google.generativeai as genai

class LLMService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

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
            response = await asyncio.to_thread(self.model.generate_content, full_prompt)
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}"
