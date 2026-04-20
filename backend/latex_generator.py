import os
import subprocess
import jinja2
import requests
import re

# Set up custom Jinja2 environment to avoid conflicts with LaTeX syntax
latex_jinja_env = jinja2.Environment(
    block_start_string='<%',
    block_end_string='%>',
    variable_start_string='<<',
    variable_end_string='>>',
    comment_start_string='<#',
    comment_end_string='#>',
    line_statement_prefix='%%',
    line_comment_prefix='%#',
    trim_blocks=True,
    autoescape=False,
    loader=jinja2.FileSystemLoader(os.path.abspath(os.path.join(os.path.dirname(__file__), 'templates')))
)

def escape_latex(s: str) -> str:
    """Escape LaTeX special characters to prevent compilation errors and injection."""
    if not isinstance(s, str):
        return s
    
    # Escape ALL LaTeX special chars
    replacements = {
        '\\': r'\textbackslash{}',
        '{': r'\{',
        '}': r'\}',
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}',
    }
    for char, escape in replacements.items():
        s = s.replace(char, escape)
    return s

# Register custom filter
latex_jinja_env.filters['escape_latex'] = escape_latex


def _sanitize(d):
    """Recursively convert None to empty string so templates never see None."""
    if d is None:
        return ""
    elif isinstance(d, str):
        return d
    elif isinstance(d, list):
        return [_sanitize(i) for i in d]
    elif isinstance(d, dict):
        return {k: _sanitize(v) for k, v in d.items()}
    return d


def generate_latex_source(data: dict, template_name: str = 'jakes_resume') -> str:
    """Combines header and body to generate full LaTeX source."""

    # Whitelist allowed templates and prevent path traversal
    if not re.match(r'^[a-z_]+$', template_name):
        raise ValueError("Invalid template name")
    
    allowed_templates = ['jakes_resume'] # Update this list as more are added
    if template_name not in allowed_templates:
        raise ValueError(f"Template '{template_name}' not allowed")

    # Load Header (static latex)
    header_path = os.path.join(os.path.dirname(__file__), 'templates', template_name, 'header.tex')
    if not os.path.abspath(header_path).startswith(os.path.abspath(os.path.join(os.path.dirname(__file__), 'templates'))):
        raise ValueError("Access denied to template path")

    with open(header_path, 'r', encoding='utf-8') as f:
        header_content = f.read()

    # 1. Sanitize: replace None with '' so templates are None-safe
    clean_data = _sanitize(data)

    # 2. Escape LaTeX special characters
    def recursive_escape(d):
        if isinstance(d, str):
            return escape_latex(d)
        elif isinstance(d, list):
            return [recursive_escape(i) for i in d]
        elif isinstance(d, dict):
            return {k: recursive_escape(v) for k, v in d.items()}
        return d

    safe_data = recursive_escape(clean_data)

    # 3. Render Body
    template = latex_jinja_env.get_template(f'{template_name}/body.tex.jinja')
    body_content = template.render(data=safe_data)

    return header_content + "\n" + body_content

import platform
import shutil
import logging

logger = logging.getLogger(__name__)

def get_tectonic_path():
    exe_name = "tectonic.exe" if platform.system() == "Windows" else "tectonic"
    local_path = os.path.join(os.path.dirname(__file__), exe_name)
    if os.path.exists(local_path):
        return local_path
    # Fallback to system PATH
    system_path = shutil.which("tectonic")
    if system_path:
        return system_path
    raise FileNotFoundError("Tectonic binary not found. Install with: cargo install tectonic")

def compile_pdf_local(latex_source: str) -> bytes:
    """
    Compiles LaTeX using local tectonic binary.
    """
    import tempfile
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "resume.tex")
        pdf_path = os.path.join(tmpdir, "resume.pdf")
        
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_source)
            
        try:
            tectonic_exe = get_tectonic_path()
            subprocess.run([tectonic_exe, tex_path], check=True, capture_output=True, cwd=tmpdir)
            with open(pdf_path, "rb") as f:
                return f.read()
        except subprocess.CalledProcessError as e:
            logger.error(f"LaTeX compilation failed: {e.stderr.decode('utf-8', errors='ignore')}")
            raise Exception("Failed to compile resume. Check your input for special characters.")
        except Exception as e:
            logger.error(f"Error during PDF compilation: {str(e)}")
            raise Exception("An unexpected error occurred during PDF generation.")
