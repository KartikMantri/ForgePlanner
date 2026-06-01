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


async def get_dsa_hint(problem_title: str, approach_notes: str = "") -> str:
    """
    Give a nudge hint for a DSA problem without spoiling the full solution.
    """
    notes_context = f"\nUser's current notes: {approach_notes}" if approach_notes else ""
    prompt = (
        f"The user is stuck on the LeetCode/DSA problem: '{problem_title}'.{notes_context}\n\n"
        "Give ONE short, directional hint (2-3 sentences max) that points them toward "
        "the right approach without revealing the full algorithm or code. "
        "Ask a guiding question if helpful."
    )
    return await generate_text(prompt, system_prompt=SYSTEM_FORGE, max_tokens=256)


async def review_approach(problem_title: str, approach_notes: str) -> str:
    """
    Review the user's approach to a DSA problem and suggest improvements.
    """
    prompt = (
        f"Problem: '{problem_title}'\n"
        f"User's approach:\n{approach_notes}\n\n"
        "Review this approach. Point out:\n"
        "1. What's correct / on the right track\n"
        "2. Potential edge cases they might have missed\n"
        "3. Time/space complexity if they haven't mentioned it\n"
        "4. One concrete suggestion to improve or simplify\n"
        "Keep the review under 200 words."
    )
    return await generate_text(prompt, system_prompt=SYSTEM_FORGE, max_tokens=400)



async def analyze_goal_plan(
    goal_title: str,
    category: str,
    deadline: str,
    availability: dict,
    milestones: list[dict],
    resources: list[dict],
) -> dict:
    """
    Onboarding wizard Step 5: feasibility + plan generation.
    Returns a dict with keys: feasibility, plan, risks, resource_coverage.
    """
    hours_per_day = availability.get("hours_per_day", 2)
    days = availability.get("days", ["Mon", "Tue", "Wed", "Thu", "Fri"])
    days_per_week = len(days)

    milestones_text = "\n".join(
        f"- {m.get('title', 'Untitled')} (due: {m.get('target_date', 'TBD')})"
        for m in milestones
    )
    resources_text = "\n".join(
        f"- {r.get('title', 'Resource')} ({r.get('file_type', 'link')})"
        for r in resources
    ) or "None uploaded yet"

    prompt = (
        f"Goal: '{goal_title}' (Category: {category})\n"
        f"Deadline: {deadline}\n"
        f"Availability: {hours_per_day}h/day, {days_per_week} days/week\n\n"
        f"Milestones:\n{milestones_text}\n\n"
        f"Resources uploaded:\n{resources_text}\n\n"
        "Provide a JSON object with these 4 keys:\n"
        "1. feasibility (string): 1-2 sentence assessment of whether the goal is achievable\n"
        "2. plan (string): A brief weekly breakdown suggestion\n"
        "3. risks (list of strings): 2-3 risk flags\n"
        "4. resource_coverage (string): Which milestones the uploaded resources cover\n"
        "Return ONLY valid JSON, no markdown fences."
    )
    raw = await generate_text(prompt, system_prompt=SYSTEM_FORGE, max_tokens=600)

    # Parse JSON response, fall back to raw text if malformed
    import json
    try:
        # Strip potential markdown code fences
        cleaned = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "feasibility": raw,
            "plan": "",
            "risks": [],
            "resource_coverage": "",
        }
