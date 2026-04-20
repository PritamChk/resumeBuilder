# Agentic Resume Builder

A full-stack, agent-based resume builder application that allows users to create ATS-optimized resumes using a sleek, interactive multi-step form. The application provides a live preview and generates a compiled PDF using a LaTeX template.

## Project Structure

This project is divided into two main components:

- **Frontend**: A modern web application built with Next.js, React, Tailwind CSS, and Framer Motion.
- **Backend**: A high-performance Python API powered by FastAPI, SQLite (via SQLAlchemy), and a local LaTeX compilation engine (Tectonic).

---

## Features

- **Interactive UI**: A multi-step form for entering personal details, summary, experience, projects, skills, and education.
- **Live Preview**: See your resume update in real-time as you type, with a 1.5-second debounce.
- **LaTeX Generation**: The backend uses Jinja2 to dynamically inject data into an ATS-optimized LaTeX template (based on Jake's Resume).
- **Local PDF Compilation**: Uses the Tectonic typesetting engine to rapidly compile LaTeX into PDF without external dependencies.
- **Export Options**: 
  - Download the final compiled PDF.
  - Copy the raw LaTeX source code directly to your clipboard.
- **Theming**: Features a stunning dark mode interface with crimson red accents and glassmorphic elements.

---

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **Python** (v3.13 tested, 3.10+ recommended)
- **npm** or **yarn**

*(Note: The backend includes the standalone `tectonic.exe` binary for LaTeX compilation on Windows, so a full TeX Live installation is not required.)*

---

## Setup & Installation

### 1. Backend Setup (FastAPI)

Navigate to the backend directory and set up the Python environment:

```powershell
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\activate

# Install the required dependencies
pip install -r requirements.txt
```

Run the backend server:

```powershell
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. 
- Interactive API documentation (Swagger) is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (Next.js)

Open a new terminal, navigate to the frontend directory, and install dependencies:

```powershell
cd frontend

# Install necessary packages
npm install
```

Run the frontend development server:

```powershell
npm run dev
```

The application will be accessible at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use).

---

## Usage

1. Start both the backend and frontend servers as described above.
2. Open your browser and navigate to the frontend URL (e.g., `http://localhost:3000`).
3. The form comes pre-populated with default data. You can navigate through the tabs (Personal, Summary, Experience, etc.) to modify the content.
4. The live preview pane on the right will automatically update shortly after you stop typing.
5. Use the **Copy LaTeX** button to copy the raw source code.
6. Use the **Download PDF** button to save the generated resume to your computer.
7. Click **Force Refresh** if you want to manually trigger an immediate recompilation.

---

## API Endpoints Overview

- `GET /`: Health check endpoint.
- `POST /api/resume`: Save resume data to the local SQLite database.
- `GET /api/resume/{id}`: Fetch saved resume data by ID.
- `POST /api/generate-pdf`: Pass JSON payload, inject it into the LaTeX template, compile via Tectonic, and return the PDF binary.
- `POST /api/generate-latex`: Returns the raw, dynamically populated LaTeX string.

## Architecture & Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, React Hook Form, Axios, Lucide React.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy, Pydantic, Jinja2.
- **Database**: SQLite (local `resume_builder.db`).
- **Engine**: Tectonic (Rust-based LaTeX engine).
