# HireMind.ai — Complete Full-Stack AI Interview preparation SaaS Platform

HireMind AI is an investor-ready, comprehensive AI-powered preparation SaaS workspace built using a highly scalable **MERN + GenAI** decoupled microservices architecture. It parses resumes against specific target job descriptions, evaluates alignment scores, provides drop-in metrics-driven bullet optimization playgrounds, generates tailored 4-week calendar roadmaps, and conducts conversational mock interviews utilizing **Voice-to-Text Speech transcription** and **Audio Text-to-Speech synthesis**.

Designed with a premium minimalist aesthetic inspired by Apple, Linear, and Notion (warm off-whites, neutral charcoal text, custom margins, and clean HSL accent badges).

---

## 🚀 Architectural Modules & Tech Stack

*   **Core Backend (Express & Node.js)**: Orchestrates database routing, registers standard MERN entities (Resumes, Reports, Interviews, study roadmaps), handles JWT sessions, and aggregates score timelines.
*   **AI Microservice (Python FastAPI & Uvicorn)**: Hooks directly into the Groq Llama 3 API (`llama-3.1-8b-instant`), parses complex PDF binaries with `PyPDF2`, and constructs structured evaluation JSON trees.
*   **Web Client (React, Vite & Tailwind CSS)**: Smooth client routes, interactive analytics curves (via Recharts), customized drag-and-drop boxes, live transcript review checklists, Web Speech STT voice answerers, and audio synthesized voice selectors.
*   **Orchestration (Docker & Compose)**: Ready-to-go `Dockerfile` configs for frontend, backend, and FastAPI microservice, backed by a global `docker-compose.yml` for unified local booting.

---

## 📁 Repository Directory Structure

```text
AI interviewer/
├── backend/
│   ├── config/              # MongoDB Mongoose configurations
│   ├── middleware/          # JWT protection and error catch blocks
│   ├── models/              # User, Resume, Interview, Roadmap schemas
│   ├── routes/              # Modular controller endpoints with Sandbox Fallbacks
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── ai-service/
│   ├── routes/              # FastAPI controllers (ATS, Interview, Roadmap)
│   ├── services/            # Groq Llama 3 API wrappers and local embeddings client
│   ├── utils/               # PDF-to-Text binary parser
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Glassmorphic Navbar & active Sidebar
│   │   ├── pages/           # Core page views (Dashboard, ATS, Optimizer, Mock)
│   │   ├── App.jsx          # Router & Guest Sandbox session orchestrator
│   │   ├── index.css        # Custom scrollbars & outfits typography layer
│   │   └── main.jsx         # React root mounting
│   ├── Dockerfile
│   ├── tailwind.config.js   # Notion/Apple warm-white color configurations
│   ├── vite.config.js       # Proxied compiler settings
│   └── index.html
└── docker-compose.yml       # Production-ready orchestration
```

---

## 💎 Custom Premium SaaS Integrations

1.  **SaaS Dynamic Plan Swapper**:
    Every workspace account comes with a **plan toggler badge** in the sidebar. You can instantly click it to toggle your account state between `Free Plan` and `Premium Plan` to test out usage ceilings in real-time!
    *   *Free Plan caps:* Max 3 Resumes, Max 3 Mocks, Max 2 Roadmaps.
    *   *Premium Plan caps:* Unlimited audits, live mocks, and study roadmap logs.
2.  **Dynamic Sandbox Offline Resiliency Engine**:
    To ensure the platform remains 100% functional, even without active external MongoDB credentials or network connections to the FastAPI microservice, the Express router integrates a complete fallback simulator. If endpoints time out or fail, the backend generates dynamic word-count reviews, realistic resume feedback breakdowns, and study pathway timelines, allowing you to showcase the fully interactive frontend dashboard immediately.
3.  **High-Fidelity Dialogue Audio Control**:
    The live mock interviewer lets you check a Volume sound control to synthesize questions out loud using your system's natural audio voices. Click the Mic button to translate voice answers to text, bypassing keyboard typing.

---

## 🛠️ Individual Service Local Setup (Without Docker)

### 1. MongoDB Database Setup
Ensure you have a local MongoDB daemon running on standard port `27017` or use an external Mongo Atlas connection string.

### 2. Core Node.js Express Server Setup
```bash
cd backend
npm install
# Create an environment file in backend/.env:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/hiremind
# JWT_SECRET=your_production_ready_secret_key_abc
# AI_SERVICE_URL=http://localhost:8000
npm run start
```

### 3. Python FastAPI AI Service Setup
```bash
cd ai-service
# (Optional) Create a virtual environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Set environment variables:
# set GROQ_API_KEY=your_groq_api_key_here
# set PORT=8000
python main.py
```

### 4. React Client Dev Server Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Instant Docker Compose Setup (Recommended)

To spin up the entire multi-service platform in a single line:

1.  Open the global `docker-compose.yml` in the root folder and verify the preset Groq API key in the `ai-service` environment block:
    ```yaml
    GROQ_API_KEY: your_groq_api_key_here
    ```
2.  Run the compose command:
    ```bash
    docker-compose up --build
    ```
3.  The frontend is exposed on port **3000** ([http://localhost:3000](http://localhost:3000)).
    *   The Node API server is mapped on port **5000** ([http://localhost:5000](http://localhost:5000)).
    *   The FastAPI Python server is mapped on port **8000** ([http://localhost:8000](http://localhost:8000)).
