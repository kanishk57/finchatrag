import os
from typing import List, Dict, Any
from llama_index.core import VectorStoreIndex, Document, StorageContext, Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.ollama import Ollama
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

class RAGEngine:
    def __init__(self, persist_directory: str = "./vector_db"):
        self.persist_directory = persist_directory
        
        # Configure LlamaIndex Settings
        Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-large-en-v1.5")
        Settings.llm = Ollama(model="mistral", request_timeout=120.0) # Can use llama3.1 8b as well
        
        # Initialize ChromaDB
        self.db = chromadb.PersistentClient(path=self.persist_directory)
        self.chroma_collection = self.db.get_or_create_collection("finchat_docs")
        
        self.vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        self.storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
        
        # Initialize or Load Index
        try:
            self.index = VectorStoreIndex.from_vector_store(
                self.vector_store, storage_context=self.storage_context
            )
        except Exception:
            # If no docs exist, we'll create an empty index when first doc is added
            self.index = None

    def add_documents(self, text_content: str, metadata: Dict[str, Any]):
        """Indexes text content into the vector store."""
        doc = Document(text=text_content, metadata=metadata)
        
        if self.index is None:
            self.index = VectorStoreIndex.from_documents(
                [doc], storage_context=self.storage_context
            )
        else:
            self.index.insert(doc)

    def query(self, user_query: str) -> Dict[str, Any]:
        """Performs RAG query using LlamaIndex with numbered citations."""
        if self.index is None:
            return {"answer": "No documents indexed yet.", "sources": []}
            
        # Retrieval
        retriever = self.index.as_retriever(similarity_top_k=5)
        nodes = retriever.retrieve(user_query)
        
        # Prepare context with numbers
        context_str = ""
        sources = []
        for i, node in enumerate(nodes):
            idx = i + 1
            content = node.node.get_content()
            filename = node.node.metadata.get('filename', 'Unknown')
            context_str += f"[{idx}] Source: {filename}\nContent: {content}\n\n"
            sources.append({
                "id": idx,
                "content": content,
                "metadata": node.node.metadata,
                "score": node.score
            })
            
        prompt = f"""
        You are an intelligent assistant. Answer the user question based ONLY on the provided context.
        Each piece of context is numbered (e.g., [1], [2]). 
        In your answer, EXPLICITLY refer to the context using these numbers, like [1] or [1, 2].
        
        If the answer is not in the context, say "I don't have enough information to answer this."
        
        Context:
        {context_str}
        
        Question: {user_query}
        
        Answer:
        """
        
        response = Settings.llm.complete(prompt)
        
        return {
            "answer": str(response),
            "sources": sources
        }
