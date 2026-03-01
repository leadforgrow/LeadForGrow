const fs = require('fs');
fs.writeFileSync('test_write.txt', 'test write works');
const { execSync } = require('child_process');
try {
    const output = execSync('npm -v', { encoding: 'utf8' });
    fs.writeFileSync('test_npm_v.txt', output);
} catch (e) {
    fs.writeFileSync('test_npm_error.txt', e.message);
}
