# LFG Revenue Intelligence AI System (V2.0)

This system transforms raw lead data into actionable revenue insights using a hybrid Next.js and Python (FastAPI) architecture.

## 🏗 Architecture
- **Frontend**: Next.js (React) - Premium Glassmorphism Dashboard.
- **Backend AI**: Python (FastAPI) - Handles heavy computations, LLM integration, and pattern auditing.
- **Bridge**: Next.js API Routes (Proxy) to secure Python endpoints.

## 🚀 Key Features

### 1. Revenue Leak Auditor
Located in the dashboard. It scans for:
- **Speed Leaks**: Leads that missed the 10-minute SLA.
- **Time Leaks**: Higher drop-off rates during specific hours/weekends.
- **Source Leaks**: Underperforming ad channels relative to their cost.

### 2. Executive Growth Strategist
Generates a real-time 3-step action plan using Generative AI.
- Analyzes `totalPipelineValue` and `sourceMetrics`.
- Provides targeted recommendations (e.g., budget shifts, follow-up frequency).

## 🛠 Setup & Installation

### Python Backend
1. Navigate to `backend-ai/`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Run the server: `python main.py`. (Runs on port 8000).

### Frontend
1. Ensure the Python backend is running.
2. The dashboard at `/automation` will automatically connect via the internal bridge.

## 🧠 AI Configuration
To enable live Gemini/GPT logic:
- Update `backend-ai/main.py` with your `GENAI_API_KEY`.
- The system currently provides high-fidelity simulated models that are calibrated for the LFG Revenue model.
