from fastapi import APIRouter, HTTPException
from services.gemini import GeminiClient
from pydantic import BaseModel
from typing import Optional, List
import random

router = APIRouter(prefix="/interview", tags=["AI Interview Chat"])

class InterviewGeneratePayload(BaseModel):
    resume_text: Optional[str] = ""
    role: str = "Software Engineer"
    difficulty: str = "Mid"
    company_style: str = "General"
    skills: Optional[List[str]] = []
    projects: Optional[List[dict]] = []
    ats_score: Optional[int] = 70
    missing_keywords: Optional[List[str]] = []
    job_description: Optional[str] = ""
    exclude_questions: Optional[List[str]] = []

class InterviewEvaluatePayload(BaseModel):
    question: str
    answer: str
    role: str = "Software Engineer"
    difficulty: str = "Mid"

# Dynamic Question Banks for fallbacks & semantic rotational triggers
FALLBACK_QUESTIONS = {
    "Entry": [
        "How do React Hooks improve component state and lifecycle architecture compared to class components?",
        "Explain custom hooks with a practical example from your past work.",
        "When would you choose to avoid using useEffect, and what are the performance alternatives?",
        "How does Node.js handle high-concurrency requests under its single-threaded event loop architecture?",
        "Explain the differences between SQL and NoSQL database schemas with respect to read/write scaling."
    ],
    "Mid": [
        "Explain how you would diagnose and resolve a severe memory leak in a high-traffic production Node.js service.",
        "How does React manage hooks internally? Explain the fiber reconciliation structure and hook indexes.",
        "Describe a scenario where you had to integrate a high-throughput message broker like Kafka or RabbitMQ. What trade-offs were made?",
        "How do you handle Redis cache invalidation strategies (e.g. Cache-Aside, Write-Through) in a distributed setup?",
        "What strategies do you implement to secure REST API endpoints against OWASP Top 10 vulnerabilities?"
    ],
    "Senior": [
        "Architect a globally distributed notification engine capable of delivering millions of real-time push alerts with sub-second latency.",
        "How do you manage database replication, connection pooling, and sharding in a high-traffic PostgreSQL or MongoDB system?",
        "Explain how you would design a robust CI/CD pipeline incorporating automated blue-green deployments and container orchestrations.",
        "How do you enforce optimal query latency and indexing configurations under millions of document records in MongoDB?",
        "Describe a major architectural failure you experienced. What diagnostics did you run, and how was it permanently mitigated?"
    ]
}

@router.post("/generate")
async def generate_interview_questions(payload: InterviewGeneratePayload):
    # Standard fallback questions if Gemini API key is missing
    if not GeminiClient.is_configured():
        # High fidelity, role-appropriate fallback generator
        fallbacks = {
            "HR": f"Walk me through your professional background as a {payload.role} and outline your primary engineering accomplishments.",
            "Technical": "How do you manage system resources and optimize performance under heavy real-time data or network concurrency?",
            "Behavioral": "Describe a scenario where you faced a significant production failure or critical bugs. What diagnostic steps did you take?",
            "Project-based": "Can you explain the detailed architecture of a major project you built, focusing on your specific tech choices and trade-offs?",
            "Scenario-based": "Design a highly available database and queue infrastructure capable of handling millions of real-time events under high concurrency."
        }
        
        role_lower = payload.role.lower()
        if "frontend" in role_lower or "react" in role_lower:
            fallbacks["Technical"] = "Explain how React manages hooks internally, and how components reconcile structural Virtual DOM diffs. How do you prevent unnecessary re-renders?"
            fallbacks["Project-based"] = "In your past Frontend projects, how did you handle state management across deeply nested components? Compare Redux and the Context API."
            fallbacks["Scenario-based"] = "Design a responsive real-time UI dashboard receiving heavy volumes of telemetry updates. How do you ensure the UI thread is not blocked?"
        elif "backend" in role_lower or "node" in role_lower:
            fallbacks["Technical"] = "Explain how Node.js manages high-concurrency requests under its single-threaded event loop. How do you scale database connection pools and indexes?"
            fallbacks["Project-based"] = "Outline the security flow in your APIs. How did you secure your REST endpoints and database queries against OWASP Top 10 vulnerabilities?"
            fallbacks["Scenario-based"] = "Architect a robust cache-aside distributed database pattern using Redis. How do you handle cache stampede and data invalidation?"
        elif "ai" in role_lower or "ml" in role_lower or "machine" in role_lower or "nlp" in role_lower:
            fallbacks["Technical"] = "Explain the core difference between sparse and dense vector embeddings. How do transformers handle attention calculations?"
            fallbacks["Project-based"] = "Detail your experience building a RAG retrieval pipeline. How did you structure your vector database indexing, chunking, and embedding models?"
            fallbacks["Scenario-based"] = "Design a scalable machine learning inference pipeline that handles concurrent model classification requests with minimal GPU latency."

        questions_list = []
        for cat, q_text in fallbacks.items():
            questions_list.append({
                "type": cat,
                "question": q_text,
                "expectedTopics": [payload.role, cat],
                "difficulty": payload.difficulty
            })
            
        return {
            "role": payload.role,
            "difficulty": payload.difficulty,
            "questions": questions_list
        }

    try:
        system_instruction = (
            "You are an elite, senior FAANG-level principal software engineering interviewer and technical recruiter.\n"
            "Your objective is to generate 5 highly specific, demanding, and technically rigorous interview questions tailored precisely to the candidate's profile.\n"
            "You MUST return a JSON object containing the exact role, baseline difficulty, and a list of questions.\n"
            "DO NOT include any explanation preambles, notes, or markdown wrap. The response MUST be pure, valid JSON."
        )

        projects_info = ""
        if payload.projects:
            projects_info = "\nCandidate Projects from Resume:\n" + "\n".join([
                f"- Name: {p.get('name') or p.get('role')}\n  Summary: {p.get('summary') or p.get('description')}"
                for p in payload.projects if p
            ])

        skills_info = ""
        if payload.skills:
            skills_info = f"\nDetected Technical Skills: {', '.join(payload.skills)}"

        missing_keywords_info = ""
        if payload.missing_keywords:
            missing_keywords_info = f"\nATS Skill Gaps / Missing Keywords: {', '.join(payload.missing_keywords)}"

        exclude_section = ""
        if payload.exclude_questions:
            exclude_section = "\nCRITICAL: DO NOT repeat or ask anything similar to the following previously asked questions:\n" + "\n".join([f"- {q}" for q in payload.exclude_questions])

        prompt = f"""
        Generate 5 custom-tailored, category-specific interview questions for the following candidate profile:
        Target Role: {payload.role}
        Baseline Seniority/Difficulty: {payload.difficulty} (Adjust specific question difficulty slightly based on the ATS score and context)
        Company Vibe / Standard: {payload.company_style}
        ATS Score: {payload.ats_score}
        Job Description: {payload.job_description or "N/A"}
        
        Resume / CV Raw Text:
        {payload.resume_text or "No CV parsed."}
        {skills_info}
        {projects_info}
        {missing_keywords_info}
        {exclude_section}

        ROLE-SPECIFIC QUESTION REQUIREMENT DETAILS:
        - If Target Role is Frontend Developer: Questions MUST cover React, JavaScript, API integration, performance optimization (e.g., rendering bottlenecks), responsive UI, and state management. Do NOT generate unrelated questions.
        - If Target Role is Backend Developer: Questions MUST cover APIs, databases, authentication/security, scalability, and caching. Do NOT generate unrelated questions.
        - If Target Role is AI/ML Engineer: Questions MUST cover machine learning, embeddings, transformers, and vector databases. Do NOT generate unrelated questions.
        - If Target Role is any other software role: Stay highly specific to that technology stack.

        QUESTION CATEGORIES REQUIREMENT:
        You MUST generate exactly 5 questions, one for each category:
        1. HR: Role fit, career trajectory, core strengths.
        2. Technical: Low-level frameworks, execution mechanisms, performance boundaries.
        3. Behavioral: Team conflict, high-ownership project challenge using STAR methodology.
        4. Project-based: Deep-dive into one of the candidate's actual projects (e.g. from CV projects). Focus on: architecture, implementation, optimization, or challenge.
        5. Scenario-based: Real-world system scaling, latency debugging, containerization, or API integration challenge.

        Return structured JSON format exactly matching this schema:
        {{
          "role": "{payload.role}",
          "difficulty": "{payload.difficulty}",
          "questions": [
            {{
              "type": "HR",
              "question": "Descriptive fit question...",
              "expectedTopics": ["career growth", "motivation"],
              "difficulty": "Easy"
            }},
            {{
              "type": "Technical",
              "question": "Deep technical execution question...",
              "expectedTopics": ["React hooks", "reconciliation"],
              "difficulty": "Medium"
            }},
            {{
              "type": "Behavioral",
              "question": "STAR behavioral challenge question...",
              "expectedTopics": ["leadership", "conflict resolution"],
              "difficulty": "Medium"
            }},
            {{
              "type": "Project-based",
              "question": "Deep-dive architecture/optimization question about a specific project from their CV...",
              "expectedTopics": ["RAG pipeline architecture", "chunking"],
              "difficulty": "Hard"
            }},
            {{
              "type": "Scenario-based",
              "question": "Complex architectural scenario or high-concurrency design problem...",
              "expectedTopics": ["Redis cache stampede", "distributed sharding"],
              "difficulty": "Hard"
            }}
          ]
        }}
        """

        result = GeminiClient.generate_json(prompt, system_instruction)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def check_is_answer_invalid(answer: str) -> tuple[bool, list[str]]:
    raw_answer = answer.strip()
    if (raw_answer.startswith('"') and raw_answer.endswith('"')) or (raw_answer.startswith("'") and raw_answer.endswith("'")):
        raw_answer = raw_answer[1:-1].strip()

    cleaned = raw_answer.lower()
    words = [w for w in cleaned.split() if w.strip()]

    # 1. Extremely short / empty check
    if len(words) < 3 or len(cleaned) < 8:
        return True, ["Answer is too short or incomplete to evaluate.", "Technical explanation is completely missing."]

    # 2. Known keyboard typing patterns or placeholders
    gibberish_terms = {"qwerty", "asdfgh", "zxcvbn", "asdf", "qwer", "123456", "test", "hello", "hi", "nothing", "skip", "i don't know", "i dont know", "none"}
    if cleaned in gibberish_terms:
        return True, ["Answer contains invalid placeholder content or keyboard patterns.", "No technical reasoning was attempted."]

    # Vowel presence check on longer strings (detect "sdkfshdkf")
    for w in words:
        if len(w) >= 6 and not any(v in w for v in "aeiouy"):
            return True, ["Word segments lack standard vowel distribution and appear to be random typing."]

    # 3. Buzzword stuffing: keywords listing without explanation structure
    keywords = {"react", "node", "javascript", "js", "api", "database", "server", "express", "mongodb", "sql", "nosql", "postgres", "aws", "docker", "redis", "kafka"}
    matched_keywords = [w for w in words if w in keywords]
    if len(words) <= 6 and len(matched_keywords) >= 2:
        connectors = {"is", "are", "used", "to", "for", "the", "handle", "manage", "because", "which", "how", "why", "in", "with", "a", "an", "of"}
        if not any(w in connectors for w in words):
            return True, ["Answer consists of listed buzzwords without logical or syntactic connections."]

    # 4. Repeated word patterns (e.g., "react react react")
    if len(words) >= 4:
        unique_words = set(words)
        if len(unique_words) / len(words) < 0.4:
            return True, ["Answer contains repeated words suggesting random keyboard inputs or filler."]

    # 5. Meaningless placeholder phrases
    filler_phrases = ["maybe server", "i don't know but maybe", "i dont know but maybe", "something like that"]
    for filler in filler_phrases:
        if filler == cleaned or (filler in cleaned and len(words) <= 6):
            return True, ["Answer contains generic placeholders indicating lack of confidence or knowledge."]

    return False, []

@router.post("/evaluate")
async def evaluate_answer(payload: InterviewEvaluatePayload):
    raw_answer = payload.answer.strip()
    if (raw_answer.startswith('"') and raw_answer.endswith('"')) or (raw_answer.startswith("'") and raw_answer.endswith("'")):
        raw_answer = raw_answer[1:-1].strip()

    is_invalid, invalid_reasons = check_is_answer_invalid(raw_answer)

    if is_invalid:
        return {
            "technicalAccuracy": 5,
            "conceptualUnderstanding": 5,
            "communicationClarity": 5,
            "practicalKnowledge": 5,
            "answerRelevance": 5,
            "detectedIssues": invalid_reasons,
            "isAnswerValid": False,
            "needsFollowUp": True,
            "followUpQuestion": "Could you please explain the concept in detail, outlining the design patterns or execution flow?",
            "improvementSuggestion": "Provide a complete technical explanation containing at least 2-3 structured sentences, using accurate terminology.",
            "finalEvaluation": "The candidate provided an invalid, empty, or placeholder response. No technical competence could be verified."
        }

    # Strict local offline evaluator if Gemini API is missing
    if not GeminiClient.is_configured():
        words = [w for w in raw_answer.lower().split() if w.strip()]
        word_count = len(words)
        
        # Analyze keyword density
        technical_terms = ["react", "node", "express", "mongodb", "postgres", "redis", "scale", "performance", "async", "promise", "api", "database", "index", "cache", "latency", "docker", "aws", "star"]
        matched_terms = [t for t in technical_terms if t in raw_answer.lower()]
        
        # Determine strict scoring bands
        if word_count < 15:
            # Very weak answer (15-40 score)
            tech_acc = random.randint(15, 30)
            concept_und = random.randint(15, 28)
            comm_clr = random.randint(18, 32)
            prac_know = random.randint(15, 25)
            ans_rel = random.randint(15, 30)
            issues = ["Answer is extremely brief and lacks technical depth.", "No real-world metrics, trade-offs, or architectures provided."]
            followup = "Could you explain the core underlying mechanism and how you would structure it?"
            suggestion = "Elaborate with concrete technical examples and outline exact lifecycle or structural parameters."
            evaluation = "The answer is extremely brief and vague, showcasing near-zero technical depth or practical concept validation. No trade-offs or implementations were mentioned."
        elif word_count < 35:
            # Partially correct (40-65 score)
            tech_acc = random.randint(40, 52) + len(matched_terms)
            concept_und = random.randint(40, 55)
            comm_clr = random.randint(42, 58)
            prac_know = random.randint(40, 52)
            ans_rel = random.randint(45, 58)
            issues = ["Lacks architectural awareness or trade-off analysis.", "Missing practical production optimization considerations."]
            followup = "Could you provide a concrete example of this pattern and discuss the scaling trade-offs?"
            suggestion = "Incorporate trade-offs, scalability constraints, and specific tooling details rather than high-level general statements."
            evaluation = "The candidate shows standard conceptual familiarity but fails to explain low-level execution mechanisms, metrics, or engineering trade-offs."
        elif word_count < 75:
            # Good technical answer (65-82 score)
            tech_acc = random.randint(65, 75) + min(6, len(matched_terms))
            concept_und = random.randint(66, 78)
            comm_clr = random.randint(68, 80)
            prac_know = random.randint(65, 76)
            ans_rel = random.randint(68, 80)
            issues = ["Optimization parameters and failure modes could be expanded further.", "Lacks specific real-world metrics."]
            followup = "What metrics would you monitor under high concurrent load, and how would you optimize database indices or caching layers for this scenario?"
            suggestion = "Incorporate performance profiling, caching, and specific error-handling strategies."
            evaluation = "A good technical answer showing solid conceptual grasp and vocabulary. Needs more depth on debugging, edge cases, and real-world metrics."
        else:
            # Strong production-level answer (82-92 score)
            tech_acc = random.randint(82, 88) + min(4, len(matched_terms))
            concept_und = random.randint(82, 90)
            comm_clr = random.randint(82, 90)
            prac_know = random.randint(82, 88)
            ans_rel = random.randint(82, 90)
            issues = ["Minor edge-case coverage details could be tightened."]
            followup = "How would you design a CI/CD pipeline and write test coverage to assert this architectural design?"
            suggestion = "Deepen discussion of automated deployment strategies and persistence recovery configurations."
            evaluation = "A robust, technically competent answer highlighting clear architectural understanding, scaling strategies, and proper vocabulary."

        return {
            "technicalAccuracy": tech_acc,
            "conceptualUnderstanding": concept_und,
            "communicationClarity": comm_clr,
            "practicalKnowledge": prac_know,
            "answerRelevance": ans_rel,
            "detectedIssues": issues,
            "isAnswerValid": True,
            "needsFollowUp": True if tech_acc < 82 else False,
            "followUpQuestion": followup,
            "improvementSuggestion": suggestion,
            "finalEvaluation": evaluation
        }

    # Enterprise-Grade AI Strict Evaluator via Groq/Llama
    try:
        system_instruction = (
            "You are an enterprise-grade AI Technical Interview Evaluator, acting as a strict principal FAANG engineer and senior hiring manager.\n"
            "Your objective is to evaluate candidate answers strictly, realistically, and critically. DO NOT be positive or nice if the answer is lacking.\n"
            "Absolutely avoid fake positivity preambles like 'Good attempt!', 'Nice try!', or any encouraging remarks.\n"
            "Evaluate based on:\n"
            "- Technical Correctness: factually correct concepts, precise terminology, logical reasoning.\n"
            "- Depth Analysis: explanation depth, architectural awareness, optimization, code examples, edge cases, scalability.\n"
            "- Anti-Fluff & Low-Quality Penalization: heavily penalize generic statements, keyword stuffing without connection, long but meaningless answers, and copied templates.\n"
            "- Confidence Evaluation: structured explanations, certainty, coherence, and consistency.\n\n"
            "SCORING SCALE RULES (DO NOT give perfect scores, and keep scores strictly aligned to these bounds):\n"
            "- Random typing/gibberish/invalid text: 0-15 (set isAnswerValid to false)\n"
            "- Very weak answer: 15-40 (high-level, brief, e.g. 'useEffect is for API' -> score 20-30)\n"
            "- Partially correct: 40-65 (conceptual familiarity but no low-level details, trade-offs, or examples)\n"
            "- Good technical answer: 65-82 (correct details, standard terminology, but lacks depth in metrics, optimization, or edge cases)\n"
            "- Strong production-level answer: 82-92 (very detailed, names specific tools, trade-offs, architecture, and debugging methods)\n"
            "- Exceptional industry-level answer: 92-96 (extremely rare, comprehensive, demonstrates deep real-world experience. Never score 97-100)\n\n"
            "FOLLOW-UP ENGINE:\n"
            "- If answer is weak (< 40): Ask simpler probing questions.\n"
            "- If answer is vague or lacks depth (40-65): Ask for concrete examples or trade-offs.\n"
            "- If answer is good but could be optimized (65-82): Ask optimization, latency, or scalability questions.\n\n"
            "Conform strictly to JSON schema outputs, with absolutely zero trailing text."
        )

        prompt = f"""
        Strictly evaluate the candidate's answer based on the following criteria:
        
        Question: "{payload.question}"
        Candidate Answer: "{payload.answer}"
        Role Category: "{payload.role}"
        Difficulty Level: "{payload.difficulty}"

        You MUST respond only in a valid JSON object matching the following structure:
        {{
          "technicalAccuracy": 0, // strict score based on factual correctness
          "conceptualUnderstanding": 0, // strict score based on depth and correctness of core concepts
          "communicationClarity": 0, // strict score based on structured delivery, coherence, and certainty
          "practicalKnowledge": 0, // strict score based on practical production knowledge, tooling, trade-offs, and examples
          "answerRelevance": 0, // strict score based on how directly the response addresses the prompt
          "detectedIssues": [
            "Specific technical issue 1 (e.g. 'Answer was vague', 'No trade-offs discussed', 'Confuses hooks with props')"
          ],
          "isAnswerValid": true, // false if gibberish, empty, completely off-topic, or keyword stuffing
          "needsFollowUp": true, // true if answer lacks depth or has technical inaccuracies
          "followUpQuestion": "A targeted, strict follow-up question based on follow-up engine criteria",
          "improvementSuggestion": "An actionable, constructive suggestion on exactly what was missing and how to improve technical depth",
          "finalEvaluation": "A highly professional, objective technical evaluation explaining why the score was given, focusing strictly on limitations and technical facts without any fake positivity."
        }}
        """

        result = GeminiClient.generate_json(prompt, system_instruction)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
