# 🧠 LFG-V2: $1B Enterprise AI Intelligence System

This document outlines the architecture, flow, and capabilities of the multi-agent AI engine powering the **Revenue Intelligence Dashboard**.

## 🏗️ 1. Architecture Overview (The "Brain" and "Face" Model)

To achieve enterprise-grade scale and separation of concerns, the AI system is split into two distinct tiers:

### **The "Face" (Next.js / React)**
- **Role:** Handles UI, charts, and user experience.
- **Location:** `app/automation/page.js` and `app/api/ai/*`
- **Behavior:** The frontend does **not** talk to OpenAI directly. It sends highly specific payload telemetrics (Total Pipeline $, Risk $, SLA Compliance %, Lead Count) via internal proxy routes to the Python backend to ensure secure, rapid data transfer.

### **The "Brain" (FastAPI / Python)
- **Role:** Data processing, AI System Prompting, LLM Structured Output parsing, and algorithmic fallbacks.
- **Location:** `backend-ai/main.py`
- **Behavior:** Acts as a centralized AI router. It dynamically binds the frontend telemetry into hyper-specific persona prompts before passing them to the OpenAI engine.

---

## 🤖 2. The Multi-Agent System (OpenAI)

The backend utilizes **OpenAI (`gpt-4o` & `gpt-4o-mini`)** loaded with specialized "Agent Personas". Instead of interacting cleanly with one generic chatbot, the system spins up parallel specialized intelligence routines:

### A. The Forensic Pipeline Auditor (`/ai/revenue-leak-audit`)
- **Persona:** Elite Forensic Pipeline Director.
- **Function:** Cross-references `SLA%` against `Revenue at Risk` to explicitly identify where capital is leaking from the funnel.
- **Capability:** Recommends precise operational maneuvers (e.g., "Deploy auto-responders within 3 minutes on WhatsApp").

### B. The Growth Strategist (`/ai/growth-strategy`)
- **Persona:** VP of Sales & Growth Architect.
- **Function:** Generates a 3-step prioritized growth maneuver based specifically on the business's Top Volume Source (e.g., "Inbound Meta Ads").
- **Capability:** Guarantees structured JSON output (`strategySteps`) using OpenAI's new Structured Output API + Pydantic modeling.

### C. The Predictive Forecaster (`/ai/predictive-forecast`)
- **Persona:** Chief Data Scientist.
- **Function:** Ingests the current baseline won revenue and active pipeline to process a 6-month compounding algorithmic growth curve ("S-Curve").
- **Capability:** Highlights the mathematical drivers of future revenue inside a `Summary` brief.

### D. The AI Copilot (`/ai/copilot`)
- **Persona:** Dedicated AI Strategic Co-Founder.
- **Function:** Powers the real-time Dashboard Chat UI.
- **Capability:** Ingests the *entire* dashboard JSON context invisibly in the background. If a user asks "Who should I call today?", the LLM calculates the answer natively against the exact pipeline numbers on screen.

### E. The Board Report Generator (`/ai/full-report`)
- **Persona:** Private Equity Managing Director at a Tier-1 firm.
- **Function:** Parses the unstructured telemetry into an elegant, formatted Markdown board deck.
- **Capability:** Synthesizes the Executive Summary, Leak Analytics, and 6-Month plans dynamically.

### F. Sentiment Pulse (`/ai/sentiment-pulse`)
- **Function:** A rapid algorithmic pulse check on the buying intent of the overall market pipeline, recommending immediate follow-up adjustments based on volume metrics.

---

## 🛡️ 3. Enterprise Safety & Fallback Engineering

A $1B SaaS platform cannot break when third-party APIs experience downtime or quota limits.

### Graceful Degradation (Circuit Breaker)
If the OpenAI API returns a `429 Insufficient Quota`, `500 Server Error`, or `Timeout`, the Python core instantly triggers a **try/except safety net**.

Instead of crashing the frontend dashboard, the AI Engine switches to a **"Mathematical Fallback Engine"**:
1. It reads the raw metrics (e.g., `deal_value=30000`, `sla=65%`).
2. It mathematically projects a rigorous and highly-accurate dummy mock object that completely fits the target schema.
3. It replies with simulated text specifically addressing the user's variables (e.g., *"Your SLA compliance of 65% introduces latency friction... "*).
4. The React dashboard renders the fallback seamlessly, meaning **uptime is visually 100%** to the end user.

---

## 🚀 4. Technical Stack

- **LLM Engine:** OpenAI Python SDK v1.40+
- **Agent Models:** `gpt-4o-mini` (for structured JSON speed) & `gpt-4o` (for complex, nuanced reasoning).
- **Schema Validation:** Pydantic (v2) with Strict BaseModels (`response_format`).
- **Web Server:** Uvicorn with ASGI framework (FastAPI).
- **Frontend Bridge:** Next.js App Router (Server-side Proxy Fetch).
