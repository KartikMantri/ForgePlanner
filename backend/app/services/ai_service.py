"""
AI Service — Gemini 2.0 Flash (primary) + Groq Llama-3.3-70B (fallback)

Required env vars:
  GEMINI_API_KEY   — from https://aistudio.google.com/apikey (free)
  GROQ_API_KEY     — from https://console.groq.com/keys (free)

Install:
  pip install google-generativeai groq
"""

import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lazy client initialisation (avoids import-time failures if key is missing)
# ---------------------------------------------------------------------------

def _get_gemini_client():
    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel("gemini-2.0-flash")
    except Exception as e:
        logger.warning(f"Gemini client init failed: {e}")
        return None


def _get_groq_client():
    try:
        from groq import Groq  # type: ignore
        return Groq(api_key=settings.GROQ_API_KEY)
    except Exception as e:
        logger.warning(f"Groq client init failed: {e}")
        return None


# ---------------------------------------------------------------------------
# Core generate function with Gemini → Groq fallback
# ---------------------------------------------------------------------------

async def generate_text(
    prompt: str,
    system_prompt: str = "You are a helpful AI assistant for Forge, a personal goal tracking app.",
    max_tokens: int = 1024,
) -> str:
    """
    Try Gemini 2.0 Flash first.  If it fails (quota, key missing, network),
    automatically fall back to Groq llama-3.3-70b-versatile.
    Returns the generated text string.
    Raises RuntimeError if both providers fail.
    """
    # ── Gemini ──────────────────────────────────────────────────────────────
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai  # type: ignore
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction=system_prompt,
            )
            response = model.generate_content(
                prompt,
                generation_config={"max_output_tokens": max_tokens},
            )
            return response.text
        except Exception as e:
            logger.warning(f"Gemini failed, falling back to Groq: {e}")

    # ── Groq fallback ────────────────────────────────────────────────────────
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq  # type: ignore
            client = Groq(api_key=settings.GROQ_API_KEY)
            chat = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": prompt},
                ],
                max_tokens=max_tokens,
            )
            return chat.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq also failed: {e}")
            raise RuntimeError(f"Both AI providers failed. Last error: {e}")

    raise RuntimeError(
        "No AI API keys configured. Set GEMINI_API_KEY or GROQ_API_KEY in .env"
    )


# ---------------------------------------------------------------------------
# Feature-specific AI functions
# ---------------------------------------------------------------------------

SYSTEM_FORGE = (
    "You are an AI assistant embedded in Forge, a personal goal and DSA learning tracker. "
    "Be concise, practical, and encouraging. Avoid spoiling complete solutions."
)
