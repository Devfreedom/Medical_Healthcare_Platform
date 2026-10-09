// Temporary manual smoke check: confirms the login and registration limiters
// fire independently of the shared /api/auth limiter.
process.env.DATABASE_URL = 'postgresql://stub:stub@127.0.0.1:1/stub';
process.env.JWT_SECRET = 'stub-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

const { default: app } = await import('../src/app.js');

const server = app.listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

const post = (path, body) => fetch(`${base}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// 25 login attempts: the 20-per-15min login limiter should start rejecting.
const loginStatuses = [];
for (let i = 0; i < 25; i += 1) {
  const r = await post('/api/auth/login', { email: `a${i}@b.co`, password: 'nope' });
  loginStatuses.push(r.status);
  if (r.status === 429) {
    console.log(`login limiter fired on attempt ${i + 1}:`, await r.text());
    break;
  }
}
console.log('login statuses:', loginStatuses.join(','));

// Registration should still be under its own, separate budget.
const reg = await post('/api/auth/register', { name: 'Valid Name', email: 'x@y.z', password: 'longenough1' });
console.log('register while login is limited ->', reg.status, (await reg.text()).slice(0, 60));

// And the shared limiter is untouched by those logins.
const me = await fetch(`${base}/api/auth/me`, { headers: { Authorization: 'Bearer not-a-jwt' } });
console.log('shared auth limiter remaining  ->', me.headers.get('ratelimit-remaining'));

server.close();
process.exit(0);