import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

class RAGService:
    def __init__(self):
        # Using a lightweight model for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.chunks = [] # List of {'text': str, 'metadata': dict}
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )

    async def ingest_text(self, text: str, filename: str):
        # Split text into chunks
        new_chunks = self.text_splitter.split_text(text)
        
        # Create embeddings
        embeddings = self.model.encode(new_chunks)
        
        # Initialize or add to FAISS index
        dimension = embeddings.shape[1]
        if self.index is None:
            self.index = faiss.IndexFlatL2(dimension)
            
        self.index.add(np.array(embeddings).astype('float32'))
        
        # Store chunk metadata
        for chunk in new_chunks:
            self.chunks.append({
                "text": chunk,
                "source": filename
            })
        
        return len(new_chunks)

    def retrieve(self, query: str, top_k: int = 3):
        if self.index is None or not self.chunks:
            return []
            
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_embedding).astype('float32'), top_k)
        
        results = []
        for idx in indices[0]:
            if idx != -1 and idx < len(self.chunks):
                results.append(self.chunks[idx])
        return results