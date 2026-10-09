import { useCallback, useEffect, useState } from 'react';
import Home from './pages/public/Home';
import Portal from './pages/patient/Portal';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import {
  api,
  clearSession,
  getStoredUser,
  getToken,
  isSessionError,
  setSession,
  updateStoredUser,
} from './lib/api';

function getRoute() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

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
  // Cached user data is only a hint for the portal chrome; it is never trusted
  // for access control until verifySession() has confirmed it with the backend.
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(getToken()));
  const [sessionError, setSessionError] = useState('');
  const [verifyAttempt, setVerifyAttempt] = useState(0);

  useEffect(() => {
    const sync = () => setRoute(getRoute());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const go = useCallback((path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const verifySession = useCallback(() => {
    if (!getToken()) {
      setUser(null);
      setCheckingSession(false);
      setSessionError('');
      return undefined;
    }

    let cancelled = false;
    setCheckingSession(true);
    setSessionError('');

    api('/api/auth/me')
      .then((result) => {
        if (cancelled) return;

        const verified = result?.user;
        if (!verified) {
          clearSession();
          setUser(null);
          return;
        }

        const token = getToken();
        if (token) setSession(token, verified);
        setUser(verified);
      })
      .catch((error) => {
        if (cancelled) return;

        // A confirmed 401 is the only reason to end the session. Network
        // failures and 5xx keep the session so the user can retry.
        if (isSessionError(error)) {
          clearSession();
          setUser(null);
          return;
        }

        setSessionError(error?.message || 'We could not verify your session.');
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => verifySession(), [verifyAttempt, verifySession]);

  const handleAuthenticated = (session) => {
    setSession(session.token, session.user);
    setUser(session.user);
    setSessionError('');
    setCheckingSession(false);
    go('/portal');
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setSessionError('');
    setCheckingSession(false);
    go('/');
  };

  const handleUserChange = (updatedUser) => {
    if (!updatedUser) {
      setUser(null);
      return;
    }

    // Persist the rename so a reload does not resurrect the old name.
    const next = updateStoredUser(updatedUser);
    setUser(next || updatedUser);
  };

  const retrySession = () => setVerifyAttempt((attempt) => attempt + 1);

  if (checkingSession) {
    return (
      <SessionShell title="Northbridge Health" detail="Checking your session…">
        <div className="mt-4 text-sm text-[#6B7A77]" aria-live="polite" />
      </SessionShell>
    );
  }

  // Unverified cached data must not reach the portal — offer a retry instead.
  if (sessionError) {
    return (
      <SessionShell title="Northbridge Health" detail={sessionError}>
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
            onClick={() => {
              clearSession();
              setUser(null);
              setSessionError('');
              go('/login');
            }}
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