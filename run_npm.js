const { execSync } = require('child_process');
const fs = require('fs');
try {
    const output = execSync('npm install framer-motion --legacy-peer-deps', { encoding: 'utf8' });
    fs.writeFileSync('npm_output.txt', output);
} catch (error) {
    fs.writeFileSync('npm_error.txt', error.toString() + "\n" + (error.stdout || "") + "\n" + (error.stderr || ""));
}
