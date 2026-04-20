# AI Context & Codebase Guide

This document is designed to help AI agents (like GitHub Copilot, Gemini, or ChatGPT) quickly understand the intent, architecture, and logic of the **Agentic Resume Builder**.

## 🎯 Project Goal
To provide a seamless, high-performance web application for building **ATS-optimized resumes** using **LaTeX**. The focus is on developer-centric aesthetics (dark mode, crimson accents) and local compilation (no external LaTeX API required).

## 🛠 Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, React Hook Form, Axios.
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy (SQLite), Jinja2 (LaTeX templating).
- **Engine**: Tectonic (Static TeX engine) - used for cross-platform, dependency-free compilation.
- **Orchestration**: Docker Compose (optimized for standalone production builds).

## 🏗 Architecture & Data Flow
1. **Frontend**: Collects structured data via `ResumeBuilder.tsx`.
2. **API**: `POST /api/generate-pdf` receives the JSON payload.
3. **Templating**: `latex_generator.py` uses Jinja2 to inject data into `.tex.jinja` files.
4. **Compilation**: The backend executes a local `tectonic` binary in a temporary directory.
5. **Streaming**: The resulting PDF binary is streamed back to the frontend and displayed in an `<iframe>`.

## 📁 Directory Structure
- `/frontend`:
    - `src/components/ResumeBuilder.tsx`: The heart of the UI. Handles multi-step form logic and live preview debouncing (3s).
    - `Dockerfile`: Multi-stage build using Next.js `standalone` mode.
- `/backend`:
    - `main.py`: API entry point with CORS, rate limiting (`slowapi`), and PDF generation routes.
    - `latex_generator.py`: Contains the logic for escaping LaTeX special characters and running the Tectonic compiler.
    - `templates/`: Contains LaTeX templates (e.g., `jakes_resume/`).
    - `database.py`: SQLAlchemy setup. Supports `DATABASE_URL` for volume persistence.
    - `models.py` / `schemas.py`: Data persistence layer (SQLite).
- `docker-compose.yml`: Defines `resume-frontend` and `resume-backend` services.

## 🧬 Key Logic: LaTeX Escaping
LaTeX uses special characters (`&`, `$`, `%`, etc.). The `latex_generator.py` includes a robust `escape_latex` filter to prevent compilation errors or injection attacks, ensuring user input doesn't break the TeX engine.

## 🚀 How to Contribute / Extend
### Adding a New Template
1. Create a new folder under `backend/templates/`.
2. Create `header.tex` (static preamble) and `body.tex.jinja` (dynamic content).
3. Register the template name in the `allowed_templates` list in `backend/latex_generator.py`.

### Improving Performance
- PDF generation is CPU-intensive. Currently uses a simple in-memory `pdf_cache` in `main.py`.
- For production, consider moving to Redis cache or an asynchronous task worker (Celery) if traffic scales.

## 🤖 AI Interaction Guidelines
- **Frontend Edits**: Maintain the "Crimson/Glassmorphism" design system. Use `framer-motion` for transitions.
- **Backend Edits**: Always ensure user input is escaped before hitting Jinja2 templates.
- **Dependencies**: Prefer the `npx` or `pip` commands as defined in the optimized Dockerfiles.
