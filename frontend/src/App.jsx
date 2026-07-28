import React, { Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy loaded pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const SubadminDashboard = React.lazy(() => import('./pages/SubadminDashboard'));
const ChefDashboard = React.lazy(() => import('./pages/ChefDashboard'));
const MyAccount = React.lazy(() => import('./pages/MyAccount'));
const DeliveryDashboard = React.lazy(() => import('./pages/DeliveryDashboard'));
const TrackOrder = React.lazy(() => import('./pages/TrackOrder'));
const SuperadminDashboard = React.lazy(() => import('./pages/SuperadminDashboard'));
const ChefMenu = React.lazy(() => import('./pages/ChefMenu'));
const Menu = React.lazy(() => import('./pages/Menu'));

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div><style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style></div>}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/menu" element={<PageWrapper><Menu /></PageWrapper>} />
              <Route path="/chef/:id" element={<PageWrapper><ChefMenu /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
              <Route path="/subadmin" element={<PageWrapper><SubadminDashboard /></PageWrapper>} />
              <Route path="/admin" element={<Navigate to="/subadmin" replace />} />
              <Route path="/chef-dashboard" element={<PageWrapper><ChefDashboard /></PageWrapper>} />
              <Route path="/account" element={<PageWrapper><MyAccount /></PageWrapper>} />
              <Route path="/delivery-dashboard" element={<PageWrapper><DeliveryDashboard /></PageWrapper>} />
              <Route path="/track/:id" element={<PageWrapper><TrackOrder /></PageWrapper>} />
              <Route path="/superadmin" element={<PageWrapper><SuperadminDashboard /></PageWrapper>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
