import { useEffect, useState } from 'react';
import Home from './pages/public/Home';
import Portal from './pages/patient/Portal';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import { api, clearSession, getStoredUser, getToken, setSession } from './lib/api';

function getRoute() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [user, setUser] = useState(getStoredUser);
  const [checkingSession, setCheckingSession] = useState(Boolean(getStoredUser()));

  useEffect(() => {
    const sync = () => setRoute(getRoute());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!getStoredUser()) {
      return undefined;
    }

    api('/api/auth/me')
      .then((result) => {
        if (cancelled) return;
        const token = getToken();
        if (token) setSession(token, result.user);
        setUser(result.user);
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });

    return () => { cancelled = true; };
  }, []);

  const go = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleAuthenticated = (session) => {
    setSession(session.token, session.user);
    setUser(session.user);
    go('/portal');
  };

  const logout = () => {
    clearSession();
    setUser(null);
    go('/');
  };

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FFFBF4]"><div className="text-center"><div className="font-serif text-2xl text-[#0A3C2E]">Northbridge Health</div><div className="mt-2 text-sm text-[#6B7A77]">Checking your session…</div></div></div>;
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
        onUserChange={setUser}
      />
    );
  }

  return <Home />;
}
