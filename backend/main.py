import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from utils.document_processor import DocumentProcessor
from utils.rag_engine import RAGEngine

app = FastAPI(title="Offline Multimodal RAG API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Processors
doc_processor = DocumentProcessor()
rag_engine = RAGEngine()

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]

@app.post("/upload", status_code=201)
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Save file locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract text based on file type
        text = doc_processor.extract_text(file_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file.")
        
        # Index in Vector DB
        rag_engine.add_documents(
            text_content=text,
            metadata={"filename": file.filename, "path": file_path}
        )
        
        return {"message": f"File '{file.filename}' uploaded and indexed successfully."}
    except Exception as e:
        # Cleanup file if indexing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    try:
        result = rag_engine.query(request.query)
        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
async def list_files():
    files = []
    for filename in os.listdir(UPLOAD_DIR):
        files.append({"name": filename, "path": os.path.join(UPLOAD_DIR, filename)})
    return files

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
