# 🧠 FBD LLM Chat Interface

Welcome to the **FBD LLM Frontend**, the sleek and interactive user interface for a **Retrieval-Augmented Generation (RAG)**-powered chatbot system.  
This React app connects to a FastAPI backend that leverages LLMs with context-aware retrieval to deliver **accurate, explainable, and self-evaluated answers**.

---

- 🔙 [Backend: FBD RAG Chat API](https://github.com/your-username/backend-repo-name)
- 🖼️ [Frontend: FBD Chat Interface](https://github.com/your-username/frontend-repo-name)

---

## 🎯 Purpose

This application serves as the **interface** for querying a backend chatbot that combines:

- Local LLMs via LM Studio API
- Semantic retrieval using FAISS
- Evaluation using BLEU, ROUGE, and LLM-based grading

Users can ask programming or academic questions and view not just the answers, but also **confidence metrics** and **structured feedback** on response quality.

---

## 🚀 Features

### ✨ Real-Time Conversational UI

- Smooth, responsive chat interface with typing animations
- Distinct message styling for `user`, `assistant`, and `system` messages

### 📊 Live Metrics & Feedback

- BLEU and ROUGE metrics calculated server-side and shown in real time
- LLM-generated evaluation judging reasoning quality and correctness

### 🔄 Full RAG Cycle Support

- Connects to `/rag_chat` to:
  - Retrieve relevant documents via FAISS
  - Query the LLM with context
  - Return grounded answers and evaluation scores
- Optionally calls `/evaluate` for structured verdicts from a grading model

---

## 🗂 Code Structure

| File/Component       | Purpose                                                                 |
|----------------------|-------------------------------------------------------------------------|
| `ChatComponent.tsx`  | Main interactive component that manages messages, state, and requests   |
| `animations.css`     | Typing animations and transitions                                        |
| `axios` API calls    | Communicates with backend endpoints (`/rag_chat`, `/evaluate`)          |
| `Message`, `Metric`  | Type definitions for messages and evaluation metrics                    |

---

## 🧠 How It Works

### 🔄 Flow Overview

1. **User Types Message**
2. React app sends:
    - `POST /rag_chat` with full history and user query
3. Backend returns:
    - Updated history
    - BLEU/ROUGE scores
4. React app sends:
    - `POST /evaluate` with (question, answer)
5. Backend returns:
    - Verdict: Correct/Incorrect
    - Score: 0.0–1.0
    - Comments: Brief reasoning analysis

---

## ⚙️ API Requirements

Make sure your backend is running at: http://localhost:8000( fint it at : https://github.com/para0107/enhanced-llm-with-rag )

The following endpoints must be available:

| Endpoint       | Method | Description                                         |
|----------------|--------|-----------------------------------------------------|
| `/rag_chat`    | POST   | Retrieves, generates, and evaluates the answer      |
| `/evaluate`    | POST   | Grades the answer using an LLM judge                |

---

## 📦 Setup Instructions

1. Clone the repo:
   ```bash
   git clone https://github.com/your-org/fbd-llm-frontend.git
   cd fbd-llm-frontend


Install dependencies : pnpm install
Run : pnpm dev 

Make sure the FastAPI backend is running at localhost:8000



User: How does binary search work?

🧠 LLM w/ RAG: 
  - "Binary search splits a sorted array into halves... 
     Here’s the Python code..."

📊 BLEU: 0.91
📊 ROUGE: precision:0.89, recall:0.85
📋 Evaluation:
  Verdict: Correct
  Score: 0.95
  Comments: The logic is valid and supported by retrieved facts.
