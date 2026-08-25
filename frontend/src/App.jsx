import React, { Suspense, useContext } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SubadminLayout from './components/SubadminLayout';
import AdminLayout from './components/AdminLayout';
import SuperadminLayout from './components/SuperadminLayout';
import ChefLayout from './components/ChefLayout';
import DeliveryLayout from './components/DeliveryLayout';

// Lazy loaded pages
const Home = React.lazy(() => import('./pages/public/Home'));
const Login = React.lazy(() => import('./pages/public/Login'));
const Checkout = React.lazy(() => import('./pages/customer/Checkout'));
const MyAccount = React.lazy(() => import('./pages/customer/MyAccount'));
const TrackOrder = React.lazy(() => import('./pages/customer/TrackOrder'));
const ChefMenu = React.lazy(() => import('./pages/chef/ChefMenu'));
const Menu = React.lazy(() => import('./pages/customer/Menu'));

// Delivery Dashboard Pages
const DeliveryDashboardPage = React.lazy(() => import('./pages/delivery/DeliveryDashboardPage'));
const DeliveryOrdersPage = React.lazy(() => import('./pages/delivery/DeliveryOrdersPage'));
const DeliveryEarningsPage = React.lazy(() => import('./pages/delivery/DeliveryEarningsPage'));
const DeliveryProfilePage = React.lazy(() => import('./pages/delivery/DeliveryProfilePage'));
const DeliveryNotificationsPage = React.lazy(() => import('./pages/delivery/DeliveryNotificationsPage'));
const DeliverySupportPage = React.lazy(() => import('./pages/delivery/DeliverySupportPage'));
const DeliveryDocumentsPage = React.lazy(() => import('./pages/delivery/DeliveryDocumentsPage'));
const DeliveryIncentivesPage = React.lazy(() => import('./pages/delivery/DeliveryIncentivesPage'));

// Static & Registration Pages
const HowItWorks = React.lazy(() => import('./pages/public/HowItWorks'));
const ForChefs = React.lazy(() => import('./pages/public/ForChefs'));
const Cities = React.lazy(() => import('./pages/public/Cities'));
const AboutUs = React.lazy(() => import('./pages/public/AboutUs'));
const ChefRegister = React.lazy(() => import('./pages/chef/ChefRegister'));
const DeliveryRegister = React.lazy(() => import('./pages/delivery/DeliveryRegister'));
const LocationOnboarding = React.lazy(() => import('./pages/public/LocationOnboarding'));

// Public Browsing Pages
const Categories = React.lazy(() => import('./pages/public/Categories'));
const ChefsList = React.lazy(() => import('./pages/public/ChefsList'));
const Offers = React.lazy(() => import('./pages/public/Offers'));

// Chef Dashboard Pages
const ChefDashboardPage = React.lazy(() => import('./pages/chef/ChefDashboardPage'));
const ChefOrdersPage = React.lazy(() => import('./pages/chef/ChefOrdersPage'));
const ChefMenuPage = React.lazy(() => import('./pages/chef/ChefMenuPage'));
const ChefKitchenPage = React.lazy(() => import('./pages/chef/ChefKitchenPage'));
const ChefSubscriptionsPage = React.lazy(() => import('./pages/chef/ChefSubscriptionsPage'));
const ChefPartyOrdersPage = React.lazy(() => import('./pages/chef/ChefPartyOrdersPage'));
const ChefEarningsPage = React.lazy(() => import('./pages/chef/ChefEarningsPage'));
const ChefGrowthPage = React.lazy(() => import('./pages/chef/ChefGrowthPage'));
const ChefCommunityPage = React.lazy(() => import('./pages/chef/ChefCommunityPage'));
const ChefProfilePage = React.lazy(() => import('./pages/chef/ChefProfilePage'));
const ChefReviewsPage = React.lazy(() => import('./pages/chef/ChefReviewsPage'));
const ChefSettingsPage = React.lazy(() => import('./pages/chef/ChefSettingsPage'));
const ChefSupportPage = React.lazy(() => import('./pages/chef/ChefSupportPage'));
const ChefInvitePage = React.lazy(() => import('./pages/chef/ChefInvitePage'));
const GrowthHubPage = React.lazy(() => import('./pages/chef/GrowthHubPage'));
const OffersCouponsPage = React.lazy(() => import('./pages/chef/OffersCouponsPage'));
const PromotionsPage = React.lazy(() => import('./pages/chef/PromotionsPage'));
const ChefPlansPage = React.lazy(() => import('./pages/chef/ChefPlansPage'));
const ChefMarketingPage = React.lazy(() => import('./pages/chef/ChefMarketingPage'));
// Subadmin Pages
const SubadminDashboard = React.lazy(() => import('./pages/subadmin/SubadminDashboard'));
const SubadminOrders = React.lazy(() => import('./pages/subadmin/SubadminOrders'));
const SubadminChefs = React.lazy(() => import('./pages/subadmin/SubadminChefs'));
const SubadminDelivery = React.lazy(() => import('./pages/subadmin/SubadminDelivery'));
const SubadminCustomers = React.lazy(() => import('./pages/subadmin/SubadminCustomers'));
const SubadminPromotions = React.lazy(() => import('./pages/subadmin/SubadminPromotions'));
const SubadminBanners = React.lazy(() => import('./pages/subadmin/SubadminBanners'));
const SubadminCoupons = React.lazy(() => import('./pages/subadmin/SubadminCoupons'));
const SubadminSupport = React.lazy(() => import('./pages/subadmin/SubadminSupport'));
const SubadminRefunds = React.lazy(() => import('./pages/subadmin/SubadminRefunds'));
const SubadminAnalytics = React.lazy(() => import('./pages/subadmin/SubadminAnalytics'));
const SubadminProfile = React.lazy(() => import('./pages/subadmin/SubadminProfile'));
const SubadminAssignedCity = React.lazy(() => import('./pages/subadmin/SubadminAssignedCity'));
const SubadminPermissions = React.lazy(() => import('./pages/subadmin/SubadminPermissions'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminChefs = React.lazy(() => import('./pages/admin/AdminChefs'));
const AdminDelivery = React.lazy(() => import('./pages/admin/AdminDelivery'));
const AdminCustomers = React.lazy(() => import('./pages/admin/AdminCustomers'));
const AdminPromotions = React.lazy(() => import('./pages/admin/AdminPromotions'));
const AdminBanners = React.lazy(() => import('./pages/admin/AdminBanners'));
const AdminCoupons = React.lazy(() => import('./pages/admin/AdminCoupons'));
const AdminSupport = React.lazy(() => import('./pages/admin/AdminSupport'));
const AdminRefunds = React.lazy(() => import('./pages/admin/AdminRefunds'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminProfile = React.lazy(() => import('./pages/admin/AdminProfile'));
const AdminAssignedCity = React.lazy(() => import('./pages/admin/AdminAssignedCity'));
const AdminPermissions = React.lazy(() => import('./pages/admin/AdminPermissions'));
const AdminZones = React.lazy(() => import('./pages/admin/AdminZones'));
const AdminSubAdmins = React.lazy(() => import('./pages/admin/AdminSubAdmins'));
const AdminCitySettings = React.lazy(() => import('./pages/admin/AdminCitySettings'));

// Superadmin Pages
const SuperadminDashboard = React.lazy(() => import('./pages/superadmin/SuperadminDashboard'));
const SuperadminCities = React.lazy(() => import('./pages/superadmin/SuperadminCities'));
const SuperadminSubAdmins = React.lazy(() => import('./pages/superadmin/SuperadminSubAdmins'));
const SuperadminVerification = React.lazy(() => import('./pages/superadmin/SuperadminVerification'));
const SuperadminAuditLogs = React.lazy(() => import('./pages/superadmin/SuperadminAuditLogs'));
const SuperadminOrders = React.lazy(() => import('./pages/superadmin/SuperadminOrders'));
const SuperadminChefs = React.lazy(() => import('./pages/superadmin/SuperadminChefs'));
const SuperadminDelivery = React.lazy(() => import('./pages/superadmin/SuperadminDelivery'));
const SuperadminCustomers = React.lazy(() => import('./pages/superadmin/SuperadminCustomers'));
const SuperadminSupport = React.lazy(() => import('./pages/superadmin/SuperadminSupport'));
// Phase 2 Superadmin Pages
const SuperadminSettings = React.lazy(() => import('./pages/superadmin/SuperadminSettings'));
const SuperadminRevenue = React.lazy(() => import('./pages/superadmin/SuperadminRevenue'));
const SuperadminCommissions = React.lazy(() => import('./pages/superadmin/SuperadminCommissions'));
const SuperadminWallets = React.lazy(() => import('./pages/superadmin/SuperadminWallets'));
const SuperadminPayouts = React.lazy(() => import('./pages/superadmin/SuperadminPayouts'));
const SuperadminRefunds = React.lazy(() => import('./pages/superadmin/SuperadminRefunds'));
const SuperadminTaxes = React.lazy(() => import('./pages/superadmin/SuperadminTaxes'));
const SuperadminPromotions = React.lazy(() => import('./pages/superadmin/SuperadminPromotions'));
const SuperadminCoupons = React.lazy(() => import('./pages/superadmin/SuperadminCoupons'));
const SuperadminBanners = React.lazy(() => import('./pages/superadmin/SuperadminBanners'));
const SuperadminCampaigns = React.lazy(() => import('./pages/superadmin/SuperadminCampaigns'));
const SuperadminFeatured = React.lazy(() => import('./pages/superadmin/SuperadminFeatured'));
const SuperadminBusinessAnalytics = React.lazy(() => import('./pages/superadmin/SuperadminBusinessAnalytics'));
const SuperadminCityAnalytics = React.lazy(() => import('./pages/superadmin/SuperadminCityAnalytics'));
const SuperadminCategories = React.lazy(() => import('./pages/superadmin/SuperadminCategories'));
const SuperadminSystemHealth = React.lazy(() => import('./pages/superadmin/SuperadminSystemHealth'));
const SuperadminPages = React.lazy(() => import('./pages/superadmin/ContentManagement'));

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

const CustomerOnly = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (user) {
    if (user.role === 'subadmin') return <Navigate to="/subadmin" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (user.role === 'chef') return <Navigate to="/chef/dashboard" replace />;
    if (user.role === 'delivery') return <Navigate to="/delivery-dashboard" replace />;
  }
  return <PageWrapper>{children}</PageWrapper>;
};

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'subadmin') return <Navigate to="/subadmin" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (user.role === 'chef') return <Navigate to="/chef/dashboard" replace />;
  if (user.role === 'delivery') return <Navigate to="/delivery-dashboard" replace />;
  
  return <PageWrapper>{children}</PageWrapper>;
};

function App() {
  const location = useLocation();
  const isSubadmin = location.pathname.startsWith('/subadmin');
  const isAdmin = location.pathname.startsWith('/admin');
  const isSuperadmin = location.pathname.startsWith('/superadmin');
  const isChef = location.pathname.startsWith('/chef') && !location.pathname.startsWith('/chef/register') && location.pathname !== '/chefs';
  const isDelivery = location.pathname.startsWith('/delivery') && !location.pathname.startsWith('/delivery/register');
  const hideGlobalNav = isSubadmin || isAdmin || isSuperadmin || isChef || isDelivery;
  
  // Use a base key for dashboards to prevent unmounting the entire layout on sub-route changes
  const routesKey = hideGlobalNav ? location.pathname.split('/')[1] : location.pathname;

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      {!hideGlobalNav && <Navbar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div><style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style></div>}>
            <Routes location={location} key={routesKey}>
              {/* Public/Customer Routes */}
              <Route path="/" element={<CustomerOnly><Home /></CustomerOnly>} />
              <Route path="/how-it-works" element={<PageWrapper><HowItWorks /></PageWrapper>} />
              <Route path="/for-chefs" element={<PageWrapper><ForChefs /></PageWrapper>} />
              <Route path="/cities" element={<PageWrapper><Cities /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><AboutUs /></PageWrapper>} />
              
              <Route path="/categories" element={<PageWrapper><Categories /></PageWrapper>} />
              <Route path="/chefs" element={<PageWrapper><ChefsList /></PageWrapper>} />
              <Route path="/offers" element={<PageWrapper><Offers /></PageWrapper>} />
              
              <Route path="/menu" element={<CustomerOnly><Menu /></CustomerOnly>} />
              <Route path="/chef/:id" element={<CustomerOnly><ChefMenu /></CustomerOnly>} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/verify-otp" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/forgot-password" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/chef/register" element={<PageWrapper><ChefRegister /></PageWrapper>} />
              <Route path="/delivery/register" element={<PageWrapper><DeliveryRegister /></PageWrapper>} />
              <Route path="/onboarding/location" element={<PageWrapper><LocationOnboarding /></PageWrapper>} />
              
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/account/:tab?" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
              <Route path="/track/:id" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
              
              {/* Chef Dashboard Routes */}
              <Route path="/chef-dashboard" element={<Navigate to="/chef/dashboard" replace />} />
              <Route path="/chef" element={<ChefLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ChefDashboardPage />} />
                <Route path="orders" element={<ChefOrdersPage />} />
                <Route path="menu" element={<ChefMenuPage />} />
                <Route path="kitchen" element={<ChefKitchenPage />} />
                <Route path="subscriptions" element={<ChefSubscriptionsPage />} />
                <Route path="party-orders" element={<ChefPartyOrdersPage />} />
                <Route path="earnings" element={<ChefEarningsPage />} />
                <Route path="growth" element={<ChefGrowthPage />} />
                <Route path="community" element={<ChefCommunityPage />} />
                <Route path="reviews" element={<ChefReviewsPage />} />
                <Route path="profile" element={<ChefProfilePage />} />
                <Route path="profile-settings" element={<ChefProfilePage />} />
                <Route path="settings" element={<ChefSettingsPage />} />
                <Route path="support" element={<ChefSupportPage />} />
                <Route path="invite" element={<ChefInvitePage />} />
                <Route path="growth-hub" element={<GrowthHubPage />} />
                <Route path="offers" element={<OffersCouponsPage />} />
                <Route path="promotions" element={<PromotionsPage />} />
                <Route path="plans" element={<ChefPlansPage />} />
                <Route path="marketing" element={<ChefMarketingPage />} />
              </Route>

              {/* Other Dashboards */}
              {/* Delivery Routes */}
              <Route path="/delivery-dashboard" element={<Navigate to="/delivery/dashboard" replace />} />
              <Route path="/delivery" element={<DeliveryLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DeliveryDashboardPage />} />
                <Route path="orders" element={<DeliveryOrdersPage />} />
                <Route path="earnings" element={<DeliveryEarningsPage />} />
                <Route path="profile" element={<DeliveryProfilePage />} />
                <Route path="notifications" element={<DeliveryNotificationsPage />} />
                <Route path="documents" element={<DeliveryDocumentsPage />} />
                <Route path="support" element={<DeliverySupportPage />} />
                <Route path="incentives" element={<DeliveryIncentivesPage />} />
              </Route>
              
              {/* Subadmin Routes */}

              {/* Subadmin Routes */}
            <Route path="/subadmin" element={<SubadminLayout />}>
              <Route index element={<SubadminDashboard />} />
              <Route path="orders" element={<SubadminOrders />} />
              <Route path="chefs" element={<SubadminChefs />} />
              <Route path="delivery" element={<SubadminDelivery />} />
              <Route path="customers" element={<SubadminCustomers />} />
              <Route path="promotions" element={<SubadminPromotions />} />
              <Route path="banners" element={<SubadminBanners />} />
              <Route path="coupons" element={<SubadminCoupons />} />
              <Route path="support" element={<SubadminSupport />} />
              <Route path="refunds" element={<SubadminRefunds />} />
              <Route path="analytics" element={<SubadminAnalytics />} />
              <Route path="profile" element={<SubadminProfile />} />
              <Route path="assigned-zones" element={<SubadminAssignedCity />} />
              <Route path="permissions" element={<SubadminPermissions />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="zones" element={<AdminZones />} />
              <Route path="subadmins" element={<AdminSubAdmins />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="chefs" element={<AdminChefs />} />
              <Route path="delivery" element={<AdminDelivery />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="refunds" element={<AdminRefunds />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="assigned-zones" element={<AdminAssignedCity />} />
              <Route path="permissions" element={<AdminPermissions />} />
              <Route path="city-settings" element={<AdminCitySettings />} />
            </Route>

              {/* Super-Admin Routes */}
              <Route path="/superadmin" element={<SuperadminLayout />}>
                <Route index element={<SuperadminDashboard />} />
                <Route path="cities" element={<SuperadminCities />} />
                <Route path="subadmins" element={<SuperadminSubAdmins />} />
                <Route path="verification" element={<SuperadminVerification />} />
                <Route path="audit-logs" element={<SuperadminAuditLogs />} />
                
                {/* Operations & Admin Phase 2 */}
                <Route path="orders" element={<SuperadminOrders />} />
                <Route path="chefs" element={<SuperadminChefs />} />
                <Route path="delivery" element={<SuperadminDelivery />} />
                <Route path="customers" element={<SuperadminCustomers />} />
                <Route path="support" element={<SuperadminSupport />} />
                
                {/* Generated Phase 2 Mockups */}
                <Route path="settings" element={<SuperadminSettings />} />
                <Route path="revenue" element={<SuperadminRevenue />} />
                <Route path="commissions" element={<SuperadminCommissions />} />
                <Route path="wallets" element={<SuperadminWallets />} />
                <Route path="payouts" element={<SuperadminPayouts />} />
                <Route path="refunds" element={<SuperadminRefunds />} />
                <Route path="taxes" element={<SuperadminTaxes />} />
                <Route path="promotions" element={<SuperadminPromotions />} />
                <Route path="coupons" element={<SuperadminCoupons />} />
                <Route path="banners" element={<SuperadminBanners />} />
                <Route path="campaigns" element={<SuperadminCampaigns />} />
                <Route path="featured" element={<SuperadminFeatured />} />
                <Route path="analytics/business" element={<SuperadminBusinessAnalytics />} />
                <Route path="analytics/city" element={<SuperadminCityAnalytics />} />
                <Route path="categories" element={<SuperadminCategories />} />
                <Route path="pages" element={<SuperadminPages />} />
                <Route path="system-health" element={<SuperadminSystemHealth />} />
                
                <Route path="*" element={<div className="sa-empty">Page under construction (Phase 2)</div>} />
              </Route>
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      {!hideGlobalNav && <Footer />}
    </div>
  );
}

export default App;
