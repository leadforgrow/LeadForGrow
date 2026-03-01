const { execSync } = require('child_process');
const fs = require('fs');
try {
    const output = execSync('npm install', { encoding: 'utf8' });
    fs.writeFileSync('final_install_log.txt', output);
} catch (err) {
    fs.writeFileSync('final_install_err.txt', err.message + '\n' + (err.stdout || '') + '\n' + (err.stderr || ''));
}
