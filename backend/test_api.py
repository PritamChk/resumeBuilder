import requests
import json

data = {
    "name": "PRITAM CHAKRABORTY",
    "email": "pritam@example.com",
    "phone": "9836424024",
    "linkedin": "https://linkedin.com",
    "github": "https://github.com",
    "location": "Bangalore",
    "summary": "Summary",
    "experience": [],
    "projects": [],
    "skills": [],
    "education": [
        {
            "institution": "TMLS",
            "degree": "MCA",
            "location": "Kolkata",
            "date": "2020-2022"
        }
    ]
}

try:
    r = requests.post("http://127.0.0.1:8000/api/generate-pdf", json=data)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")
