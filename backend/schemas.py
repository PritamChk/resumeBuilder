from typing import List, Optional
from pydantic import BaseModel

class ExperienceItem(BaseModel):
    company: str
    title: str
    location: str
    date: str
    bullets: List[str]

class ProjectItem(BaseModel):
    name: str
    tech_stack: str
    date: str
    bullets: List[str]

class EducationItem(BaseModel):
    institution: str
    degree: str
    location: str
    date: str

class SkillsItem(BaseModel):
    category: str
    skills: str

class ResumeBase(BaseModel):
    name: str
    email: str
    phone: str
    linkedin: str
    github: str
    location: str
    summary: str
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
