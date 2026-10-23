const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { check } = require('./verify-canon.cjs');

test('canon guard accepts the locked repository snapshot', () => {
  assert.equal(check(), require('../docs/editorial/series-canon-lock-2026-10-23.json').files.length);
});

test('canon guard rejects modified or missing protected files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'canon-guard-'));
  const file = path.join(root, 'chapter.json');
  const original = '{"text":"Published canon"}\n';
  const manifest = { files: [{ path: 'chapter.json', sha256: crypto.createHash('sha256').update(original).digest('hex') }] };
  try {
    fs.writeFileSync(file, original);
    assert.equal(check(root, manifest), 1);
    fs.writeFileSync(file, '{"text":"Unrequested revision"}\n');
    assert.throws(() => check(root, manifest), /chapter\.json: changed/);
    fs.unlinkSync(file);
    assert.throws(() => check(root, manifest), /chapter\.json: missing/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
