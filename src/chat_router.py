from fastapi import APIRouter, HTTPException
from src.utils import graph
from src.schemas import ChatRequest, ChatResponse
import uuid


router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        sid = request.session_id or str(uuid.uuid4())
        result = graph.invoke(
            {"messages": [{"role": "user", "content": request.message}]},
            config={"configurable": {"thread_id": sid}},   # <-- important
        )
        last = result["messages"][-1]
        reply = getattr(last, "content", last.get("content") if isinstance(last, dict) else str(last))
        return ChatResponse(response=reply, session_id=sid)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))