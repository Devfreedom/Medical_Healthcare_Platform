# Manual browser test: API outage and session recovery

Procedure for verifying that a saved session survives a backend outage and that
Retry restores it. **Not yet executed** — run it before the next deploy.

This test uses only a test account with fake data. Do not enter real patient
information, and do not paste a production token anywhere.

## What it proves

| Step | Expected |
| --- | --- |
| 2 | `northbridge_token` and `northbridge_user` exist in localStorage |
| 3 | The recoverable error state appears — not the login page |
| 4 | The token is **still** in localStorage (the outage did not log you out) |
| 5 | Retry restores the portal and the header still shows the signed-in user |
| 6 | A real 401 clears the session and returns you to `/login` |

## Prerequisites

- Chrome or Edge (the steps use the Network panel request-blocking feature).
- A deployed frontend URL, e.g. `https://northbridge-health.vercel.app`.
- The Render API hostname, e.g. `onrender.com` — visible as the `VITE_API_URL`
  host. Find it in DevTools → Network → any `fetch` request.
- A test account, already signed in, sitting on any portal tab.

## Steps

### 1. Block the API

1. Open the deployed site and sign in with the test account.
2. Open DevTools (`F12`, or `Cmd`/`Ctrl` + `Shift` + `I`).
3. Go to the **Network** tab.
4. Open the **Block request URL** drawer: right-click any row in the request
   list → **Block request URL** (in newer Chrome: the ⋮ menu → **Block
   request URL**).
5. Click **+**, add a pattern, and enable it. Patterns to add — the leading `*`
   is required:

   ```
   *onrender.com*
   ```

   Add `*localhost:5000*` too if you are testing a local build.

6. Confirm the pattern row shows the **red** blocked indicator, not grey. If it
   is grey, the pattern was not saved.

Leave the blocking enabled. Only the API is blocked — the frontend on Vercel
loads normally, which is the point of the test.

### 2. Load /portal with the API blocked

1. Focus the address bar and hard-reload `/portal` (`Cmd`/`Ctrl` + `Shift` + `R`).
2. **Expect:** the "Northbridge Health" screen with a short explanation and two
   buttons, **Try again** and **Sign in again**.
3. **Expect:** you are *not* redirected to `/login`.
4. **Expect:** the message is plain language ("Could not reach Northbridge
   Health. Check your connection and try again."), not a stack trace or a raw
   network error.

In the Network tab, the `/api/auth/me` request should appear as
**blocked:other** in red.

### 3. Confirm the session was not erased

With DevTools open, run in the Console:

```js
JSON.parse(localStorage.getItem('northbridge_user'))?.email
// and
localStorage.getItem('northbridge_token')?.slice(0, 12)
```

**Expect:** your test email, and a non-empty token prefix.

**Expect:** the token is **still there.** A backend outage must not log you out.
If either value is `null`, stop and file a bug — that is the exact regression
this test exists to catch.

### 4. Unblock the API

1. Back in the **Block request URL** drawer, untick the pattern (or delete the
   rule). The row must lose its red indicator.
2. Keep the Network tab open so you can watch the next request succeed.

### 5. Press Retry

1. Click **Try again**.
2. **Expect:** a brief "Checking your session…" state, then the portal renders.
3. **Expect:** the header shows "Signed in as \<your name\>" — the same name as
   before the outage.
4. **Expect:** a successful `/api/auth/me` (status 200) in the Network tab.

### 6. Confirm a genuine 401 still ends the session

This is the other half of the rule: outages are recoverable, but a rejected
token is not.

1. With the API unblocked, in the Console run:

   ```js
   localStorage.setItem('northbridge_token', 'deliberately-invalid-token');
   ```

2. Hard-reload `/portal`.
3. **Expect:** you are redirected to `/login`.
4. **Expect in the Console:** `localStorage.getItem('northbridge_token')` is
   `null` — the invalid session was cleared.
5. **Expect in the Network tab:** `/api/auth/me` returned **401**.

### 7. Restore

Sign back in with the test account and confirm the portal loads normally, so
the account is left usable.

## Cleanup

- Remove every rule from the **Block request URL** drawer.
- Reload the site once to confirm normal behaviour.

A lingering block rule silently breaks every later test you run, including
sign-in. Always clean this up.

## Notes

- If the app is running the local demo store (`VITE_API_URL` unset in a dev
  build), blocking the API has no effect — the demo store is used instead.
  This test only makes sense against a build with `VITE_API_URL` configured.
- Chrome's offline throttling (Network → throttling → "Offline") is an
  alternative to step 1, but it blocks the frontend too, so request blocking is
  the better tool here.