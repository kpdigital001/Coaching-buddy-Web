// Run locally, with a NEW password read interactively. Never commit the output.
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { createInterface } from 'node:readline';
const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question('New SEO admin password (input visible locally; do not share): ', (password) => {
  rl.close();
  if (password.length < 16) { console.error('Use at least 16 characters.'); process.exitCode = 1; return; }
  const salt = randomBytes(24);
  const hash = pbkdf2Sync(password, salt, 310000, 32, 'sha256');
  const url = (bytes) => bytes.toString('base64url');
  console.log('\nSet these with "npx wrangler secret put ..."; never use VITE_ or commit them:');
  console.log('SEO_LOGIN_SALT =', url(salt));
  console.log('SEO_LOGIN_HASH =', url(hash));
  console.log('SEO_SESSION_SECRET =', url(randomBytes(48)));
});
