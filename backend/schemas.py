from typing import List
from pydantic import BaseModel, EmailStr, Field, HttpUrl

class ExperienceItem(BaseModel):
    company: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., max_length=100)
    date: str = Field(..., max_length=50)
    bullets: List[str]

class ProjectItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    tech_stack: str = Field(..., max_length=200)
    date: str = Field(..., max_length=50)
    bullets: List[str]

class EducationItem(BaseModel):
    institution: str = Field(..., min_length=1, max_length=100)
    degree: str = Field(..., max_length=100)
    location: str = Field(..., max_length=100)
    date: str = Field(..., max_length=50)

class SkillsItem(BaseModel):
    category: str = Field(..., max_length=100)
    skills: str = Field(..., max_length=500)

class ResumeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r"^\+?[\d\s\-\(\).]+$", max_length=20)
    linkedin: str = Field(..., max_length=200)
    github: str = Field(..., max_length=200)
    location: str = Field(..., max_length=100)
    summary: str = Field(..., max_length=2000)
    experience: List[ExperienceItem]
    projects: List[ProjectItem]
    skills: List[SkillsItem]
    education: List[EducationItem]

class ResumeCreate(ResumeBase):
    pass

class ResumeResponse(ResumeBase):
    id: int

    class Config:
        from_attributes = True
