const { execSync } = require('child_process');
const fs = require('fs');
try {
    const output = execSync('npm install framer-motion --legacy-peer-deps', { encoding: 'utf8' });
    fs.writeFileSync('install_result.txt', 'SUCCESS:\n' + output);
} catch (error) {
    fs.writeFileSync('install_result.txt', 'FAILURE:\n' + error.toString() + '\nSTDOUT:\n' + (error.stdout || '') + '\nSTDERR:\n' + (error.stderr || ''));
}
