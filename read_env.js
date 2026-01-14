const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  fs.writeFileSync('env_debug.txt', content);
  console.log('Env copied to env_debug.txt');
} else {
  console.log('.env.local not found');
}
