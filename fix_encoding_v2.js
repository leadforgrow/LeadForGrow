const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\saura\\OneDrive\\Desktop\\leadforgrow\\LFG-V2\\app\\automation\\page.js';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Line 418 (index 417 if 1-indexed)
if (lines[417] && lines[417].includes('className="bg-white rounded-2xl border border-slate-100 p-7 h-full flex flex-col"')) {
  lines[417] = lines[417].replace('className="bg-white rounded-2xl border border-slate-100 p-7 h-full flex flex-col"', 'className="bg-white rounded-2xl border border-slate-100 border-t-2 border-t-blue-400 p-7 h-full flex flex-col"');
}

// Line 561 (index 560 if 1-indexed)
if (lines[560] && lines[560].includes('className="bg-white rounded-2xl border border-slate-100 p-7 h-full flex flex-col"')) {
  lines[560] = lines[560].replace('className="bg-white rounded-2xl border border-slate-100 p-7 h-full flex flex-col"', 'className="bg-white rounded-2xl border border-slate-100 border-t-2 border-t-indigo-400 p-7 h-full flex flex-col"');
}

// Function replacement for getActivityIcon
const startLine = 549; // index 549 is line 550
const endLine = 557;   // index 557 is line 558
lines[startLine] = "  const getActivityIcon = (type) => {";
lines[startLine+1] = "    if (!type) return '💬';";
lines[startLine+2] = "    if (type.includes('convert')) return '🏆';";
lines[startLine+3] = "    if (type.includes('follow')) return '🔁';";
lines[startLine+4] = "    if (type.includes('call')) return '📞';";
lines[startLine+5] = "    if (type.includes('status')) return '📋';";
lines[startLine+6] = "    if (type.includes('schedule')) return '🗓';";
lines[startLine+7] = "    return '⚡';";
lines[startLine+8] = "  };";

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully updated file.');
