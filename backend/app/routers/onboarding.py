# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.resource_service import ResourceService
from app.services.ai_service import analyze_goal_plan

router = APIRouter(prefix="/api/v1/onboarding", tags=["onboarding"])

class ParseUrlRequest(BaseModel):
    url: str

class AnalyzeRequest(BaseModel):
    context_text: str
    milestones: list
    availability: dict

@router.post("/parse-url")
async def parse_url(request: ParseUrlRequest):
    try:
        text = await ResourceService.extract_text_from_url(request.url)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/parse-file")
async def parse_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if file.filename and file.filename.endswith(".pdf"):
            text = await ResourceService.extract_text_from_pdf(content)
        else:
            text = content.decode("utf-8")[:15000]
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze")
async def analyze_timeline(request: AnalyzeRequest):
    try:
        # Map frontend shape to ai_service signature
        availability_mapped = {
            "hours_per_day": request.availability.get("hoursPerDay", 2),
            "days": ["Mon", "Tue", "Wed", "Thu", "Fri"][:request.availability.get("days", 5)],
        }
        result = await analyze_goal_plan(
            goal_title="Learning Goal",
            category="DSA",
            deadline="90 days from now",
            availability=availability_mapped,
            milestones=request.milestones,
            resources=[{"title": "Uploaded resource", "file_type": "text"}] if request.context_text else [],
        )
        # Map result to what frontend expects: score, verdict, advice
        feasibility_text = result.get("feasibility", "")
        score = 80  # Default reasonable score
        if "unrealistic" in feasibility_text.lower() or "too ambitious" in feasibility_text.lower():
            score = 40
        elif "aggressive" in feasibility_text.lower() or "challenging" in feasibility_text.lower():
            score = 62
        elif "achievable" in feasibility_text.lower() or "reasonable" in feasibility_text.lower():
            score = 82
        verdict = "Highly Achievable" if score >= 80 else ("Aggressive" if score >= 60 else "Unrealistic")
        plan_text = result.get("plan", "")
        risks_text = " ".join(result.get("risks", []))
        advice = f"{feasibility_text} {plan_text}".strip()[:300]
        return {"score": score, "verdict": verdict, "advice": advice or "Your plan looks good!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

