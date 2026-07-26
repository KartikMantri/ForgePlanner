# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.resource_service import ResourceService

router = APIRouter(prefix="/api/v1/onboarding", tags=["onboarding"])

class ParseUrlRequest(BaseModel):
    url: str

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

