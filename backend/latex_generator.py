import os
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
    """Escape specific LaTeX special characters to prevent compilation errors."""
    if not isinstance(s, str):
         return s
    
    # Simple escaping, add more if needed.
    # Note: ampersands, hashes, dollar signs, percent signs, underscores are common.
    # But some users might *want* literal LaTeX. We'll do basic escaping for user data.
    # Actually, escaping in a fully dynamic resume might break user's intent if they typeset
    # things like \textbf{C#}. So we will keep it simple.
    s = s.replace('&', '\\&')
    s = s.replace('%', '\\%')
    s = s.replace('$', '\\$')
    s = s.replace('#', '\\#')
    s = s.replace('_', '\\_')
    # Use textasciitilde for ~ and textasciicircum for ^ but those are rare.
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

    # Load Header (static latex)
    header_path = os.path.join(os.path.dirname(__file__), 'templates', template_name, 'header.tex')
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

import subprocess

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
            
        tectonic_exe = os.path.join(os.path.dirname(__file__), "tectonic.exe")
        
        try:
            subprocess.run([tectonic_exe, tex_path], check=True, capture_output=True, cwd=tmpdir)
            with open(pdf_path, "rb") as f:
                return f.read()
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode('utf-8', errors='ignore') if e.stderr else str(e)
            raise Exception(f"LaTeX compilation failed: {error_msg}")
