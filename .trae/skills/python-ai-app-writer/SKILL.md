---
name: python-ai-app-writer
description: Comprehensive guide for building AI applications with Python. Use this skill when the user wants to write, design, or implement AI-powered applications, chatbots, RAG systems, or agents using Python frameworks like LangChain, OpenAI, Streamlit, or FastAPI.
---

# Python AI App Writer

This skill assists in designing and implementing AI applications using Python. It covers the entire stack from LLM integration to frontend UI.

## Workflow

1.  **Clarify Requirements**: Determine the type of application (Chatbot, RAG, Agent, Tool-use) and the target interface (Web UI, API, CLI).
2.  **Select Stack**: Choose appropriate libraries and frameworks based on requirements.
3.  **Implementation**: Generate code following best practices.

## Core Capabilities

### 1. Framework Selection
Choose the right tools for the job:
- **Web UI**: Streamlit (rapid prototyping), Gradio (ML demos), Chainlit (chat interfaces).
- **Backend API**: FastAPI (high performance, async), Flask (simple).
- **LLM Orchestration**: LangChain (complex flows), LlamaIndex (data-centric), LiteLLM (unified API).

### 2. Implementation Patterns

Refer to [patterns.md](references/patterns.md) for detailed architectural patterns including:
- **RAG (Retrieval Augmented Generation)**: For connecting LLMs to private data.
- **Chatbots**: Memory management and conversational flow.
- **Agents**: Tool use and autonomous decision making.
- **Structured Output**: Ensuring JSON/Pydantic responses.

### 3. Best Practices

- **Environment**: Always use `python-dotenv` for API keys. Never hardcode secrets.
- **Async**: Prefer asynchronous calls for LLM interactions to improve throughput.
- **Streaming**: Implement streaming responses for better user experience in chat interfaces.
- **Type Safety**: Use Pydantic for data validation and schema definition.

## Reference Material

- **Library Guide**: See [libraries.md](references/libraries.md) for recommended packages and usage.
- **Architecture Patterns**: See [patterns.md](references/patterns.md) for code structures.
