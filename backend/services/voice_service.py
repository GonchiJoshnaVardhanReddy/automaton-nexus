"""
Voice Service - Sarvam TTS Integration (with mock fallback)
Handles Text-to-Speech conversion for multilingual support
"""

import os
import aiohttp
import asyncio
from typing import Optional
import base64
import uuid

# Mock mode for demo
MOCK_MODE = os.environ.get("TTS_MOCK_MODE", "true").lower() == "true"


class VoiceService:
    """Service for TTS using Sarvam API"""
    
    def __init__(self):
        self.api_key = os.environ.get("SARVAM_API_KEY")
        self.base_url = "https://api.sarvam.ai/v1"
        
        # Language to voice mapping
        self.voice_map = {
            "english": "en-IN-NeerjaNeural",
            "hindi": "hi-IN-SwaraNeural",
            "kannada": "kn-IN-SapnaNeural",
            "marathi": "mr-IN-AarohiNeural"
        }
    
    async def text_to_speech(
        self,
        text: str,
        language: str = "english",
        voice_type: str = "professional_female"
    ) -> dict:
        """Convert text to speech"""
        
        if MOCK_MODE:
            return self._mock_tts(text, language)
        
        voice = self.voice_map.get(language.lower(), self.voice_map["english"])
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "text": text,
                "voice": voice,
                "language": language,
                "format": "mp3"
            }
            
            async with session.post(
                f"{self.base_url}/tts",
                json=payload,
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "audio_url": data.get("audio_url"),
                        "duration_ms": data.get("duration_ms", 0)
                    }
                else:
                    return {
                        "success": False,
                        "error": await response.text()
                    }
    
    async def speech_to_text(
        self,
        audio_data: bytes,
        language: str = "english"
    ) -> dict:
        """Convert speech to text (STT)"""
        
        if MOCK_MODE:
            return self._mock_stt(language)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            data = aiohttp.FormData()
            data.add_field('audio', audio_data, content_type='audio/wav')
            data.add_field('language', language)
            
            async with session.post(
                f"{self.base_url}/stt",
                data=data,
                headers=headers
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return {
                        "success": True,
                        "text": result.get("text", ""),
                        "confidence": result.get("confidence", 0.0)
                    }
                else:
                    return {
                        "success": False,
                        "error": await response.text()
                    }
    
    def _mock_tts(self, text: str, language: str) -> dict:
        """Mock TTS for demo - returns a placeholder"""
        
        # In a real scenario, this would return an actual audio URL
        # For demo, we just return metadata
        audio_id = str(uuid.uuid4())[:8]
        
        # Estimate duration (rough: 150 words per minute, ~5 chars per word)
        word_count = len(text) / 5
        duration_ms = int((word_count / 150) * 60 * 1000)
        
        return {
            "success": True,
            "audio_url": f"/api/audio/{audio_id}.mp3",
            "duration_ms": max(duration_ms, 1000),  # Minimum 1 second
            "text": text,
            "language": language,
            "mock": True
        }
    
    def _mock_stt(self, language: str) -> dict:
        """Mock STT for demo"""
        
        # Sample responses for demo
        sample_responses = [
            "Yes, please confirm my order",
            "No, I want to cancel",
            "Can you repeat that?",
            "Thank you, that's all"
        ]
        
        import random
        return {
            "success": True,
            "text": random.choice(sample_responses),
            "confidence": 0.95,
            "mock": True
        }


# Singleton instance
voice_service = VoiceService()
