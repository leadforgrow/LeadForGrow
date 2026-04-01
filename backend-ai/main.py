import os
import json
import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------
# ENTERPRISE LOGGING SETUP & APP INIT
# ---------------------------------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] [AI-ENGINE] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Use Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. API calls will fail.")

# Use the latest Flash model which is very fast and completely free to start
flash_model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI(title="LFG Revenue Intelligence AI Core", version="10.0.0-Enterprise (Gemini)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def health_check():
    return {"status": "Enterprise AI Core Active (Gemini)", "version": "10.0.0-Enterprise", "timestamp": datetime.now().isoformat()}

def extract_business_context(data: dict) -> dict:
    deal_value = float(data.get('totalPipelineValue', 0) or data.get('avgDealValue', 0) or 15000)
    revenue_at_risk = float(data.get('revenueAtRisk', 0) or 0)
    sla = float(data.get('slaCompliance', 75) or 75)
    leads = int(data.get('totalLeads', 0) or max(1, deal_value / 15000))
    business_name = str(data.get('businessName', 'Your Startup'))
    top_source = str(data.get('topSource', 'Inbound Velocity'))
    avg_deal = float(data.get('avgDeal', deal_value / max(leads, 1)))
    won_revenue = float(data.get('recoveredRevenue', 0) or 0)
    
    return {
        "deal_value": deal_value, "revenue_at_risk": revenue_at_risk, "sla": sla, "leads": leads,
        "business_name": business_name, "top_source": top_source, "avg_deal": avg_deal, "won_revenue": won_revenue,
        "full_context_json": json.dumps(data)
    }

MASTER_SYSTEM_PROMPT = """You are an elite, highly-paid Chief Revenue Officer (CRO) and AI Data Scientist for a $1 Billion SaaS decacorn. 
1. No generic fluff. Be hyper-specific.
2. Quantify everything. Speak in hard numbers, percentages, and ROI multipliers.
3. Tone: Confident, authoritative, visionary, and exact."""

# =========================================================
# AUTO-RETRY SYSTEM FOR "TOO MANY REQUESTS" (429)
# =========================================================
async def generate_with_retry(prompt: str, schema=None, max_retries=5):
    """Generates content via Gemini with exponential backoff for 429 API Rate Limit errors."""
    full_prompt = f"{MASTER_SYSTEM_PROMPT}\n\n{prompt}"
    
    for attempt in range(max_retries):
        try:
            if schema:
                # Use strict structured outputs for Models
                response = await flash_model.generate_content_async(
                    full_prompt,
                    generation_config=genai.GenerationConfig(
                        response_mime_type="application/json",
                        response_schema=schema
                    )
                )
                return json.loads(response.text)
            else:
                # Use standard string generation for chat / markdown
                response = await flash_model.generate_content_async(full_prompt)
                return response.text
                
        except Exception as e:
            error_msg = str(e)
            # Catch 429 Quota or Rate Limits
            if "429" in error_msg or "Too Many Requests" in error_msg or "ResourceExhausted" in error_msg or "quota" in error_msg.lower():
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) * 2  # Waits 2s, 4s, 8s, 16s across attempts
                    logger.warning(f"Rate limit hit. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    logger.error("Max retries reached for API due to persistent Rate Limits.")
                    raise HTTPException(status_code=429, detail="AI Service is currently experiencing exceptionally high load. Please try again.")
            else:
                logger.error(f"AI API Error: {error_msg}")
                raise HTTPException(status_code=500, detail=f"AI Engine Error: {error_msg}")


# =========================================================
# A. REVENUE LEAK AUDITOR
# =========================================================
class AuditResponse(BaseModel):
    leakValue: int
    mainLeakReason: str
    recommendation: str
    detailedAudit: str

@app.post("/ai/revenue-leak-audit")
async def audit_revenue_leaks(request: Request):
    ctx = extract_business_context(await request.json())
    prompt = f"[FORENSIC AUDIT] Pipeline: ₹{ctx['deal_value']:,.0f} | Risk: ₹{ctx['revenue_at_risk']:,.0f} | SLA: {ctx['sla']:.0f}%"
    try:
        data = await generate_with_retry(prompt, schema=AuditResponse)
        return {"success": True, **data}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# B. GROWTH STRATEGIST 
# =========================================================
class StrategyStep(BaseModel):
    title: str
    description: str

class StrategyResponse(BaseModel):
    strategySteps: list[StrategyStep]
    projectedGrowth: str

@app.post("/ai/growth-strategy")
async def generate_strategy(request: Request):
    ctx = extract_business_context(await request.json())
    prompt = f"[GROWTH] Leads: {ctx['leads']} | Pipeline: ₹{ctx['deal_value']:,.0f} | SLA: {ctx['sla']:.0f}%"
    try:
        data = await generate_with_retry(prompt, schema=StrategyResponse)
        return {"success": True, **data}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# C. PREDICTIVE FORECASTER
# =========================================================
class ForecastMonth(BaseModel):
    month: str
    value: int

class ForecastResponse(BaseModel):
    forecast: list[ForecastMonth]
    summary: str
    confidenceScore: float

@app.post("/ai/predictive-forecast")
async def get_forecast(request: Request):
    ctx = extract_business_context(await request.json())
    prompt = f"[FORECAST] Pipeline: ₹{ctx['deal_value']:,.0f} | Won: ₹{ctx['won_revenue']:,.0f}"
    try:
        data = await generate_with_retry(prompt, schema=ForecastResponse)
        return {"success": True, **data}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# D. AI COPILOT
# =========================================================
@app.post("/ai/copilot")
async def ai_copilot(request: Request):
    data = await request.json()
    metrics = data.get("metrics", {})
    ctx = extract_business_context(metrics)
    question = data.get("question", "")
    try:
        answer = await generate_with_retry(question)
        return {"success": True, "answer": answer}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# E. FULL BOARD REPORT
# =========================================================
@app.post("/ai/full-report")
async def full_report(request: Request):
    ctx = extract_business_context(await request.json())
    try:
        prompt = "Generate a beautiful Markdown executive summary from this data: " + ctx['full_context_json']
        report = await generate_with_retry(prompt)
        return {"success": True, "report": report}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# F. MARKET SENTIMENT PULSE
# =========================================================
class SentimentDistribution(BaseModel):
    highIntent: str
    priceComparing: str
    researching: str
    cold: str

class SentimentResponse(BaseModel):
    overallVibe: str
    distribution: SentimentDistribution
    advice: str

@app.post("/ai/sentiment-pulse")
async def get_sentiment_pulse(request: Request):
    ctx = extract_business_context(await request.json())
    logger.info("Running Market Sentiment Engine.")
    
    prompt = f"Analyze market sentiment for a business with ₹{ctx['deal_value']} pipeline from {ctx['top_source']}. Return structure with: overallVibe, distribution, and advice."
    
    try:
        data = await generate_with_retry(prompt, schema=SentimentResponse)
        
        # Format names purely for exactly what the frontend anticipates
        return {
            "success": True,
            "overallVibe": data['overallVibe'],
            "distribution": {
                "High Intent": data['distribution']['highIntent'],
                "Price Comparing": data['distribution']['priceComparing'],
                "Researching": data['distribution']['researching'],
                "Cold": data['distribution']['cold']
            },
            "advice": data['advice']
        }
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5055, log_level="info")
