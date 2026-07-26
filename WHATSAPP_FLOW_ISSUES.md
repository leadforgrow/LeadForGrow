# WhatsApp Flow Debugging Guide

## **Why Your Garage Flow Isn't Working**

### **Issue #1: Flow Structure Problems (Critical)**

Your exported flow JSON has **fatal issues**:

1. **Duplicate Edges** (20+ duplicates)
   - Same source→target edges repeated multiple times
   - Causes confusion in edge lookup: `nextNodes(edges, sourceKey)` might return wrong target
   - Solution: Clean up duplicates (see fixed version: `garage-flow-fixed.json`)

2. **Empty If/Else Conditions**
   - `logic_if_else_1785019054159` has `value: ""` (empty string)
   - `evaluateCondition(variables, { operator: 'contains', value: '' })` always fails
   - Solution: Set actual condition values

3. **No False Branches**
   - Every if/else only has `true` sourceHandle edges
   - When condition is false, `nextNodes(edges, nodeId, 'false')` returns `[]`
   - Flow halts at if/else when condition is false
   - Solution: Add `false` branch edges to every if/else

4. **Flow Doesn't End**
   - Last node (Send Text thank you) has no `action_end` node
   - Execution loops indefinitely waiting for next node
   - Solution: Add `action_end` node with `markConverted: true`

---

### **Issue #2: Engine Behavior (Works, but has gaps)**

**What IS working:**
- ✅ Flow starts on incoming message (`matchAndStartFlows` called line 222 of leadManager.js)
- ✅ Wait for reply pauses execution (line 243-253 of engine.js)
- ✅ Resume triggered on next message (line 215 of leadManager.js)
- ✅ Button/list IDs captured (line 219 of leadManager.js)

**What might NOT work:**
- ❌ Scheduled delays NOT resumed (no cron job calling `resumeDueFlowDelays`)
- ❌ Flow logs NOT visible in UI (execution logs stored but no endpoint to fetch)
- ❌ No timeout handling (waits forever if user doesn't reply)
- ❌ No error notifications (failed flows silent)

---

### **Issue #3: Missing Wiring (Critical Fix)**

The engine is built but **resume of delayed flows is not scheduled**:

```javascript
// lib/whatsappFlows/engine.js - Line 171
export async function resumeDueFlowDelays(limit = 50) {
  const due = await FlowExecution.find({
    status: 'waiting',
    'wait.type': 'delay',
    'wait.until': { $lte: new Date() },
  }).limit(limit);
  // ... resume logic
}
```

**This is NEVER CALLED.** There's no cron job or worker task calling it!

---

## **How to Fix It**

### **Step 1: Clean up your flow (IMMEDIATE)**

Use the fixed version I created: **`garage-flow-fixed.json`**

Changes:
- ✅ All duplicate edges removed
- ✅ All if/else conditions have real values
- ✅ All if/else have both `true` AND `false` branches
- ✅ Flow ends with `action_end` node
- ✅ Linear, clear structure

**Import it:**
```bash
# Export current broken flow first as backup
# Then delete the flow in UI
# Then POST to /api/automation/whatsapp-flows/import with garage-flow-fixed.json
```

---

### **Step 2: Wire up delayed resume (CRITICAL)**

Create a cron job to resume waiting flows:

**File: `app/api/cron/resume-flow-delays/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { resumeDueFlowDelays } from '@/lib/whatsappFlows/engine';

export const POST = async (request) => {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const resumed = await resumeDueFlowDelays(100);
    return NextResponse.json({ success: true, resumed });
  } catch (error) {
    console.error('[Cron] Resume flow delays error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
```

Then call this every 5 minutes from external cron service:
```bash
curl -X POST https://your-app.com/api/cron/resume-flow-delays \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

### **Step 3: Add flow execution logs endpoint (DEBUGGING)**

**File: `app/api/automation/whatsapp-flows/[id]/executions/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import FlowExecution from '@/models/automation/FlowExecution';

export const GET = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const businessId = req.user.businessId;
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    const execs = await FlowExecution.find({ flowId: id, businessId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await FlowExecution.countDocuments({ flowId: id, businessId });

    return NextResponse.json({
      success: true,
      data: execs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
```

This lets you see execution logs, failures, and stuck executions.

---

### **Step 4: Add timeout handler (RECOMMENDED)**

Flows waiting forever should timeout:

**Modify `lib/whatsappFlows/engine.js` line 121-127:**

```javascript
export async function resumeFlowWaitForReply({ businessId, leadId, text, buttonId, listId }) {
  const reply = text || buttonId || listId || '';
  const waiting = await FlowExecution.find({
    businessId,
    leadId,
    status: 'waiting',
    'wait.type': 'reply',
    // NEW: Filter out timed-out waits
    'wait.until': { $gte: new Date() }, // Only non-expired waits
  }).limit(5);

  // ... rest of logic
}
```

Add a separate cron to **expire old waits**:

```javascript
// app/api/cron/expire-flow-waits/route.js
await FlowExecution.updateMany(
  {
    status: 'waiting',
    'wait.until': { $lt: new Date() },
  },
  {
    $set: {
      status: 'failed',
      error: 'Timeout waiting for reply',
      completedAt: new Date(),
    },
  }
);
```

---

## **Testing Checklist**

- [ ] Import `garage-flow-fixed.json` into your flow
- [ ] Publish the flow
- [ ] Send WhatsApp message to garage number → flow starts, sends welcome template
- [ ] Reply with anything → flow continues to service selection list
- [ ] Select service → continues to brand selection
- [ ] Select brand → continues to model selection
- [ ] ... (flow continues through all steps)
- [ ] Reply with time → flow ends, sends confirmation + marks converted

**If still broken:**
1. Check `/api/automation/whatsapp-flows/[id]/executions` for logs
2. Look at `FlowExecution` in MongoDB for `status: 'failed'` with error message
3. Check if buttons/lists were parsed correctly (look for `buttonId`/`listId` in logs)

---

## **Key Files to Check**

| File | Purpose | Issue? |
|------|---------|--------|
| `lib/whatsappFlows/engine.js` | Flow execution logic | ✅ Good, but missing timeout logic |
| `lib/leadManager.js` (line 215) | Resumes waiting flows | ✅ Called on incoming message |
| `lib/whatsapp/parser.js` | Parses button/list replies | ⚠️ Check if listId/buttonId extracted |
| `app/api/automation/whatsapp-flows/[id]/route.js` | Flow CRUD | ✅ Good |
| `app/api/automation/whatsapp-flows/[id]/publish/route.js` | Publish | ✅ Good |
| **MISSING** | Resume delayed flows | ❌ NO CRON JOB |
| **MISSING** | View execution logs | ❌ NO ENDPOINT |

---

## **Summary**

Your flow architecture is **solid**, but:
1. **Flow structure has bugs** (duplicates, empty conditions, no false branches) ⬅️ **USE FIXED JSON**
2. **Resume on inbound works** ✅
3. **Resume on delay NOT wired** ⬅️ **CREATE CRON JOB**
4. **Logging/debugging hidden** ⬅️ **CREATE LOGS ENDPOINT**

**Next steps:**
1. Import garage-flow-fixed.json
2. Add resumeDueFlowDelays cron job
3. Add executions endpoint for debugging
4. Test end-to-end

