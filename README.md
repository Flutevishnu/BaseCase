# BaseCase: AI-Powered Socratic Coding Mentor

BaseCase is an intelligent, full-stack platform designed to mentor users through Data Structures and Algorithms (DSA) problems. Rather than simply providing the correct code, the AI acts as a senior engineer, guiding users using the Socratic method to build intuition from brute-force to optimal solutions.

## Architecture

The project is split into two distinct services:
1. **Frontend (`/basecase`)**: A highly responsive Next.js web application providing a rich, real-time code execution and chat interface.
2. **AI Backend (`/AI-Coding-Mentor`)**: A state-based agent workflow powered by LangGraph, LangSmith, and Gemini, managing complex tutoring logic.

### Core Technologies
- **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript, Zustand (State Management)
- **Backend Graph**: LangGraph (Stateful Agent Workflows)
- **LLM Engine**: Google Gemini (Flash-Lite / Pro)
- **Observability & Prompt Management**: LangSmith Hub

## Key Features

- **Socratic Tutoring Engine**: Powered by a multi-node LangGraph state machine. It correctly identifies whether a user is in the Ideation phase or Coding phase, and gates progression until the user discovers the correct algorithmic approach.
- **Dynamic Visualizations**: Automatically generates live React components to visualize Data Structures (Linked Lists, Binary Trees, Matrices, Hashmaps) directly in the chat based on the agent's contextual requests.
- **Real-Time Streaming**: Tokens are streamed seamlessly from the backend LangGraph engine to the frontend via Server-Sent Events (SSE) for zero-latency interactions.
- **Native Structured Code Reviews**: When the user submits their code, the LLM seamlessly switches to structured JSON outputs (`CodeReview`) to populate dedicated, styled UI feedback cards (Correctness, Complexity, Style, Improvements) without fragile Regex parsing.
- **Decoupled Prompt Management**: All system prompts are abstracted away from source code and managed dynamically via LangSmith Hub, enabling instant A/B testing and non-blocking iteration.

## Running Locally

### 1. Start the AI Backend (LangGraph)
Navigate to the `AI-Coding-Mentor` directory:
```bash
cd AI-Coding-Mentor

# Install dependencies using uv
uv sync

# Start the LangGraph development server
langgraph dev
```

### 2. Start the Frontend (Next.js)
In a separate terminal, navigate to the `basecase` directory:
```bash
cd basecase
npm install

# Configure environment variables (.env.local)
# LANGGRAPH_API_URL=http://localhost:2024

# Start the Next.js development server
npm run dev
```

The application will be running at `http://localhost:3000`.

## Engineering Decisions

- **Why LangGraph?** Traditional sequential LLM chains cannot effectively handle the unpredictable loops of a tutoring session. LangGraph allows the system to circle back, wait for user input, and route between specialized nodes (Ideation vs. Review) based on the strict state of the conversation.
- **Why LangSmith Hub?** Hardcoding 50-line prompts inside Python nodes creates immense technical debt. By pulling prompts dynamically, prompt engineers can iterate independently of backend deployments.
- **Why Structured Output for Review?** While standard text streaming is ideal for conversational flow, code reviews demand strict UI rendering. Using LangChain's `.with_structured_output()` ensures the frontend always receives reliable, typed JSON payloads that map cleanly to React components.
