const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\saura\\OneDrive\\Desktop\\leadforgrow\\LFG-V2\\app\\automation\\page.js';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ['ðŸ’¬', '💬'],
  ['ðŸ †', '🏆'],
  ['ðŸ” ', '🔁'],
  ['ðŸ“ž', '📞'],
  ['ðŸ“‹', '📋'],
  ['ðŸ—“', '🗓'],
  ['âš¡', '⚡'],
  ['â‚¹', '₹'],
  ['â€”', '—'],
  // Card accents
  ['Growth Strategist</h3>\n            <p className="text-xs text-slate-400">AI-generated 3-step revenue blueprint</p>', 'Growth Strategist</h3>\n            <p className="text-xs text-slate-400">AI-generated 3-step revenue blueprint</p>'], // Just as anchor
];

// More direct replacement for the card containers
content = content.replace(
  'return (\n    <div className="bg-white rounded-2xl border border-slate-100 p-7 h-full flex flex-col" style={{boxShadow:\'0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)\'}}>\n      <div className="flex items-start justify-between mb-6">\n        <div className="flex items-center gap-3">',
  'return (\n    <div className="bg-white rounded-2xl border border-slate-100 border-t-2 border-t-blue-400 p-7 h-full flex flex-col" style={{boxShadow:\'0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)\'}}>\n      <div className="flex items-start justify-between mb-6">\n        <div className="flex items-center gap-3">'
);

// Fix emojis
replacements.forEach(([bad, good]) => {
  content = content.split(bad).join(good);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed encodings and card accents.');
