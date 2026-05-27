import PyPDF2
from io import BytesIO
import re
from typing import List, Dict

class PDFParser:
    @staticmethod
    def extract_text(file_bytes: bytes) -> str:
        """Extracts plain text from raw PDF bytes using robust, layout-aware multi-stage extraction and OCR fallbacks."""
        extracted_text = ""
        try:
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text_blocks = []
            for page in doc:
                blocks = page.get_text("blocks")
                blocks.sort(key=lambda b: (b[1], b[0]))
                for b in blocks:
                    block_text = b[4].strip()
                    if block_text:
                        text_blocks.append(block_text)
            extracted_text = "\n\n".join(text_blocks)
        except Exception as e:
            print("PyMuPDF extraction failed or not available:", e)

        if len(extracted_text.strip()) < 100:
            try:
                import pdfplumber
                with pdfplumber.open(BytesIO(file_bytes)) as pdf:
                    plumber_text = []
                    for page in pdf.pages:
                        page_text = page.extract_text(layout=True)
                        if page_text:
                            plumber_text.append(page_text)
                    if plumber_text:
                        extracted_text = "\n\n".join(plumber_text)
            except Exception as e:
                print("pdfplumber extraction failed:", e)

        if len(extracted_text.strip()) < 100:
            try:
                print("OCR Fallback Triggered: Extremely low text density. Running pytesseract OCR extraction...")
                import fitz
                import pytesseract
                import os
                from PIL import Image
                import io

                if os.name == 'nt':
                    tesseract_paths = [
                        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe")
                    ]
                    for path in tesseract_paths:
                        if os.path.exists(path):
                            pytesseract.pytesseract.tesseract_cmd = path
                            print(f"OCR: Found and configured Tesseract binary at {path}")
                            break

                doc = fitz.open(stream=file_bytes, filetype="pdf")
                ocr_text = []
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))
                    page_text = pytesseract.image_to_string(img)
                    if page_text.strip():
                        ocr_text.append(page_text)
                if ocr_text:
                    extracted_text = "\n\n".join(ocr_text)
                    print(f"OCR Success: Extracted {len(extracted_text)} characters.")
            except Exception as e:
                print("pytesseract OCR fallback failed:", e)

        if len(extracted_text.strip()) < 100:
            try:
                pdf_file = BytesIO(file_bytes)
                reader = PyPDF2.PdfReader(pdf_file)
                pypdf_text = []
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        pypdf_text.append(page_text)
                if pypdf_text:
                    extracted_text = "\n\n".join(pypdf_text)
            except Exception as e:
                print("PyPDF2 fallback failed:", e)

        if extracted_text:
            extracted_text = re.sub(r'[ \t]+', ' ', extracted_text)
            extracted_text = re.sub(r'\n\s*\n+', '\n\n', extracted_text)
            extracted_text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', extracted_text)
            cleaned_text = extracted_text.strip()
            if cleaned_text:
                return cleaned_text
            return "No extractable text found in PDF."
        return "Failed to parse PDF contents."

    @staticmethod
    def extract_all_links(text: str, file_bytes: bytes = None) -> List[str]:
        """Extracts links from both PDF annotations and raw text patterns."""
        links = []
        if file_bytes:
            try:
                import fitz
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                for page in doc:
                    page_links = page.get_links()
                    for link in page_links:
                        if 'uri' in link:
                            links.append(link['uri'])
            except Exception as e:
                print("PyMuPDF link extraction warning:", e)

        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+|github\.com/[\w\.-]+|linkedin\.com/in/[\w\.-]+'
        regex_links = re.findall(url_pattern, text, re.IGNORECASE)
        links.extend(regex_links)

        cleaned_links = []
        for link in links:
            link = link.strip().rstrip(".,;:)")
            if not link.lower().startswith(('http://', 'https://')):
                link = 'https://' + link
            if link not in cleaned_links:
                cleaned_links.append(link)
        return cleaned_links

    @staticmethod
    def extract_structured_metadata(text: str, file_bytes: bytes = None) -> Dict:
        """Automatically parses key resume headers and isolates structured metadata lists."""
        text_lower = text.lower()
        metadata = {
            'skills': [],
            'projects': [],
            'experience': [],
            'education': [],
            'certifications': [],
            'links': [],
            'contactInfo': {
                'email': '',
                'phone': '',
                'github': '',
                'linkedin': ''
            }
        }

        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if email_match:
            metadata['contactInfo']['email'] = email_match.group(0)

        phone_match = re.search(r'\(?\+?[0-9]{1,4}\)?[-\s\./0-9]{7,15}', text)
        if phone_match:
            metadata['contactInfo']['phone'] = phone_match.group(0).strip()

        github_match = re.search(r'github\.com/[\w\.-]+', text_lower)
        if github_match:
            metadata['contactInfo']['github'] = 'https://' + github_match.group(0)

        linkedin_match = re.search(r'linkedin\.com/in/[\w\.-]+', text_lower)
        if linkedin_match:
            metadata['contactInfo']['linkedin'] = 'https://' + linkedin_match.group(0)

        metadata['links'] = PDFParser.extract_all_links(text, file_bytes)

        sections = {
            'skills': ['skills', 'technical skills', 'skills & tools', 'core competencies', 'technologies', 'key skills'],
            'projects': ['projects', 'personal projects', 'academic projects', 'key projects', 'notable projects'],
            'experience': ['experience', 'professional experience', 'work experience', 'employment history', 'work history'],
            'education': ['education', 'academic background', 'academic qualifications', 'degrees'],
            'certifications': ['certifications', 'licenses & certifications', 'awards', 'credentials', 'achievements']
        }

        header_positions = []
        lines = text.split('\n')
        for idx, line in enumerate(lines):
            line_clean = line.strip().lower()
            if len(line_clean) < 30:
                found_section = False
                for sec_key, headers in sections.items():
                    for header in headers:
                        if line_clean == header or line_clean.startswith(header + ':') or line_clean.startswith(header + ' '):
                            header_positions.append((idx, sec_key))
                            found_section = True
                            break
                    if found_section:
                        break

        header_positions.sort(key=lambda x: x[0])

        for i, (line_idx, sec_key) in enumerate(header_positions):
            start_line = line_idx + 1
            if i + 1 < len(header_positions):
                end_line = header_positions[i + 1][0]
            else:
                end_line = len(lines)

            section_lines = [l.strip() for l in lines[start_line:end_line] if l.strip()]

            if sec_key == 'skills':
                for line in section_lines:
                    parts = [p.strip() for p in re.split(r'[,|•\t]', line) if p.strip()]
                    metadata['skills'].extend(parts)
            elif sec_key == 'projects':
                metadata['projects'].extend(section_lines)
            elif sec_key == 'experience':
                metadata['experience'].extend(section_lines)
            elif sec_key == 'education':
                metadata['education'].extend(section_lines)
            elif sec_key == 'certifications':
                metadata['certifications'].extend(section_lines)

        metadata['skills'] = list(dict.fromkeys(s for s in metadata['skills'] if len(s) > 1 and len(s) < 100))[:100]
        metadata['projects'] = list(dict.fromkeys(p[:500] for p in metadata['projects']))[:50]
        metadata['experience'] = list(dict.fromkeys(e[:500] for e in metadata['experience']))[:50]
        metadata['education'] = list(dict.fromkeys(ed[:500] for ed in metadata['education']))[:20]
        metadata['certifications'] = list(dict.fromkeys(c[:500] for c in metadata['certifications']))[:20]

        return metadata