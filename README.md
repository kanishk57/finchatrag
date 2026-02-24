# FinChat RAG: Offline Multimodal Retrieval System

A local, privacy-first RAG system designed for the SIH Hackathon. This system allows you to ingest PDF, DOCX, and Image files (using OCR) and query them using a local LLM (via Ollama).

## Features
- **Multimodal Ingestion**: Supports `.pdf`, `.docx`, and images (`.png`, `.jpg`, etc.).
- **Local Intelligence**: Uses `Mistral-7B` or `Llama 3.1` via Ollama for zero-leakage processing.
- **Citation Transparency**: Every answer includes clickable citations that reveal the source document fragment.
- **Premium UI**: Modern, high-performance interface with dark mode and smooth animations.

## Tech Stack
- **Backend**: FastAPI, LlamaIndex, ChromaDB, EasyOCR, PyMuPDF.
- **Frontend**: Next.js, Framer Motion, Tailwind CSS, Lucide Icons.
- **LLM/Embeddings**: Ollama (Mistral), BGE-Large (HuggingFace).

## Prerequisites
1. **Ollama**: Download and install from [ollama.com](https://ollama.com).
   - Run `ollama pull mistral` to download the model.
2. **Tesseract OCR** (Optional, but recommended for fallback): Install on your system path.
3. **Python 3.10+**.
4. **Node.js 18+**.

## Getting Started

1. **Install Dependencies**:
   ```powershell
   # Backend
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Run the Application**:
   You can use the provided script:
   ```powershell
   ./run_servers.ps1
   ```
   Or run manually:
   - Backend: `cd backend; .\venv\Scripts\activate; python main.py`
   - Frontend: `cd frontend; npm run dev`

3. **Access**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)