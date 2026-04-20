from fastapi import FastAPI, Depends, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, PlainTextResponse
from typing import List
from sqlalchemy.orm import Session

import models, schemas, database, latex_generator
import os
import logging
from slowapi import Limiter
from slowapi.util import get_remote_address

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Resume Builder API")

# Setup Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Setup CORS for the frontend
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/resume", response_model=schemas.ResumeResponse)
def create_resume(resume: schemas.ResumeCreate, db: Session = Depends(database.get_db)):
    db_resume = models.Resume(
        name=resume.name,
        email=resume.email,
        phone=resume.phone,
        linkedin=resume.linkedin,
        github=resume.github,
        location=resume.location,
        summary=resume.summary,
        experience=[exp.model_dump() for exp in resume.experience],
        projects=[proj.model_dump() for proj in resume.projects],
        skills=[skill.model_dump() for skill in resume.skills],
        education=[edu.model_dump() for edu in resume.education]
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

@app.get("/api/resume/{resume_id}", response_model=schemas.ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(database.get_db)):
    db_resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if db_resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    return db_resume

import hashlib
import json

MAX_PDF_SIZE = 10 * 1024 * 1024  # 10 MB
pdf_cache = {} # Simple in-memory cache

def get_cache_key(data: dict) -> str:
    # Use a stable JSON representation for the cache key
    return hashlib.md5(json.dumps(data, sort_keys=True, default=str).encode()).hexdigest()

@app.post("/api/generate-pdf")
@limiter.limit("5/minute")
def generate_pdf(request: Request, resume: schemas.ResumeCreate):
    """
    Generates a PDF on-the-fly and returns the binary stream.
    """
    data = resume.model_dump()
    key = get_cache_key(data)
    
    if key in pdf_cache:
        logger.info("Returning cached PDF")
        return Response(content=pdf_cache[key], media_type="application/pdf")

    try:
        latex_source = latex_generator.generate_latex_source(data)
        pdf_bytes = latex_generator.compile_pdf_local(latex_source)
        
        if len(pdf_bytes) > MAX_PDF_SIZE:
             raise HTTPException(status_code=413, detail="Generated PDF too large")
        
        pdf_cache[key] = pdf_bytes
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        logger.error(f"PDF generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF. Please check your input.")

@app.post("/api/generate-latex")
def generate_latex(resume: schemas.ResumeCreate):
    """
    Endpoint to just return the raw LaTeX source code (for debugging/Overleaf).
    """
    data = resume.model_dump()
    latex_source = latex_generator.generate_latex_source(data)
    return PlainTextResponse(content=latex_source)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Resume Builder API is running."}
