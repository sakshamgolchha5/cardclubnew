// Fills the placeholders in the public legal pages and the Play Store documents.
// Usage: node scripts/fill-legal.mjs "Your legal name" "support@example.com" ["audience: general | children"]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
const [, , name, email, audience = 'general'] = process.argv;
if (!name || !email) { console.error('Usage: node scripts/fill-legal.mjs "Your legal name" "support@example.com" [general|children]'); process.exit(1); }
const date = new Date().toISOString().slice(0, 10);
const aud = audience === 'children'
  ? 'Card Club Arcade is designed to be suitable for a family audience. It collects no personal information from children, has no ads, no accounts and no payments. Room-code games let players connect with people who know the room code.'
  : 'Card Club Arcade is a general-audience game and is not directed to children under 13. It collects no personal information, has no ads, no accounts and no payments. Room-code games let players connect with people who know the room code.';
const files = [...readdirSync('public').filter(f => f.endsWith('.html')).map(f => `public/${f}`), ...(existsSync('docs/play-store') ? readdirSync('docs/play-store').map(f => `docs/play-store/${f}`) : [])];
for (const f of files) { const s = readFileSync(f, 'utf8'), t = s.replaceAll('{{PUBLISHER}}', name).replaceAll('{{EMAIL}}', email).replaceAll('{{DATE}}', date).replaceAll('{{AUDIENCE}}', aud); if (s !== t) { writeFileSync(f, t); console.log('filled', f); } }
