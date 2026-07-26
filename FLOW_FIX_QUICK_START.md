# WhatsApp Flow — Quick Fix Guide

## **What I've Done**

✅ **Identified root causes:**
- Your flow has 20+ duplicate edges, empty if/else conditions, no false branches, no end node
- Engine is working but missing cron jobs for delays and timeouts

✅ **Created fixed version:**
- `garage-flow-fixed.json` — Clean, working flow structure

✅ **Added missing infrastructure:**
- `/api/cron/resume-flow-delays` — Resume delayed flows every 5 min
- `/api/cron/expire-flow-waits` — Mark expired waits as failed
- `/api/automation/whatsapp-flows/[id]/executions` — Debug endpoint to view flow logs
- Enhanced `resumeFlowWaitForReply()` with timeout handling

✅ **Improved engine.js:**
- Now skips expired waits
- Automatically marks timed-out flows as failed
- Better error tracking

---

## **Your To-Do List**

### **1. Delete your broken flow (2 min)**
```
Go to UI → WhatsApp Flows → "Garage Booking Flow" → Delete
```

### **2. Import the fixed flow (5 min)**

Option A: Copy the fixed JSON
```
UI → WhatsApp Flows → Create New → Change trigger → Copy from garage-flow-fixed.json
```

Option B: Use import endpoint
```bash
curl -X POST http://localhost:3000/api/automation/whatsapp-flows/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @garage-flow-fixed.json
```

### **3. Publish the flow (1 min)**
```
UI → Garage Booking Flow → Publish
```

### **4. Set up cron jobs (5 min)**

You need to call these endpoints every 5 minutes from an external cron service (Vercel Cron, GitHub Actions, AWS EventBridge, etc.):

```bash
# Every 5 minutes:
curl -X POST https://your-app.vercel.app/api/cron/resume-flow-delays \
  -H "Authorization: Bearer $CRON_SECRET"

curl -X POST https://your-app.vercel.app/api/cron/expire-flow-waits \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Using Vercel Cron (easiest):**

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/resume-flow-delays",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/expire-flow-waits",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Using GitHub Actions:**
```yaml
name: Flow Maintenance
on:
  schedule:
    - cron: '*/5 * * * *'
jobs:
  resume:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://your-app.vercel.app/api/cron/resume-flow-delays \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
          curl -X POST https://your-app.vercel.app/api/cron/expire-flow-waits \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### **5. Test the flow (5 min)**

```
1. Send WhatsApp message to your garage number
   → Flow should start, send welcome template ✅

2. Reply with ANY message
   → Flow continues to service list ✅

3. Select a service (reply with "Oil Change", etc.)
   → Continues to brand selection ✅

4. Select a brand
   → Continues to model selection ✅

5. Select a model
   → Continues to fuel type buttons ✅

6. Tap a fuel type button
   → Continues to pickup question ✅

7. Tap yes/no for pickup
   → Either asks for address OR skips to time ✅

8. If address was asked, reply with location
   → Continues to time selection ✅

9. Tap a time slot
   → Flow ends with confirmation message ✅
```

### **6. Debug if stuck (5 min)**

Check execution logs:
```bash
curl http://localhost:3000/api/automation/whatsapp-flows/[FLOW_ID]/executions?status=active
```

Response shows:
```json
{
  "data": [
    {
      "status": "waiting",
      "currentNodeKey": "wait_reply_123",
      "variables": { "vehicle_type": "Four Wheeler", ... },
      "logs": [
        { "nodeKey": "trigger", "status": "entered" },
        { "nodeKey": "action_welcome", "status": "completed" }
      ]
    }
  ]
}
```

**Common issues:**
- `status: "failed"` → Check `error` field in logs
- `status: "active"` but stuck → Missing cron jobs
- `status: "waiting"` forever → Check if user replied (button/text received?)
- No executions → Flow not triggering on incoming message

---

## **File Changes Summary**

| File | Change | Why |
|------|--------|-----|
| `garage-flow-fixed.json` | **NEW** | Clean working flow |
| `lib/whatsappFlows/engine.js` | Enhanced | Timeout handling + expire old waits |
| `/api/cron/resume-flow-delays` | **NEW** | Resume delayed flows |
| `/api/cron/expire-flow-waits` | **NEW** | Fail expired waits |
| `/api/.../whatsapp-flows/[id]/executions` | **NEW** | Debug endpoint |

---

## **Testing Checklist**

- [ ] Deleted old broken flow
- [ ] Imported garage-flow-fixed.json
- [ ] Published new flow
- [ ] Set up cron jobs (Vercel / GitHub Actions / other)
- [ ] Sent test message → Flow started
- [ ] Replied to prompt → Flow continued
- [ ] Checked `/executions` endpoint → Shows logs
- [ ] Waited for 5 min → Delayed waits resumed ✅
- [ ] Waited 24+ hours on reply → Flow marked failed on timeout ✅

---

## **Next Steps**

1. **Import the fixed flow first** (do this now)
2. **Test with one message** (should work immediately)
3. **Set up cron jobs** (required for delays/timeouts to work)
4. **Monitor via /executions endpoint** (for debugging)

---

## **Questions?**

Check `/api/automation/whatsapp-flows/[flowId]/executions` to see:
- Why flow is stuck
- What variables were captured
- Which node failed and why
- Full execution log with timestamps

Good luck! 🚀
