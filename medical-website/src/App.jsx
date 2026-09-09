import { useState } from 'react';
import Home from './pages/public/Home';
import Portal from './pages/patient/Portal';

function App() {
  const [showPortal, setShowPortal] = useState(true);

  return showPortal ? <Portal onBack={() => setShowPortal(false)} /> : <Home />;
}

export default App;
