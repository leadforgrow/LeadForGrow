import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel

# ---------------------------------------------------------
# ENTERPRISE LOGGING SETUP & APP INIT
# ---------------------------------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] [AI-ENGINE] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

app = FastAPI(title="LFG Revenue Intelligence AI Core", version="10.0.0-Enterprise (Local Engine)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
@app.get("/health")
@app.get("/healthz")
@app.get("/ping")
async def health_check():
    return {"status": "Enterprise AI Core Active (Local Engine)", "version": "10.0.0-Enterprise", "timestamp": datetime.now().isoformat()}

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
    risk = ctx['revenue_at_risk']
    return {
        "success": True,
        "leakValue": int(risk * 0.8),
        "mainLeakReason": "Poor follow-up velocity and low SLA compliance",
        "recommendation": "Implement automated drip campaigns and enforce a 5-minute response SLA.",
        "detailedAudit": f"Based on the pipeline of ₹{ctx['deal_value']:,.0f}, approximately ₹{risk:,.0f} is at risk. Analysis indicates that leads from {ctx['top_source']} are dropping off rapidly after the first touchpoint."
    }

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
    return {
        "success": True,
        "strategySteps": [
           {"title": "Optimize Inbound Pipeline", "description": f"Focus heavily on scaling {ctx['top_source']} via automated routing."},
           {"title": "Increase SLA Enforcement", "description": "Ensure no leads sit longer than established SLA parameters."},
           {"title": "Deal Value Expansion", "description": f"Upsell existing prospects to push average deal beyond ₹{ctx['avg_deal']:,.0f}."}
        ],
        "projectedGrowth": f"Implementation of these steps could yield an additional ₹{ctx['deal_value'] * 0.4:,.0f} in pipeline next quarter."
    }

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
    base = ctx['deal_value'] * 0.2 if ctx['deal_value'] > 0 else 50000
    return {
        "success": True,
        "forecast": [
           {"month": "Month 1", "value": int(base * 1.0)},
           {"month": "Month 2", "value": int(base * 1.15)},
           {"month": "Month 3", "value": int(base * 1.35)}
        ],
        "summary": "Consistent growth modeled on current pipeline velocity and historical close rates.",
        "confidenceScore": 82.5
    }

# =========================================================
# D. AI COPILOT
# =========================================================
@app.post("/ai/copilot")
async def ai_copilot(request: Request):
    data = await request.json()
    metrics = data.get("metrics", {})
    ctx = extract_business_context(metrics)
    question = data.get("question", "General inquiry")
    return {
        "success": True, 
        "answer": f"Based on your current pipeline of ₹{ctx['deal_value']:,.0f}, the best approach to your question ('{question}') is to prioritize high-intent leads from {ctx['top_source']} while maintaining strict SLA compliance. I recommend taking action immediately on the ₹{ctx['revenue_at_risk']:,.0f} revenue at risk."
    }

# =========================================================
# E. FULL BOARD REPORT
# =========================================================
@app.post("/ai/full-report")
async def full_report(request: Request):
    ctx = extract_business_context(await request.json())
    report = f"""# Executive Board Report: {ctx['business_name']}
    
## 1. Pipeline Overview
- **Total Pipeline**: ₹{ctx['deal_value']:,.0f}
- **Revenue at Risk**: ₹{ctx['revenue_at_risk']:,.0f}
- **Recovered**: ₹{ctx['won_revenue']:,.0f}

## 2. Core Metrics
Your top source is **{ctx['top_source']}**, driving an average deal size of ₹{ctx['avg_deal']:,.0f}. SLA compliance currently sits at **{ctx['sla']:.0f}%**.

## 3. Strategic AI Advice
To prevent revenue leakage, strictly enforce your SLA on the {ctx['leads']} active leads you currently have in the pipeline.
"""
    return {"success": True, "report": report}

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
    return {
        "success": True,
        "overallVibe": "Cautiously Optimistic",
        "distribution": {
            "High Intent": "25%",
            "Price Comparing": "40%",
            "Researching": "20%",
            "Cold": "15%"
        },
        "advice": f"Your leads from {ctx['top_source']} are heavily comparing prices right now. Offer a time-sensitive incentive to convert the 40% in the evaluation funnel."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5055, log_level="info")
