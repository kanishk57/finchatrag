import os
from typing import List, Dict, Any
import fitz # PyMuPDF
from docx import Document
import easyocr
import numpy as np
from PIL import Image
import io

class DocumentProcessor:
    def __init__(self):
        # Initialize EasyOCR reader (only English for now, can be expanded)
        # It's better to keep it as an instance variable to avoid reloading model
        self.reader = easyocr.Reader(['en'], gpu=False) # set gpu=True if you have GPU

    def extract_text(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            return self._extract_from_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            return self._extract_from_docx(file_path)
        elif ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff']:
            return self._extract_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    def _extract_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text() + "\n"
        except Exception as e:
            print(f"Error extracting PDF {file_path}: {e}")
        return text

    def _extract_from_docx(self, file_path: str) -> str:
        text = ""
        try:
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"Error extracting DOCX {file_path}: {e}")
        return text

    def _extract_from_image(self, file_path: str) -> str:
        try:
            # EasyOCR expects image path or numpy array
            results = self.reader.readtext(file_path)
            return "\n".join([res[1] for res in results])
        except Exception as e:
            print(f"Error extracting Image {file_path}: {e}")
            return ""
