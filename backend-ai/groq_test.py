import os
from dotenv import load_dotenv

load_dotenv('.env')

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)
try:
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Test context: {context}"),
        ("human", "{input}"),
    ])
    messages = prompt.format_messages(context="A context", input="What is it?")
    response = llm.invoke(messages)
    print("SUCCESS:", response.content)
except Exception as e:
    import traceback
    traceback.print_exc()



