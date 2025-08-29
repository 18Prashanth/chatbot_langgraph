const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// Persist a thread/session across requests so LangGraph memory works
let sessionId = localStorage.getItem("chat_session_id") || null;

const API_CONFIG = {
  endpoint: "http://127.0.0.1:8000/chat", // use the exact origin you allowed in CORS
  method: "POST",
  headers: { "Content-Type": "application/json" },
};

// Build the request body that FastAPI expects
function buildApiRequest(message) {
  return {
    message,
    session_id: sessionId, // pass it if we already have one
  };
}

// Extract bot response from API
function extractBotResponse(apiResponse) {
  if (apiResponse.response) return apiResponse.response;
  if (apiResponse.message) return apiResponse.message;
  if (apiResponse.choices?.[0]?.message?.content) {
    return apiResponse.choices[0].message.content;
  }
  if (apiResponse.data?.response) return apiResponse.data.response;
  return (
    apiResponse.text ||
    apiResponse.content ||
    "Sorry, I couldn't process that request."
  );
}

function addMessage(content, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user" : "bot"}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${isUser ? "user" : "bot"}`;
  avatar.textContent = isUser ? "U" : "AI";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = content;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot typing-indicator";
  typingDiv.id = "typing-indicator";

  const avatar = document.createElement("div");
  avatar.className = "avatar bot";
  avatar.textContent = "AI";

  const typingDots = document.createElement("div");
  typingDots.className = "typing-dots";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    typingDots.appendChild(dot);
  }

  typingDiv.appendChild(avatar);
  typingDiv.appendChild(typingDots);
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) typingIndicator.remove();
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  messageInput.value = "";
  sendButton.disabled = true;
  showTypingIndicator();

  try {
    const requestBody = buildApiRequest(message);

    const response = await fetch(API_CONFIG.endpoint, {
      method: API_CONFIG.method,
      headers: API_CONFIG.headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Save/refresh session id from server so memory threads stay consistent
    if (data.session_id && data.session_id !== sessionId) {
      sessionId = data.session_id;
      localStorage.setItem("chat_session_id", sessionId);
    }

    const botMessage = extractBotResponse(data);
    hideTypingIndicator();
    addMessage(botMessage);
  } catch (error) {
    console.error("API Error:", error);
    hideTypingIndicator();
    let errorMessage =
      "Sorry, I'm having trouble connecting right now. Please try again.";
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage =
        "Unable to connect to the server. Please check your connection and try again.";
    } else if (error.message.includes("401")) {
      errorMessage = "Authentication error. Please check your API credentials.";
    } else if (error.message.includes("429")) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.message.includes("500")) {
      errorMessage = "Server error. Please try again in a few moments.";
    }
    addMessage(errorMessage);
  } finally {
    sendButton.disabled = false;
    messageInput.focus();
  }
}

// Optional: New Chat button can clear the session/thread id
function newChat() {
  localStorage.removeItem("chat_session_id");
  sessionId = null;
  chatMessages.innerHTML = "";
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
messageInput.addEventListener("input", () => {
  sendButton.disabled = messageInput.value.trim() === "";
});
window.addEventListener("load", () => messageInput.focus());
