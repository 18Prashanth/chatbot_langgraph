# chatbot_langgraph

##Project Structure

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
