try:
    import llama_index.core
    import chromadb
    import easyocr
    import fitz
    print("Imports successful!")
except ImportError as e:
    print(f"Import failed: {e}")
