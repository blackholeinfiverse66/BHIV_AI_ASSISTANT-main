# BHIV-AI-ASSISTANT

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

**Brain-Human Interface Virtual (BHIV)** is a full-stack AI assistant with a multi-agent backend and production-ready React frontend.
It integrates Seeya's NLU system, Sankalp’s cognitive task engine, and Chandresh’s secure embeddings with your BHIV multi-agent brain.

```
User Input → SummaryFlow → IntentFlow → TaskFlow → Decision Hub → BHIV Core → Reasoning Engine → Multi-Agent System → Tools → Memory
                                                                │
                                                                └─ Simple Response (LLM)
```

---

# 🧠 Core Architecture

## BHIV Multi-Agent System
- **5 Specialized Agents**: Planner, Researcher, Analyst, Executor, Evaluator  
- **Reasoning Engine**: Multi-step chain-of-thought orchestration  
- **Secure Embeddings**: User-specific obfuscation via EmbedCore  
- **Cognitive Mapping**: TaskFlow by Sankalp  
- **NLU Layer**: SummaryFlow + IntentFlow by Seeya  

## Key Features
- Multi-Agent Reasoning (BHIV Core)
- Secure memory with vector embeddings
- Advanced NLU pipeline (summary → intent → task)
- Cognitive task classification (reminders, meetings, emails, notes...)
- Multi-LLM support: **OpenAI, Groq, Google, Mistral**
- Speech-to-text & text-to-speech
- Tools for automation, search, browsing, calculator, files
- Security: JWT, API keys, rate limiting, encrypted memory
- Multi-platform clients (Android, iOS, Web, Desktop)

---

# 🚀 Quick Start

## Prerequisites
- Python **3.11+**
- Node.js **18+**
- Docker (optional)

## Local Development

### Option 1: Automated Startup (Recommended)
```bash
git clone <repository-url>
cd BHIV-AI-ASSISTANT

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..

# Start both servers automatically
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Startup
```bash
git clone <repository-url>
cd BHIV-AI-ASSISTANT

# Backend setup
pip install -r requirements.txt
cp .env.example .env  # Edit .env with your API keys

# Frontend setup
cd frontend
npm install
cp .env.example .env.local  # Edit with API configuration

# Start servers (in separate terminals)
# Terminal 1 - Backend:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend:
cd frontend && npm run dev
```

### 3. Access Applications
- **🎨 Frontend App** → http://localhost:5173 (React/TypeScript client)
- **🔧 Backend API** → http://localhost:8000
- **📚 API Docs** → http://localhost:8000/docs
- **💚 Health Check** → http://localhost:8000/health
- **📊 Metrics** → http://localhost:8000/metrics

---

# 🐳 Docker Deployment

### Docker Compose
```bash
docker-compose up --build
```

### Or Build Manually
```bash
docker build -t bhiv-ai-assistant .
docker run -p 8000:8000 --env-file .env bhiv-ai-assistant
```

---

# 🎨 Frontend Client

The React/TypeScript frontend provides a complete UI for all backend features with production-ready patterns.

## Features
- **Full API Integration**: Every backend endpoint wired with TypeScript types
- **Authentication**: API key + JWT Bearer token support with persistent storage
- **Responsive Design**: Dark theme, mobile-friendly, accessible (WCAG compliant)
- **Real-time Updates**: Optimistic updates, loading states, error handling
- **Development Tools**: Testing, linting, formatting, build scripts

## Quick Start (Frontend)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

## Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier

## Frontend Architecture
- **Vite** + **React 19** + **TypeScript**
- **React Router** for navigation
- **TanStack Query** for API state management
- **React Hook Form** + **Zod** for forms
- **Tailwind-like CSS** with custom design system
- **Vitest** + **Testing Library** for testing

---

# 🏗️ Module Architecture

## BHIV Core System
- `core/bhiv_core.py` — Multi-agent orchestrator  
- `core/bhiv_reasoner.py` — Reasoning engine (Planner → Researcher → Analyst → Executor → Evaluator)  
- `agents/` — Specialized reasoning agents  

## NLU Processing (Seeya)
- `summaryflow.py`  
- `intentflow.py`  

## Cognitive Task Mapping (Sankalp)
- `taskflow.py` (reminder, meeting, call, note, email, alarm, calendar, general_task)  

## Memory & Embeddings (Chandresh)
- `embed_core/` — Secure embedding pipeline  
- `memory/memory_manager.py` — Vector memory  

## Core Infrastructure
- `database.py` — Database layer  
- `logging.py` — Logging  
- `security.py` — Authentication + audit logging  
- `llm_bridge.py` — Multi-LLM manager  
- `decision_hub.py` — Simple vs complex task routing  
- `rl_selector.py` — RL action handler  

## Tools
- Search tool  
- Web browser automation  
- Calculator  
- File operations  
- Automation  

---

# 🔌 API Endpoints

### BHIV System
- `POST /api/bhiv/run` — Execute complex tasks with BHIV  
- `POST /api/respond` — General LLM-based response  

### NLU (Seeya)
- `POST /api/summarize`  
- `POST /api/intent`  

### Task Mapping (Sankalp)
- `POST /api/task`  

### Embeddings (Chandresh)
- `POST /api/embed`  
- `POST /api/embed/similarity`  

### Voice
- `POST /api/voice-stt`  
- `POST /api/voice-tts`  

### System
- `/health`  
- `/metrics`  

### Optional (disabled for now)
- `/api/external-app`  

---

# 🔄 BHIV Processing Pipeline

### Input Processing
1. SummaryFlow → extract key points  
2. IntentFlow → classify + extract entities  
3. TaskFlow → convert into structured task  
4. DecisionHub → select simple vs complex  

### Complex Task Execution
5. BHIV Core  
6. Reasoning Engine (multi-step chain-of-thought)  
7. Multi-Agent System (planner → researcher → analyst → executor → evaluator)  
8. Tool execution  
9. Memory update via EmbedCore  

---

# ⚙️ Configuration

### Required
- `API_KEY`
- `JWT_SECRET_KEY`

### LLM Keys
- `OPENAI_API_KEY`
- `GROQ_API_KEY`
- `GOOGLE_API_KEY`
- `MISTRAL_API_KEY`

### Optional
- `SENTRY_DSN`
- `DATABASE_URL`
- `LOG_FILE`

---

# 📁 Project Structure

```
├── app/                           # FastAPI Backend
│   ├── main.py
│   ├── core/
│   │   ├── bhiv_core.py
│   │   ├── bhiv_reasoner.py
│   │   ├── summaryflow.py
│   │   ├── intentflow.py
│   │   ├── taskflow.py
│   │   ├── decision_hub.py
│   │   ├── llm_bridge.py
│   │   └── ...
│   ├── agents/
│   ├── tools/
│   ├── memory/
│   │   ├── memory_manager.py
│   │   ├── long_term.json
│   │   ├── short_term.json
│   │   ├── traits.json
│   │   └── user_profile.json
│   ├── embed_core/
│   └── routers/
├── frontend/                      # React Frontend
│   ├── src/
│   │   ├── app/                   # App logic
│   │   │   ├── auth/              # Authentication
│   │   │   └── layout/            # Layout components
│   │   ├── api/                   # API client & types
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   ├── styles/                # CSS
│   │   └── utils/                 # Utilities
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
├── client_adapters/
├── deploy/
├── hooks/
├── tests/
├── data/
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

# 🚀 Usage Examples

### 1. Simple Response
```bash
curl -X POST "http://localhost:8000/api/respond" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"text": "What is the weather today?", "model": "chatgpt"}'
```

### 2. Full BHIV Multi-Agent Task
```bash
curl -X POST "http://localhost:8000/api/bhiv/run" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"text": "Research renewable energy trends and create a summary"}'
```

### 3. NLU Pipeline
```bash
curl -X POST "http://localhost:8000/api/summarize" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your long text"}'

curl -X POST "http://localhost:8000/api/intent" \
  -H "Content-Type: application/json" \
  -d '{"text": "Remind me to call John tomorrow at 3pm"}'

curl -X POST "http://localhost:8000/api/task" \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "task",
    "entities": {"text": "Call John"},
    "text": "Remind me to call John tomorrow at 3pm"
  }'
```

### 4. Secure Embeddings
```bash
curl -X POST "http://localhost:8000/api/embed" \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Hello world"],
    "user_id": "user123",
    "platform": "web"
  }'
```

---

# 👥 Team Contributions

- **Nilesh** — BHIV Core, DecisionHub, LLM Bridge, Architecture  
- **Seeya** — SummaryFlow + IntentFlow (NLU Engine)  
- **Sankalp** — Cognitive TaskFlow Engine  
- **Chandresh** — EmbedCore + Secure Memory  

---

# 🔧 Development & Testing

```bash
pytest tests/
```

Check modules:
```bash
python -c "from app.core.summaryflow import summary_flow; print('OK')"
python -c "from app.core.intentflow import intent_flow; print('OK')"
python -c "from app.core.taskflow import task_flow; print('OK')"
python -c "from app.main import app; print('BHIV Ready')"
```

---

# 📄 License
- BHIV Core — MIT  
- EmbedCore — Proprietary (Chandresh)  
- SummaryFlow/IntentFlow — Proprietary (Seeya)  
- TaskFlow — Proprietary (Sankalp)  

---

# 🎯 Roadmap
- More agent specialization
- Tool expansion
- Multi-modal support
- Realtime collaboration
- Autonomous workflows

---

# 📝 Recent Updates

### v1.0.x (Latest)
- **LLM Bridge Enhancement**: Replaced mock responses with real API integrations for OpenAI (GPT-3.5-turbo), Groq (Mixtral-8x7B), Google Generative AI (Gemini Pro), and Mistral (Mistral Medium). API keys are now required and validated from environment variables.
- **Project Cleanup**: Removed all `__pycache__` directories across the project for cleaner repository management.

### Previous Updates
- Initial multi-agent architecture implementation
- Secure embedding pipeline integration
- NLU and cognitive task mapping modules
- Docker containerization
