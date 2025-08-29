from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
import os, json
from dotenv import load_dotenv

from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode, tools_condition
from tavily import TavilyClient
from langgraph.checkpoint.memory import InMemorySaver
from langsmith import traceable

load_dotenv()

class State(TypedDict):
    messages: Annotated[list, add_messages]

@tool
@traceable(name="web_search_tool")
def web_search(query: str) -> str:
    """Search the web for information. Use this for current events, news, recent data, or when you need up-to-date information."""
    print(f"SEARCHING: {query}")
    api_key = os.getenv("TAVILY_API_KEY")
    tv = TavilyClient(api_key=api_key)
    res = tv.search(query=query, max_results=3)
    return json.dumps(res, ensure_ascii=False)



tools = [web_search]
llm = init_chat_model("google_genai:gemini-2.0-flash")
llm_with_tools = llm.bind_tools(tools)

@traceable(name="chatbot_node")
def chatbot(state: State):
    # Force the LLM to be more likely to use tools
    system_prompt = """You are an assistant that ALWAYS uses web search for:
    - Any question about current events, news, or recent information
    - Questions about today's date, current prices, weather, etc.
    - Any factual question where the answer might have changed recently
    
    When in doubt, search first, then answer."""
    
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    response = llm_with_tools.invoke(messages)
    print(f"AI Response type: {type(response)}")
    if hasattr(response, 'tool_calls'):
        print(f"Tool calls: {len(response.tool_calls) if response.tool_calls else 0}")
    return {"messages": [response]}



    
graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("tools", ToolNode(tools))
graph_builder.add_edge(START, "chatbot")
graph_builder.add_conditional_edges("chatbot", tools_condition)
graph_builder.add_edge("tools", "chatbot")

memory = InMemorySaver()
graph = graph_builder.compile(checkpointer=memory)
