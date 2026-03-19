import {StrictMode, lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import './index.css';

// Lazy load components for better mobile performance
const App = lazy(() => import('./App.tsx'));
const AdminPanel = lazy(() => import('./AdminPanel.tsx'));
const FullGallery = lazy(() => import('./FullGallery.tsx'));
const About = lazy(() => import('./About.tsx'));
const Contact = lazy(() => import('./Contact.tsx'));

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-black text-white">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        {/* @ts-ignore - key is valid for React elements but might not be in RoutesProps */}
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/gallery/:galleryId" element={<FullGallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  </StrictMode>,
);
