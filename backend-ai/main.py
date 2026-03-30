import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
import openai
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------
# ENTERPRISE LOGGING SETUP & APP INIT
# ---------------------------------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] [AI-ENGINE] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Use environment variable for security
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="LFG Revenue Intelligence AI Core", version="10.0.0-Enterprise")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def health_check():
    return {"status": "Enterprise AI Core Active", "version": "10.0.0-Enterprise", "timestamp": datetime.now().isoformat()}

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

async def handle_openai_error(e: Exception):
    error_msg = str(e)
    logger.error(f"OpenAI API Error: {error_msg}")
    
    # If it's a quota error, raise it clearly as requested by user ("dont give me mock i need correct")
    if "insufficient_quota" in error_msg or "429" in error_msg:
        raise HTTPException(
            status_code=429, 
            detail="OpenAI API Quota Exceeded. Please check your billing/plan to get 'correct' real-time insights."
        )
    
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
        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": MASTER_SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            response_format=AuditResponse
        )
        return {"success": True, **response.choices[0].message.parsed.model_dump()}
    except Exception as e:
        await handle_openai_error(e)


# =========================================================
# B. GROWTH STRATEGIST 
# =========================================================
class StrategyStep(BaseModel):
    title: str
    description: str

class StrategyResponse(BaseModel):
    strategySteps: List[StrategyStep]
    projectedGrowth: str

@app.post("/ai/growth-strategy")
async def generate_strategy(request: Request):
    ctx = extract_business_context(await request.json())
    prompt = f"[GROWTH] Leads: {ctx['leads']} | Pipeline: ₹{ctx['deal_value']:,.0f} | SLA: {ctx['sla']:.0f}%"
    try:
        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": MASTER_SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            response_format=StrategyResponse
        )
        return {"success": True, **response.choices[0].message.parsed.model_dump()}
    except Exception as e:
        await handle_openai_error(e)


# =========================================================
# C. PREDICTIVE FORECASTER
# =========================================================
class ForecastMonth(BaseModel):
    month: str
    value: int

class ForecastResponse(BaseModel):
    forecast: List[ForecastMonth]
    summary: str
    confidenceScore: float

@app.post("/ai/predictive-forecast")
async def get_forecast(request: Request):
    ctx = extract_business_context(await request.json())
    prompt = f"[FORECAST] Pipeline: ₹{ctx['deal_value']:,.0f} | Won: ₹{ctx['won_revenue']:,.0f}"
    try:
        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": MASTER_SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            response_format=ForecastResponse
        )
        return {"success": True, **response.choices[0].message.parsed.model_dump()}
    except Exception as e:
        await handle_openai_error(e)


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
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": MASTER_SYSTEM_PROMPT}, {"role": "user", "content": question}]
        )
        return {"success": True, "answer": response.choices[0].message.content}
    except Exception as e:
        await handle_openai_error(e)


# =========================================================
# E. FULL BOARD REPORT
# =========================================================
@app.post("/ai/full-report")
async def full_report(request: Request):
    ctx = extract_business_context(await request.json())
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": MASTER_SYSTEM_PROMPT}, {"role": "user", "content": "Generate a beautiful Markdown executive summary from this data: " + ctx['full_context_json']}]
        )
        return {"success": True, "report": response.choices[0].message.content}
    except Exception as e:
        await handle_openai_error(e)


# =========================================================
# F. MARKET SENTIMENT PULSE
# =========================================================
@app.post("/ai/sentiment-pulse")
async def get_sentiment_pulse(request: Request):
    ctx = extract_business_context(await request.json())
    logger.info("Running Market Sentiment Engine.")
    
    # Sentiment usually requires high-level synthesis
    prompt = f"Analyze market sentiment for a business with ₹{ctx['deal_value']} pipeline from {ctx['top_source']}. Return JSON with: overallVibe, distribution (object with High Intent, Price Comparing, Researching, Cold as percentages), and advice."
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are a market analyst. Output raw JSON."}, {"role": "user", "content": prompt}]
        )
        # Parse the JSON string from response
        res_text = response.choices[0].message.content
        # Ensure we only have the JSON part
        if "```json" in res_text:
            res_text = res_text.split("```json")[1].split("```")[0].strip()
        
        return {"success": True, **json.loads(res_text)}
    except Exception as e:
        await handle_openai_error(e)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5055, log_level="info")
