import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, MapPin, Tag, ShieldAlert, 
    Settings, DollarSign, TrendingUp, ShoppingBag, 
    Truck, Megaphone, BarChart, ChevronRight, UserCog, UserCircle, ChefHat
} from 'lucide-react';
import { API_URL } from '../config';
import CommissionsTab from '../components/superadmin/CommissionsTab';
import RevenueTab from '../components/superadmin/RevenueTab';
import { PayoutsTab, TaxesTab } from '../components/superadmin/FinanceExtras';
import BannersTab from '../components/superadmin/BannersTab';
import NotificationsTab from '../components/superadmin/NotificationsTab';
import { PlatformSettingsTab } from '../components/superadmin/PlatformSettingsTab';
import { AnalyticsTab } from '../components/superadmin/AnalyticsTab';

const OverviewTab = lazy(() => import('../components/superadmin/OverviewTab'));
const CitiesTab = lazy(() => import('../components/superadmin/CitiesTab'));
const OffersTab = lazy(() => import('../components/superadmin/OffersTab'));
const RefundsTab = lazy(() => import('../components/superadmin/RefundsTab'));
const SubadminsTab = lazy(() => import('../components/superadmin/SubadminsTab'));
const ChefsTab = lazy(() => import('../components/superadmin/ChefsTab'));
const CustomersTab = lazy(() => import('../components/superadmin/CustomersTab'));
const DeliveryTab = lazy(() => import('../components/superadmin/DeliveryTab'));
const GlobalOrdersTab = lazy(() => import('../components/superadmin/GlobalOrdersTab'));

const SIDEBAR_SECTIONS = [
    {
        title: 'Platform',
        icon: LayoutDashboard,
        items: [
            { id: 'overview', label: 'Overview' },
            { id: 'settings', label: 'Platform Settings' },
            { id: 'reports', label: 'Reports & Analytics' }
        ]
    },
    {
        title: 'User Management',
        icon: Users,
        items: [
            { id: 'subadmins', label: 'Sub-admins' },
            { id: 'chefs', label: 'Chefs' },
            { id: 'delivery', label: 'Delivery Partners' },
            { id: 'customers', label: 'Customers' }
        ]
    },
    {
        title: 'Orders',
        icon: ShoppingBag,
        items: [
            { id: 'all_orders', label: 'Global Stream' },
            { id: 'refunds', label: 'Escalated Refunds' }
        ]
    },
    {
        title: 'Finance',
        icon: DollarSign,
        items: [
            { id: 'revenue', label: 'Revenue' },
            { id: 'commissions', label: 'Commission Settings' },
            { id: 'payouts', label: 'Payouts' },
            { id: 'taxes', label: 'Taxes' }
        ]
    },
    {
        title: 'Marketing',
        icon: Megaphone,
        items: [
            { id: 'offers', label: 'Global Promos' },
            { id: 'banners', label: 'Banners' },
            { id: 'campaigns', label: 'Campaigns' }
        ]
    }
];

const SuperadminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Data State
    const [cities, setCities] = useState([]);
    const [offers, setOffers] = useState([]);
    const [escalatedRefunds, setEscalatedRefunds] = useState([]);
    const [managementData, setManagementData] = useState({ users: [], chefs: [], delivery: [], admins: [] });
    const [globalOrders, setGlobalOrders] = useState([]);

    // Forms
    const [cityData, setCityData] = useState({ name: '', state: '', deliveryRadius: 10 });
    const [offerData, setOfferData] = useState({ code: '', description: '', discountPercentage: 15, maxDiscountAmount: 200, validUntil: '' });
    const [editRoleModal, setEditRoleModal] = useState(null);
    const [showAddSubadminModal, setShowAddSubadminModal] = useState(false);
    const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '', role: 'admin', cityId: '', isApproved: true });

    useEffect(() => {
        if (!user || user.role !== 'superadmin') {
            navigate('/login');
            return;
        }
        if (['cities', 'subadmins'].includes(activeTab)) fetchCities();
        else if (activeTab === 'offers') fetchOffers();
        else if (activeTab === 'refunds') fetchEscalatedRefunds();
        else if (activeTab === 'all_orders') fetchGlobalOrders();
        else if (['overview', 'subadmins', 'chefs', 'delivery', 'customers'].includes(activeTab)) fetchManagementData();
    }, [user, activeTab, navigate]);

    // --- FETCHERS ---
    const fetchGlobalOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/orders`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setGlobalOrders(await res.json());
        } catch (error) { console.error(error); }
    };
    const fetchManagementData = async () => {
        try {
            const res = await fetch(`${API_URL}/users/all-management`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setManagementData(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchCities = async () => {
        try {
            const res = await fetch(`${API_URL}/cities?all=true`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setCities(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchOffers = async () => {
        try {
            const res = await fetch(`${API_URL}/offers`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setOffers(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchEscalatedRefunds = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) {
                const allOrders = await res.json();
                setEscalatedRefunds(allOrders.filter(o => o.refundStatus === 'Escalated'));
            }
        } catch (error) { console.error(error); }
    };

    // --- ACTIONS ---
    const handleAddCity = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/cities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(cityData)
            });
            if (res.ok) {
                toast.success('City Added!');
                fetchCities();
                setCityData({ name: '', state: '', deliveryRadius: 10 });
            } else {
                toast.error('Failed to add city');
            }
        } catch (error) { toast.error('Error adding city'); }
    };

    const handleCreateGlobalOffer = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/offers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ ...offerData, scope: 'Global' })
            });
            if (res.ok) {
                toast.success('Global Offer Created!');
                fetchOffers();
                setOfferData({ code: '', description: '', discountPercentage: 15, maxDiscountAmount: 200, validUntil: '' });
            } else {
                toast.error('Failed to create offer');
            }
        } catch (error) { toast.error('Error creating offer'); }
    };

    const handleApproveRefund = async (orderId, amount) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/refund`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ amount })
            });
            if (res.ok) {
                toast.success('High-Value Refund Approved!');
                fetchEscalatedRefunds();
            } else {
                toast.error('Failed to approve refund');
            }
        } catch (error) { toast.error('Error approving refund'); }
    };

    if (!user || user.role !== 'superadmin') return <div>Securing Access...</div>;

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', background: 'var(--bg-body)' }}>
            
            {/* SIDEBAR */}
            <div style={{ 
                width: '280px', 
                background: 'var(--bg-surface)', 
                borderRight: '1px solid var(--border-subtle)',
                padding: '24px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                position: 'sticky',
                top: '80px',
                height: 'calc(100vh - 80px)',
                overflowY: 'auto'
            }}>
                <div style={{ padding: '0 24px', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LayoutDashboard size={20} /> Global HQ
                    </h3>
                </div>

                {SIDEBAR_SECTIONS.map((section, idx) => (
                    <div key={idx} style={{ padding: '0 12px' }}>
                        <div style={{ padding: '0 12px', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <section.icon size={12} /> {section.title}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {section.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 12px',
                                        background: activeTab === item.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                        color: activeTab === item.id ? 'var(--primary)' : 'var(--text-main)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontSize: '0.95rem',
                                        fontWeight: activeTab === item.id ? 'bold' : 'normal',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    }}
                                    onMouseOut={(e) => {
                                        if (activeTab !== item.id) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span>{item.label}</span>
                                    {item.id === 'refunds' && escalatedRefunds.length > 0 && (
                                        <span style={{ background: 'var(--error)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                            {escalatedRefunds.length}
                                        </span>
                                    )}
                                    {activeTab === item.id && <ChevronRight size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                    
                    {/* Placeholder for unimplemented tabs */}
                    {!['overview', 'cities', 'offers', 'refunds', 'subadmins', 'chefs', 'delivery', 'customers', 'all_orders', 'commissions', 'revenue', 'payouts', 'taxes', 'banners', 'push', 'settings', 'reports'].includes(activeTab) && (
                        <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center" style={{ padding: '100px 0' }}>
                            <Settings size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                            <h3 style={{ color: 'var(--text-muted)' }}>Module In Development</h3>
                            <p style={{ color: 'var(--text-muted)' }}>This section of the ERP is currently being built in this phase.</p>
                        </motion.div>
                    )}

                    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Tab...</div>}>
                        {activeTab === 'overview' && <OverviewTab managementData={managementData} />}
                        {activeTab === 'cities' && <CitiesTab cities={cities} cityData={cityData} setCityData={setCityData} handleAddCity={handleAddCity} />}
                        {activeTab === 'offers' && <OffersTab offers={offers} offerData={offerData} setOfferData={setOfferData} handleCreateGlobalOffer={handleCreateGlobalOffer} />}
                        {activeTab === 'refunds' && <RefundsTab escalatedRefunds={escalatedRefunds} handleApproveRefund={handleApproveRefund} />}
                        {activeTab === 'subadmins' && <SubadminsTab managementData={managementData} cities={cities} user={user} setShowAddSubadminModal={setShowAddSubadminModal} showAddSubadminModal={showAddSubadminModal} newAdminData={newAdminData} setNewAdminData={setNewAdminData} setEditRoleModal={setEditRoleModal} fetchManagementData={fetchManagementData} />}
                        {activeTab === 'chefs' && <ChefsTab managementData={managementData} setEditRoleModal={setEditRoleModal} />}
                        {activeTab === 'customers' && <CustomersTab managementData={managementData} />}
                        {activeTab === 'delivery' && <DeliveryTab managementData={managementData} />}
                        {activeTab === 'all_orders' && <GlobalOrdersTab globalOrders={globalOrders} user={user} fetchGlobalOrders={fetchGlobalOrders} />}
                    </Suspense>

                    {activeTab === 'commissions' && <CommissionsTab user={user} key="commissions" />}
                    {activeTab === 'revenue' && <RevenueTab user={user} key="revenue" />}
                    {activeTab === 'payouts' && <PayoutsTab user={user} key="payouts" />}
                    {activeTab === 'taxes' && <TaxesTab key="taxes" />}
                    {activeTab === 'banners' && <BannersTab user={user} key="banners" />}
                    {activeTab === 'push' && <NotificationsTab user={user} key="push" />}
                    {activeTab === 'settings' && <PlatformSettingsTab user={user} key="settings" />}
                    {activeTab === 'reports' && <AnalyticsTab user={user} key="reports" />}

                </AnimatePresence>

                {editRoleModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                        <div className="glass-panel" style={{ padding: '30px', width: '400px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ marginBottom: '20px' }}>Edit User: {editRoleModal.name}</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const cityId = typeof editRoleModal.city === 'object' ? editRoleModal.city?._id : editRoleModal.city;
                                    const res = await fetch(`${API_URL}/superadmin/users/${editRoleModal._id}/role`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                        body: JSON.stringify({
                                            role: editRoleModal.role,
                                            cityId: cityId || null,
                                            status: editRoleModal.status || 'pending'
                                        })
                                    });
                                    if (res.ok) {
                                        toast.success('User updated successfully');
                                        setEditRoleModal(null);
                                        fetchManagementData();
                                    } else {
                                        toast.error('Failed to update user');
                                    }
                                } catch(err) {
                                    toast.error('Network error');
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="input-group">
                                    <label>Role</label>
                                    <select className="form-control" value={editRoleModal.role} onChange={e => setEditRoleModal({...editRoleModal, role: e.target.value})}>
                                        <option value="user">User</option>
                                        <option value="chef">Chef</option>
                                        <option value="delivery">Delivery</option>
                                        <option value="subadmin">Sub-admin</option>
                                        <option value="admin">City Admin</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </div>
                                
                                <div className="input-group">
                                    <label>City Scope (Location)</label>
                                    <select className="form-control" value={(typeof editRoleModal.city === 'object' ? editRoleModal.city?._id : editRoleModal.city) || ''} onChange={e => setEditRoleModal({...editRoleModal, city: e.target.value})}>
                                        <option value="">-- Unassigned --</option>
                                        {cities.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}, {c.state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" checked={editRoleModal.status === 'active'} onChange={e => setEditRoleModal({...editRoleModal, status: e.target.checked ? 'active' : 'pending'})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                    <label style={{ margin: 0, cursor: 'pointer' }} onClick={() => setEditRoleModal({...editRoleModal, status: editRoleModal.status === 'active' ? 'pending' : 'active'})}>Is Approved (Active)</label>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setEditRoleModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperadminDashboard;
