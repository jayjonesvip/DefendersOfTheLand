const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

function check(root = path.resolve(__dirname, '..'), manifest = require('../docs/editorial/series-canon-lock-2026-10-23.json')) {
  assert(manifest.files.length > 0, 'Canon inventory must not be empty');
  const failures = [];
  for (const entry of manifest.files) {
    const file = path.join(root, entry.path);
    if (!fs.existsSync(file)) {
      failures.push(`${entry.path}: missing`);
      continue;
    }
    const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    if (hash !== entry.sha256) failures.push(`${entry.path}: changed`);
  }
  assert.equal(failures.length, 0,
    `Books One–Three are locked published canon. Explicit author direction is required to reopen them.\n${failures.join('\n')}`);
  return manifest.files.length;
}

module.exports = { check };
if (require.main === module) console.log(`PASS: ${check()} locked canon source files unchanged.`);
