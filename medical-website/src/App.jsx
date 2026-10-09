import { useCallback, useEffect, useState } from 'react';
import Home from './pages/public/Home';
import Portal from './pages/patient/Portal';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import {
  api,
  clearSession,
  getToken,
  isSessionError,
  setSession,
  updateStoredUser,
} from './lib/api';

function getRoute() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

// Session is a single state machine so a cached user can never be shown as
// authenticated until the backend has confirmed it.
const ANONYMOUS = { status: 'anonymous', user: null, error: '' };
const CHECKING = { status: 'checking', user: null, error: '' };

function SessionShell({ title, detail, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBF4] px-6">
      <div className="max-w-md text-center">
        <div className="font-serif text-2xl text-[#0A3C2E]">{title}</div>
        {detail && <p className="mt-2 text-sm text-[#6B7A77]">{detail}</p>}
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [session, setSessionState] = useState(() => (getToken() ? CHECKING : ANONYMOUS));
  const [verifyAttempt, setVerifyAttempt] = useState(0);

  const user = session.user;

  useEffect(() => {
    const sync = () => setRoute(getRoute());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const go = useCallback((path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  useEffect(() => {
    if (!getToken()) {
      return undefined;
    }

    let cancelled = false;

    api('/api/auth/me')
      .then((result) => {
        if (cancelled) return;

        const verified = result?.user;
        if (!verified) {
          clearSession();
          setSessionState(ANONYMOUS);
          return;
        }

        const token = getToken();
        if (token) setSession(token, verified);
        setSessionState({ status: 'authenticated', user: verified, error: '' });
      })
      .catch((error) => {
        if (cancelled) return;

        // A confirmed 401 is the only reason to end the session. Network
        // failures and 5xx keep the session so the user can retry.
        if (isSessionError(error)) {
          clearSession();
          setSessionState(ANONYMOUS);
          return;
        }

        setSessionState({
          status: 'unverified',
          user: null,
          error: error?.message || 'We could not verify your session.',
        });
      });

    return () => { cancelled = true; };
  }, [verifyAttempt]);

  const handleAuthenticated = (authenticated) => {
    setSession(authenticated.token, authenticated.user);
    setSessionState({ status: 'authenticated', user: authenticated.user, error: '' });
    go('/portal');
  };

  const logout = () => {
    clearSession();
    setSessionState(ANONYMOUS);
    go('/');
  };

  const handleUserChange = (updatedUser) => {
    if (!updatedUser) {
      setSessionState((current) => ({ ...current, user: null }));
      return;
    }

    // Persist the rename so a reload does not resurrect the old name.
    const next = updateStoredUser(updatedUser);
    setSessionState((current) => ({ ...current, user: next || updatedUser }));
  };

  const retrySession = () => {
    setVerifyAttempt((attempt) => attempt + 1);
    setSessionState(CHECKING);
  };

  const signInAgain = () => {
    clearSession();
    setSessionState(ANONYMOUS);
    go('/login');
  };

  if (session.status === 'checking') {
    return (
      <SessionShell title="Northbridge Health" detail="Checking your session…">
        <div className="mt-4 text-sm text-[#6B7A77]" aria-live="polite" />
      </SessionShell>
    );
  }

  // Unverified cached data must not reach the portal — offer a retry instead.
  if (session.status === 'unverified') {
    return (
      <SessionShell title="Northbridge Health" detail={session.error}>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={retrySession}
            className="rounded-full bg-[#0A3C2E] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={signInAgain}
            className="rounded-full border border-[#0A3C2E]/20 px-5 py-2.5 text-sm font-medium text-[#0A3C2E]"
          >
            Sign in again
          </button>
        </div>
      </SessionShell>
    );
  }

  // Authenticated users never see the auth forms — send them to the portal.
  if ((route === '/login' || route === '/register') && user) {
    if (window.location.pathname !== '/portal') go('/portal');
    return null;
  }

  if (route === '/login') return <Login onAuthenticated={handleAuthenticated} />;
  if (route === '/register') return <Register onAuthenticated={handleAuthenticated} />;

  if (route === '/portal') {
    if (!user) {
      if (window.location.pathname !== '/login') go('/login');
      return null;
    }
    return (
      <Portal
        user={user}
        onLogout={logout}
        onBack={() => go('/')}
        onUserChange={handleUserChange}
      />
    );
  }

  return <Home />;
}