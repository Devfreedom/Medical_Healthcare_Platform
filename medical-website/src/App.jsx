import { useCallback, useEffect, useState } from 'react';
import Home from './pages/public/Home';
import Portal from './pages/patient/Portal';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import {
  anonymousSession,
  api,
  checkingSession,
  classifyVerification,
  clearSession,
  getToken,
  setSession,
  SESSION_AUTHENTICATED,
  SESSION_CHECKING,
  SESSION_UNVERIFIED,
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
  // Session is a single state machine so a cached user can never be shown as
  // authenticated until the backend has confirmed it.
  const [session, setSessionState] = useState(() =>
    (getToken() ? checkingSession() : anonymousSession()));
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
      .then(
        (result) => {
          if (cancelled) return;

          const outcome = classifyVerification({ user: result?.user });
          if (outcome.shouldClear) clearSession();
          if (outcome.status === SESSION_AUTHENTICATED) {
            const token = getToken();
            if (token) setSession(token, outcome.user);
          }
          setSessionState(outcome);
        },
        (error) => {
          if (cancelled) return;

          const outcome = classifyVerification({ error });
          if (outcome.shouldClear) clearSession();
          setSessionState(outcome);
        },
      );

    return () => { cancelled = true; };
  }, [verifyAttempt]);

  const handleAuthenticated = (authenticated) => {
    setSession(authenticated.token, authenticated.user);
    setSessionState({ status: 'authenticated', user: authenticated.user, error: '' });
    go('/portal');
  };

  const logout = () => {
    clearSession();
    setSessionState(anonymousSession());
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
    setSessionState(checkingSession());
  };

  const signInAgain = () => {
    clearSession();
    setSessionState(anonymousSession());
    go('/login');
  };

  if (session.status === SESSION_CHECKING) {
    return (
      <SessionShell title="Northbridge Health" detail="Checking your session…">
        <div className="mt-4 text-sm text-[#6B7A77]" aria-live="polite" />
      </SessionShell>
    );
  }

  // Unverified cached data must not reach the portal — offer a retry instead.
  if (session.status === SESSION_UNVERIFIED) {
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