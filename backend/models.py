from sqlalchemy import Column, Integer, String, JSON
from database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    linkedin = Column(String)
    github = Column(String)
    location = Column(String)
    summary = Column(String)
    
    # Store complex structures as JSON
    experience = Column(JSON)
    projects = Column(JSON)
    skills = Column(JSON)
    education = Column(JSON)
