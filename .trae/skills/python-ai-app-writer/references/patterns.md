# AI Application Patterns

## 1. Simple Chatbot (Streamlit)

Minimal example of a chatbot using Streamlit and OpenAI.

```python
import streamlit as st
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

st.title("AI Chatbot")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("What is up?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        stream = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": m["role"], "content": m["content"]}
                for m in st.session_state.messages
            ],
            stream=True,
        )
        response = st.write_stream(stream)
    st.session_state.messages.append({"role": "assistant", "content": response})
```

## 2. RAG (Retrieval Augmented Generation)

Pattern for querying documents.

1.  **Ingest**: Load documents -> Split text -> Embed -> Store in Vector DB.
2.  **Retrieve**: User query -> Embed -> Search Vector DB -> Get relevant chunks.
3.  **Generate**: Context + Query -> LLM -> Answer.

## 3. Structured Output (Pydantic)

Ensuring the LLM returns JSON data matching a schema.

```python
from pydantic import BaseModel
from openai import OpenAI

class Recipe(BaseModel):
    name: str
    ingredients: list[str]
    steps: list[str]

client = OpenAI()

completion = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Extract the recipe information."},
        {"role": "user", "content": "How do I make a pancake?"},
    ],
    response_format=Recipe,
)

recipe = completion.choices[0].message.parsed
print(recipe.name)
```

## 4. FastAPI Backend with Streaming

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
import os

app = FastAPI()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def stream_generator(prompt: str):
    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

@app.post("/chat")
async def chat(prompt: str):
    return StreamingResponse(stream_generator(prompt), media_type="text/plain")
```
