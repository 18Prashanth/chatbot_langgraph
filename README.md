# chatbot_langgraph

### Features

- FastAPI HTTP API (/health, /chat)

- LangGraph state machine with ToolNode + tools_condition

- Web search tool (Tavily) with clean @tool wrapper

- Google Gemini model via init_chat_model("google_genai:gemini-2.0-flash")

- Session/thread memory using MemorySaver keyed by session_id

- CORS-ready for local frontends

- Built-in LangSmith tracing (runs, LLM/tool calls, tags & metadata)

- Tiny frontend (/static) that persists session_id in localStorage

## Project Structure

```
.
├─ src/
│ ├─ main.py # FastAPI app + CORS + router include
│ ├─ utils.py # LangGraph graph, tools, LLM setup
│ ├─ chat_router.py # /chat endpoint (async) with thread_id
│ └─ schemas.py # Pydantic models for request/response
├─ static/
│ ├─ index.html
│ ├─ style.css
│ └─ script.js # calls /chat, stores session_id
├─ .env # GOOGLE_API_KEY, TAVILY_API_KEY
├─ .env.example # sample env file
└─ README.md

```

## Requirements

```
Python 3.11+ (recommended; some packages lag on 3.13)

Tavily API key (https://tavily.com)

Google API key for Gemini (https://ai.google.dev)

Langsmith API key (https://smith.langchain.com/)

```

### Setup

### 1. Create & activate a venv

```
py -3.11 -m venv venv
./venv/Scripts/Activate.ps1
python -m pip install -U pip
```

### 2. Install dependencies

```
pip install -r requirements.txt
```

### 3. Environment variables

```
GOOGLE_API_KEY=your_google_key
TAVILY_API_KEY=your_tavily_key
```

### 4. Run the API

```
python -m uvicorn src.main:app --reload
```

Visit: http://127.0.0.1:8000/

### Acknowledgements

- FastAPI

- Langgraph

-And all open-source contibutors!

## Author

Prashanth Gowda A S

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-blue?logo=linkedin)](https://www.linkedin.com/in/prashanthgowdaas/)
