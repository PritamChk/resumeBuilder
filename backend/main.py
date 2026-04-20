from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, PlainTextResponse
from typing import List
from sqlalchemy.orm import Session

import models, schemas, database, latex_generator

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Resume Builder API")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, update this in prod
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

@app.post("/api/generate-pdf")
def generate_pdf(resume: schemas.ResumeCreate):
    """
    Generates a PDF on-the-fly and returns the binary stream.
    """
    data = resume.model_dump()
    try:
        latex_source = latex_generator.generate_latex_source(data)
        pdf_bytes = latex_generator.compile_pdf_local(latex_source)
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
