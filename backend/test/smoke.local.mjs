// Temporary manual smoke check: boots the real Express app against an
// unreachable stub database to confirm status codes, validation and rate
// limit headers. Touches no real database.
process.env.DATABASE_URL = 'postgresql://stub:stub@127.0.0.1:1/stub';
process.env.JWT_SECRET = 'stub-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

const { default: app } = await import('../src/app.js');
const jwt = (await import('jsonwebtoken')).default;

const server = app.listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

async function show(label, response) {
  const body = await response.text();
  const limits = Object.fromEntries(
    [...response.headers].filter(([k]) => k.startsWith('ratelimit')),
  );
  console.log(`${label.padEnd(22)} -> ${response.status} ${body.slice(0, 70)}${Object.keys(limits).length ? ` ${JSON.stringify(limits)}` : ''}`);
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

await show('no header', await fetch(`${base}/api/messages`));
await show('malformed token', await fetch(`${base}/api/messages`, { headers: auth('abc') }));
await show('garbage token', await fetch(`${base}/api/auth/me`, { headers: auth('not-a-jwt') }));
await show('forged signature', await fetch(`${base}/api/auth/me`, {
  headers: auth('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.badsignature'),
}));

const expired = jwt.sign({ sub: '11111111-1111-1111-1111-111111111111' }, 'stub-secret', { expiresIn: '-1s' });
await show('expired token', await fetch(`${base}/api/auth/me`, { headers: auth(expired) }));

const valid = jwt.sign({ sub: '11111111-1111-1111-1111-111111111111' }, 'stub-secret');
await show('valid, DB down', await fetch(`${base}/api/profile`, { headers: auth(valid) }));
await show('valid, DB down', await fetch(`${base}/api/messages`, { headers: auth(valid) }));

const post = (path, body) => fetch(`${base}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

await show('register short name', await post('/api/auth/register', { name: 'A', email: 'x@y.z', password: 'longenough1' }));
await show('register long name', await post('/api/auth/register', { name: 'x'.repeat(101), email: 'x@y.z', password: 'longenough1' }));
await show('register blank name', await post('/api/auth/register', { name: '   ', email: 'x@y.z', password: 'longenough1' }));
await show('login bad creds', await post('/api/auth/login', { email: 'a@b.co', password: 'nope' }));
await show('register valid', await post('/api/auth/register', { name: 'Valid Name', email: 'x@y.z', password: 'longenough1' }));

await show('unknown route', await fetch(`${base}/api/nope`));

server.close();
process.exit(0);