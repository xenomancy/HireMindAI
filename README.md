# 🧠 HireMind AI
### The Enterprise-Grade, AI-Powered Career Accelerator & Proctor-Hardened Interview Preparation Platform

HireMind AI is a state-of-the-art, recruiter-ready, and investor-ready AI SaaS platform designed to bridge the gap between job seekers and elite hiring bars. Leveraging a decoupled, high-performance microservices architecture (**MERN + Python FastAPI + RAG + GenAI**), the platform provides automated resume alignment scoring, metric-driven playground optimizations, interactive study path generation, and real-time proctored mock interview simulations utilizing advanced voice transcription and synthesized audio generation.

---

## 📖 Project Overview

Securing elite roles in today’s technical market requires passing both static ATS filters and highly dynamic, adaptive behavioral and technical interviews. HireMind AI addresses this by providing a unified, metric-driven prep cycle:

1.  **ATS Audit & Playground**: Parses PDF resume uploads using semantic matching pipelines to compare hard and soft skills against target job descriptions, scoring fit metrics and enabling direct rewrite playgrounds.
2.  **RAG-Driven Knowledge Base**: Indexes career roadmaps, historical interview transcripts, and optimal industry frameworks into a vector semantic retrieval pipeline to dynamically guide candidates.
3.  **Adaptive Interview Engine**: Conducts conversational mock interviews using Speech-to-Text (STT) and Text-to-Speech (TTS), dynamically injecting smart follow-up questions based on the candidate's active responses, while enforcing zero-tolerance anti-cheating protocols.

---

## 🔗 Live Production Links

You can access and test the deployed cloud infrastructure immediately:

*   **🌐 Frontend Application (Live React UI):** [https://hiremindai-0dcs.onrender.com](https://hiremindai-0dcs.onrender.com)
*   **⚙️ Backend API Service (Live Node.js API):** [https://hiremind-backend-9hxn.onrender.com](https://hiremind-backend-9hxn.onrender.com)
*   **🧠 AI Microservice (FastAPI Evaluator):** Linked securely inside Render's private low-latency virtual cloud network.

---

## 📸 Production UI Visuals

| Dashboard View | ATS Analyzer |
| :--- | :--- |
| ![Dashboard Placeholder](https://placehold.co/600x350/ffffff/111827?text=Premium+Analytics+Dashboard) | ![ATS Placeholder](https://placehold.co/600x350/ffffff/111827?text=ATS+Resume+Analyzer+%26+Scorecard) |

### Page Walkthroughs
*   **🌐 Live Landing Page**: High-impact modern grid with premium glassmorphism, responsive navigation bars, pricing structures, and quick-access hooks.
*   **📊 User Dashboard**: Displays analytical trajectory curves, previous audit reports, mock interview scores, overall competencies (Technical, Communication, Confidence), and active study check-boxes.
*   **📄 ATS Audit & Rewrite Playground**: Dual-pane workspace with drag-and-drop file upload, semantic alignment sliders, and an interactive text playground to test bullet optimizations in real-time.
*   **🎙️ Immersive Interview Arena**: Features volume sliders, speech indicators, visual mic buttons, live audio synth selectors, and real-time proctoring alert indicators.
*   **📅 Study Roadmap Generator**: Interactive 4-week calendar timeline broken down by days, featuring checkboxes and specific concepts tailored by AI.
*   **💬 Semantic RAG Assistant**: A dedicated chat-panel enabling users to ask conceptual questions and instantly retrieve parsed insights from custom documents.

---

## 💎 Features Section

### 📊 Elite Candidate Preparation Suite
*   **ATS Resume Analyzer**: Parses PDF text binaries and matches them semantically against target Job Descriptions, outputting scoring metrics across hard/soft skill quadrants.
*   **AI Mock Interviews**: Simulates realistic conversational simulations driven by LLMs, adapting questions dynamically on-the-fly.
*   **Context-Aware Question Generation**: Inspects the uploaded resume and targets questions based on actual projects and experiences.
*   **RAG Assistant**: Allows candidates to chat directly with their uploaded resume and target job descriptions, answering complex domain questions using a semantic context loop.
*   **Personalized Career Roadmaps**: Automatically formats a structured 4-week preparation timeline matching identified skill gaps.
*   **Performance Analytics & Timelines**: Draws historical score trajectory curves (via Recharts) mapping user prep growth.

### 🛡️ Core Infrastructure & Security
*   **Google OAuth 2.0**: Seamless single-sign-on integration for instant onboarding.
*   **JWT Stateful Sessions**: Secure route guards verifying identity signatures in HTTP headers.
*   **Anti-Cheating Detection**: 
    *   *Tab Switching Detection*: Visibility API logging of tab leaves.
    *   *Focus Loss Tracking*: Monitoring when users unfocus the main window.
    *   *UI Restriction*: Disabled right-clicks and Developer Tools shortcuts (`F12`, `Ctrl+Shift+I`).
    *   *Auto-Submit*: Disqualifies sessions and forces scoring upon **3 violations**.
*   **Multi-Service Pinger**: Built-in 10-minute automated pinger ensuring Free-Tier Render services remain active 24/7.

---

## 🛠️ Technological Architecture

```text
                                       +-----------------------------------+
                                       |      React SPA Client (Vite)      |
                                       +-----------------+-----------------+
                                                         |
                                                HTTPS / JWT / JSON
                                                         |
                                                         v
                                       +-----------------+-----------------+
                                       |    Node.js / Express API Gateway  |
                                       +--------+--------+--------+--------+
                                                |                 |
                                           Mongoose ODM       HTTP / JSON
                                                |                 |
                                                v                 v
                               +----------------+----+   +--------+------------------+
                               | MongoDB Atlas Cloud |   | FastAPI AI Microservice  |
                               +---------------------+   +--------+--------+--------+
                                                                  |        |
                                                          PyPDF2  |        | LangChain / LlamaIndex
                                                                  v        v
                                                         +--------+---+  +------------------+
                                                         | Resume PDF |  | Groq Llama 3 LLM |
                                                         +------------+  +------------------+
```

### 1. Web Client (Frontend)
*   **Framework**: React 18, Vite (Fast HMR compilation).
*   **Routing**: React Router DOM v6.
*   **Styling**: Vanilla CSS + Tailwind CSS (warm neutral minimalist design).
*   **Visualization**: Recharts (Responsive SVG Charts).
*   **API Client**: Axios with interceptor layers managing global JWT hooks.

### 2. API Gateway (Backend)
*   **Framework**: Node.js, Express.js.
*   **Database ODM**: Mongoose.
*   **Authorization**: JsonWebToken (JWT), Bcrypt.js password hashing.
*   **Payments**: Stripe SDK & Stripe Webhook signature parsers.

### 3. AI Service (Python Microservice)
*   **Framework**: Python 3.10+, FastAPI, Uvicorn.
*   **AI Engine**: Groq API Client (`llama-3.1-8b-instant`), LangChain.
*   **PDF Extraction**: PyPDF2.
*   **Vector Engine**: Local lightweight vector embeddings (SentenceTransformers) + Cosine similarity indexing.

---

## 📁 Repository Directory Structure

```text
HireMind-AI/
├── backend/
│   ├── config/              # Database configurations (db.js)
│   ├── middleware/          # JWT validation (auth.js), error handlers (error.js)
│   ├── models/              # User, Resume, Interview, Roadmap schemas
│   ├── routes/              # Modular controller routes (auth, resume, interview, payment)
│   ├── Dockerfile           # Backend container settings
│   ├── package.json
│   └── server.js            # Node main app & 24/7 keep-awake loop
├── ai-service/
│   ├── routes/              # FastAPI controllers (ats, interview, roadmap, rag)
│   ├── services/            # LLM prompts, Groq adapters, embeddings services
│   ├── utils/               # Binary PDF parsers
│   ├── Dockerfile           # FastAPI container settings
│   ├── main.py              # Python service router entrypoint
│   └── requirements.txt     # Python dependencies (fastapi, PyPDF2, uvicorn, groq)
├── frontend/
│   ├── src/
│   │   ├── components/      # PremiumModal, Navbar, Sidebar, ProctorWidget
│   │   ├── pages/           # Landing, Auth, Dashboard, ATS, InterviewPrep, Session, Roadmap
│   │   ├── App.jsx          # Route paths, axios configuration, and context states
│   │   └── index.css        # Core styling, fonts, and scrollbar modifications
│   ├── Dockerfile           # Frontend static container
│   ├── tailwind.config.js   # Tailored color system and UI constants
│   ├── package.json
│   └── index.html
└── docker-compose.yml       # Global container orchestration setting
```

---

## 🛠️ Step-by-Step Installation Guide

### Prerequisites
Make sure you have node (v18+), python (v3.10+), and git installed locally.

### 1. Clone the Project
```bash
git clone https://github.com/xenomancy/HireMindAI.git
cd HireMindAI
```

### 2. Set Up the Node.js Backend API
```bash
cd backend
npm install
# Create an environment file (.env) in backend/
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hiremind
JWT_SECRET=your_production_ready_secret_key_abc
AI_SERVICE_URL=http://localhost:8000
STRIPE_SECRET_KEY=your_stripe_developer_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Launch backend in development mode:
npm run start
```

### 3. Set Up the Python FastAPI AI Microservice
```bash
# Return to root, then navigate to ai-service
cd ../ai-service
# Create a virtual environment
python -m venv venv
# Windows activate:
venv\Scripts\activate
# macOS/Linux activate:
source venv/bin/activate

pip install -r requirements.txt
# Set environment variables:
set GROQ_API_KEY=your_groq_api_key_here
set PORT=8000

# Launch FastAPI server:
python main.py
```

### 4. Set Up the React Frontend Client
```bash
cd ../frontend
npm install
# Configure target API endpoint:
# Create a .env:
# VITE_API_URL=http://localhost:5000

# Launch Client Dev Server:
npm run dev
```
Open your browser to [http://localhost:5173](http://localhost:5173) to run the application locally!

---

## 📝 Environment Variables Reference

Below is a complete reference of the required configuration keys across directories:

```text
# Backend Environment Keys (backend/.env)
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hiremind
JWT_SECRET=your_jwt_signing_key_secret_xyz
AI_SERVICE_URL=http://localhost:8000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Service Environment Keys (ai-service/)
GROQ_API_KEY=gsk_...
PORT=8000

# Frontend Environment Keys (frontend/)
VITE_API_URL=http://localhost:5000
```

---

## 📄 Deep-Dive: ATS Analyzer Engine

The ATS Analyzer acts as a semantic comparison gateway between a candidate's resume and their target Job Description (JD). 

```text
+--------------+     +--------------+
|  Resume PDF  |     |   Target JD  |
+------+-------+     +------+-------+
       |                    |
       | Extract Text       | Parse Text
       v                    v
+------+--------------------+-------+
|  Groq Llama 3.1 Semantic Matching |
+------+----------------------------+
       |
       +---> Keyword Comparison (Hard & Soft skills matching)
       +---> Contextual Experience Scoring (Verbs, metrics, impact)
       +---> Formulates JSON Structure output
```

*   **Extraction & Cleaning**: The FastAPI service reads the PDF binary buffer, converts it to clean Unicode text blocks, and sanitizes special characters.
*   **Semantic Matching vs. Keyword Stuffing**: Traditional ATS platforms match exact strings (meaning "ReactJS" won't match "React"). HireMind AI uses LLM semantic evaluation to verify conceptual experience, ensuring synonym skills are scored correctly.
*   **Structured Output**: Returns structured metrics including:
    *   *Skill Gaps*: Skills missing from the resume that are crucial in the JD.
    *   *Confidence Audit*: Reviewing bullet points for weak verbs (e.g., "helped with") and suggesting active metrics (e.g., "orchestrated... resulting in a 40% speed upgrade").
    *   *JD Alignment Percentage*: Realistic 0–100 scorecards.

---

## 🧠 Deep-Dive: RAG Pipeline & Semantic Search

HireMind AI implements a highly efficient **Retrieval-Augmented Generation (RAG)** pipeline allowing candidates to ask deep contextual questions regarding the uploaded resume, target JD, or study frameworks:

1.  **Text Chunking**: Splits extracted document texts into logical, overlapping blocks (500 characters chunk size, 100 character overlap) to preserve local semantic contexts.
2.  **Embeddings Generation**: Chunks are processed through lightweight text-embedding models (e.g., `SentenceTransformers`) or LLM embedding hooks to output dense vector spaces.
3.  **Vector Store & Retrieval**: 
    *   Generates a local cosine-similarity index representing chunk vectors.
    *   When the user submits a RAG query (e.g., *"Does my background in SQL match the data pipelines required in this JD?"*), the query is vectorized and compared against the store.
    *   Retrieves the **Top-K** most relevant chunks and feeds them into the system prompt of the Llama 3 model, synthesizing a highly precise, context-bounded response.
4.  **Fuzzy String Matching Fallback**: If vector comparisons return low confidence scores, the system deploys a fuzzy string search mapping acronyms and related terms to ensure robust response rates.

---

## 🎙️ Deep-Dive: AI Interview Engine

The Live Mock Interview Arena is an immersive, adaptive simulation engineered to mimic an elite hiring coordinator:

```text
[Init Session] ---> (Generate Custom Question) ---> [TTS Synthesizer]
                                                           |
                                                    Spoken aloud to User
                                                           |
                                                           v
[Final Scores] <--- (Score Answer & Viols) <--- [STT Voice Capturer]
```

*   **Adaptive Follow-Ups**: Instead of reading a static checklist of questions, the AI engine listens to the candidate's transcript, evaluates the answer for depth, correctness, and structure (STAR method), and dynamically formulates relevant follow-up questions (e.g., *"You mentioned migrating the database; what database did you use, and how did you minimize write downtime?"*).
*   **Comprehensive Scoring**: Upon session completion, the system scores the conversation across:
    *   *Technical Precision*: Correct terminology, methodologies, and architectural accuracy.
    *   *Communication Quality*: Word fillers count, explanation clarity, structure.
    *   *Confidence Metric*: Pacing, vocabulary strength.
*   **Anti-Cheating Proctoring Engine**: The UI maintains page visibility and window focus listeners. Opening another tab, launching Developer Tools, or clicking right-click registers a violation. Upon **3 violations**, the session auto-submits, flags the database record as `"Disqualified due to Proctor Violations"`, and reduces the final score instantly.

---

## 🛡️ Enterprise Security & Validation

*   **Stateful JWT Route Protection**: Backend routes (ATS audits, Mock sessions, Roadmaps) are guarded by a security layer that decodes token payloads to isolate user spaces, ensuring no cross-account data leaks.
*   **Cryptographic Password Hashing**: Passwords are saved as cryptographically signed hashes using Bcrypt, protecting accounts from database compromises.
*   **Rate Limiting**: Defends endpoints against brute-force account registration and AI query floods.
*   **Secure File Stream Validations**: Before sending binary PDFs to FastAPI, the Express backend verifies MIME-types and file size limits (max 5MB) to defend the pipeline against buffer overflow exploits and remote code execution payloads.

---

## 🐳 Production Containerization (Docker)

HireMind AI is fully Dockerized for uniform local development and instant deployment scaling.

### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### AI Service Dockerfile (`ai-service/Dockerfile`)
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

### Unified Orchestration (`docker-compose.yml`)
Launch the entire integrated full-stack environment with a single command:
```yaml
version: '3.8'

services:
  database:
    image: mongo:latest
    container_name: hiremind-db
    ports:
      - "27017:27017"

  ai-service:
    build: ./ai-service
    container_name: hiremind-ai
    environment:
      - GROQ_API_KEY=your_groq_api_key_here
      - PORT=8000
    ports:
      - "8000:8000"

  backend:
    build: ./backend
    container_name: hiremind-backend
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://database:27017/hiremind
      - JWT_SECRET=sandbox_jwt_key_secret_abc
      - AI_SERVICE_URL=http://ai-service:8000
    ports:
      - "5000:5000"
    depends_on:
      - database
      - ai-service

  frontend:
    build: ./frontend
    container_name: hiremind-client
    ports:
      - "3000:80"
    depends_on:
      - backend
```
Boot the services:
```bash
docker-compose up --build
```

---

## 🚀 Cloud Deployment Architecture

### 1. React Static Client (Vercel / Render Static)
*   **Static Rewrite configuration (`vercel.json`)**: Configured to route clean SPA routes (e.g., `/ats`, `/roadmap`) back to `index.html` to avoid `404 Not Found` page errors during manual browser reloads.
*   **Variable Binding**: The `VITE_API_URL` variable is bound at compilation to point to the live Render backend gateway URL.

### 2. Node.js API Service (Render Web Service)
*   **Build Target**: Connected directly to the GitHub repository, matching root directory `/backend`.
*   **Build/Start Scripts**: Executing `npm install` and starting via `node server.js`.
*   **Cloud MongoDB Atlas Bindings**: Swapped out local database URIs for high-availability cloud cluster replicas.

### 3. MongoDB Atlas Cluster
*   **Authentication**: Configured dedicated read/write database user (`kaushik_699`).
*   **Network Security**: Whitelisted `0.0.0.0/0` (Access from Anywhere) to permit dynamic Render container routing.

---

## 📡 API Routing Documentation

### Authentication Routing (`/api/auth`)
*   `POST /register`: Registers a new user. Expects `name`, `email`, `password`.
*   `POST /login`: Validates credentials and returns JWT token + user details.
*   `POST /google`: SSO bypass endpoint writing or retrieving Google profiles from Atlas.
*   `GET /me`: Returns the currently authenticated user's profile and active usage limits.
*   `POST /upgrade`: Instant SaaS plan toggler (updates user plan state from `'free'` to `'premium'`).

### ATS Evaluation Routing (`/api/resume`)
*   `POST /upload`: Securely uploads PDF resume streams, triggers parsing, and returns structured fit scores.

### Mock Sessions Routing (`/api/interview`)
*   `POST /session`: Initializes a mock interview session and returns custom AI questions.
*   `POST /respond`: Submits user response transcripts, returns dynamic follow-ups, and logs violations.
*   `POST /submit/:id`: Finalizes mock evaluations, scoring and closing active sessions.

### RAG Assistant Routing (`/api/rag`)
*   `POST /query`: Takes text query, performs vector comparisons on chunks, and returns synthesised Groq responses.

---

## ⚡ Performance Optimizations

*   **Keep-Awake Cron pinging**: The backend implements a 10-minute automated background pinger to keep the AI microservice active. Paired with a `.github/workflows/keep_awake.yml` Actions cron, the entire platform remains awake 24/7, skipping Render's free tier sleep cycles entirely.
*   **Token Isolation and Indexing**: Database indexes are configured on Mongoose schemas for fields like `email` and `userId` to speed up database reads.
*   **Local Sentence Embeddings Cache**: The Python service caches vector sentence structures to prevent repeated model downloads, minimizing query latencies.

---

## 🔮 Future Roadmap Plans

*   **Multilingual Mock Sessions**: Introduce support for Spanish, German, French, and Japanese conversational simulations.
*   **Real-time AI Avatars**: Fully animated 3D interview coordinators that speak directly to the candidate, responding in sync with audio outputs.
*   **Live Interactive Coding Environments**: A sandboxed terminal page letting candidates solve algorithmic LeetCode challenges while being audited by GenAI coordinators.

---

## 🌟 Why This Project Stands Out

Rather than acting as a simple wrapper around LLM endpoints, **HireMind AI** implements a professional full-stack platform:
1.  **Fully Proctored Integrity**: The proctoring module prevents cheating, which is a key requirement for real-world enterprise mock interview services.
2.  **Accurate Semantic Matching**: Uses RAG vectors to answer domain-specific conceptual questions, preventing LLM hallucination.
3.  **Real Stripe Gateway Integration**: Utilizes production-ready Stripe Webhooks, proving the ability to engineer actual monetization frameworks.
4.  **Highly Resilient Fallbacks**: If external API keys are missing, backend fallback loops keep the UI functional, demonstrating a robust design philosophy.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.

---

## ✍️ Author & Contact

*   **GitHub**: [github.com/xenomancy](https://github.com/xenomancy)
*   **LinkedIn**: [linkedin.com/in/kaushik-699](https://linkedin.com/in/kaushik-699)
*   **Portfolio**: [kaushik.hiremind.ai](https://kaushik.hiremind.ai)
