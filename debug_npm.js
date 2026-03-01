const fs = require('fs');
const { execSync } = require('child_process');
fs.writeFileSync('step_1.txt', 'started');
try {
    fs.writeFileSync('step_2.txt', 'before exec');
    const output = execSync('npm -v', { encoding: 'utf8' });
    fs.writeFileSync('step_3.txt', 'after exec: ' + output);
} catch (err) {
    fs.writeFileSync('step_error.txt', err.message);
}
