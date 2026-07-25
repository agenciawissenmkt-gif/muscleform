import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Explore from './pages/Explore';

const TryOn = lazy(() => import('./pages/TryOn'));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/explorar"
          element={
            <PageTransition>
              <Explore />
            </PageTransition>
          }
        />
        <Route
          path="/experimentar"
          element={
            <PageTransition>
              <Suspense fallback={<div className="flex h-[100svh] items-center justify-center bg-ink-900" />}>
                <TryOn />
              </Suspense>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto min-h-full max-w-md pb-24">
        <AnimatedRoutes />
      </div>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;
