import os
import json
import math
import requests
from dotenv import load_dotenv

load_dotenv()

# Configure Groq API Key and endpoint
api_key = os.getenv("GROQ_API_KEY") or ""
if api_key:
    print("Groq API Client Successfully Initialized via Llama 3.1")
else:
    print("WARNING: GROQ_API_KEY environment variable is missing. Running in simulator-mode.")

class GeminiClient:
    """
    Alias wrapper retaining original class naming conventions to avoid refactoring python route files, 
    but executing actions strictly via the high-performance Groq completions API.
    """
    @staticmethod
    def is_configured() -> bool:
        return bool(api_key)

    @staticmethod
    def generate_text(prompt: str, system_instruction: str = None) -> str:
        """General text generator using Groq's llama-3.1-8b-instant model."""
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured")
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 4096
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=20)
            response.raise_for_status()
            result_json = response.json()
            return result_json["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Groq API call error: {e}")
            raise e

    @staticmethod
    def generate_json(prompt: str, system_instruction: str = None) -> dict:
        """Structured JSON generator using Groq's llama-3.1-8b-instant JSON mode."""
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": messages,
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=20)
            response.raise_for_status()
            result_json = response.json()
            text_content = result_json["choices"][0]["message"]["content"]
            return json.loads(text_content)
        except Exception as e:
            print(f"JSON Parsing failed on Groq Output: {e}")
            # Robust fallback extractor if raw load fails
            import re
            try:
                cleaned = re.search(r"\{.*\}", text_content, re.DOTALL)
                if cleaned:
                    return json.loads(cleaned.group(0))
            except Exception:
                pass
            raise e


