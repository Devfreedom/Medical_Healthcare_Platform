import { useEffect, useState } from 'react';
import Home from './pages/public/Home';
import Portal from './pages/patient/Portal';
import Login from './pages/public/Login';

function getRoute() {
  return window.location.pathname === '/login' ? 'login' : 'home';
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [showPortal, setShowPortal] = useState(false);

  useEffect(() => {
    const sync = () => setRoute(getRoute());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  if (route === 'login') {
    return <Login />;
  }

  return showPortal ? <Portal onBack={() => setShowPortal(false)} /> : <Home />;
}

export default App;
