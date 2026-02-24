# Implementation Plan - Multimodal Offline RAG System

This project aims to build an offline RAG system capable of processing PDFs, DOCX files, and Images (via OCR) using a local LLM and Vector Database.

## Architecture

### 1. Ingestion Layer
- **PDF Processor**: Uses `PyMuPDF` (fitz) for fast extraction.
- **DOCX Processor**: Uses `python-docx`.
- **OCR Engine**: Uses `EasyOCR` for high-quality text extraction from images.
- **Chunker**: `LlamaIndex` RecursiveCharacterTextSplitter for semantic chunking.

### 2. Retrieval Layer
- **Embedding Model**: `BAAI/bge-large-en-v1.5` (running locally).
- **Vector Database**: `ChromaDB`.

### 3. Generation Layer
- **LLM**: `Mistral-7B` or `Llama 3.1` running via **Ollama**.
- **Orchestration**: `LlamaIndex` for RAG pipeline.

### 4. API & Orchestration
- **FastAPI**: Backend to handle file uploads and queries.

### 5. Frontend
- **Next.js**: Chat UI with file management and citation links.

### 5. Frontend
- **Next.js**: Modern, high-performance UI with:
  - Chat interface.
  - File upload/management.
  - citation highlighting and source document linking.

## Current Progress
- [x] Project workspace initialization.
- [x] Backend dependency definition.
- [x] Backend implementation (LlamaIndex + EasyOCR).
- [x] Frontend scaffolding (Next.js + Framer Motion).
- [ ] Integration and testing.
- [ ] Final polishing of UI/UX.

## Prerequisites
- **Ollama** must be installed and running locally.
- **Tesseract OCR** must be installed on the system (for image processing).
