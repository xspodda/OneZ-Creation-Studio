import { randomBytes, scryptSync } from 'node:crypto';

const code = process.argv[2];
if (!code) {
  console.error('Usage: node scripts/hash-access-code.js <private-code>');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(code, salt, 64).toString('hex');
console.log(`${salt}:${hash}`);