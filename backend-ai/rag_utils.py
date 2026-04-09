import os
import json
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

load_dotenv()

FAISS_DB_DIR = os.path.join(os.path.dirname(__file__), "faiss_index")

def process_and_build_index(json_filepath: str):
    """
    Reads the scraped JSON data, chunks the text, and stores vectors into FAISS.
    """
    try:
        with open(json_filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print("Extracting text from JSON...")
        # Extract meaningful text from scraped data
        title = data.get("title", "")
        description = data.get("description", "")
        textContent = data.get("textContent", "")
        
        full_text = f"Title: {title}\nDescription: {description}\n\nContent:\n{textContent}"
        
        # We can also add some of the generated headers or links if needed, but textContent contains most of the readable blocks
        
        print("Chunking text...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_text(full_text)
        
        documents = [Document(page_content=chunk, metadata={"source": data.get("url", "scraped_data")}) for chunk in chunks]
        
        print("Generating embeddings and building FAISS index...")
        # Uses CPU locally. 100% Free forever.
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_store = FAISS.from_documents(documents, embeddings)
        
        vector_store.save_local(FAISS_DB_DIR)
        print(f"Index successfully built and saved to {FAISS_DB_DIR}")
        return True
    except Exception as e:
        print(f"Error building index: {str(e)}")
        return False

def get_rag_chain():
    """
    Loads FAISS index and returns a LangChain RetrievalQA chain.
    """
    if not os.path.exists(FAISS_DB_DIR):
        print("FAISS index not found. Please build the index first.")
        return None
        
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.load_local(FAISS_DB_DIR, embeddings, allow_dangerous_deserialization=True)
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    
    # Requires GROQ_API_KEY in .env (Generous Free Tier!)
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)
    
    system_prompt = (
        "You are an AI assistant for LeadForGrow."
        "Use the provided context to answer the user's question accurately."
        "If you don't know the answer, say you don't know and don't make up information."
        "\n\n"
        "Context:\n{context}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
        
    class CustomRAGChain:
        def invoke(self, inputs):
            query = inputs["input"]
            # Retrieve documents
            docs = retriever.invoke(query)
            context = format_docs(docs)
            
            # Format the prompt with context
            messages = prompt.format_messages(context=context, input=query)
            
            # Call LLM
            response = llm.invoke(messages)
            
            return {
                "answer": response.content,
                "context": docs
            }
            
    return CustomRAGChain()

if __name__ == "__main__":
    # Test script locally to ingest the JSON
    json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "mee.json"))
    if os.path.exists(json_path):
        process_and_build_index(json_path)
    else:
        print(f"File not found: {json_path}")
