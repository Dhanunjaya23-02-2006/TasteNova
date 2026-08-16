import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
    Shield, CheckCircle, XCircle, ChefHat, Users, Truck, Tag, 
    Image, Ticket, MessageCircle, RotateCcw, BarChart3, ShoppingBag, 
    CreditCard, Bell, Settings 
} from 'lucide-react';

const permissionCategories = [
    {
        title: 'Chef Management',
        icon: ChefHat,
        color: '#2ecc71',
        permissions: [
            { label: 'View all chefs in assigned city', granted: true },
            { label: 'Approve or reject new chef registrations', granted: true },
            { label: 'Suspend or reactivate chef accounts', granted: true },
            { label: 'View chef verification documents', granted: true },
            { label: 'Override chef commission rates', granted: false },
            { label: 'Delete chef accounts permanently', granted: false },
        ]
    },
    {
        title: 'Order Management',
        icon: ShoppingBag,
        color: '#3498db',
        permissions: [
            { label: 'View all orders in assigned city', granted: true },
            { label: 'Cancel active orders', granted: true },
            { label: 'View order payment details', granted: true },
            { label: 'Reassign delivery partners', granted: true },
            { label: 'Issue manual refunds above threshold', granted: false },
            { label: 'Modify order amounts after placement', granted: false },
        ]
    },
    {
        title: 'Customer Management',
        icon: Users,
        color: '#9b59b6',
        permissions: [
            { label: 'View customer profiles and order history', granted: true },
            { label: 'Suspend customer accounts', granted: true },
            { label: 'View customer support tickets', granted: true },
            { label: 'Delete customer accounts', granted: false },
            { label: 'Access customer payment methods', granted: false },
        ]
    },
    {
        title: 'Delivery Partners',
        icon: Truck,
        color: '#e67e22',
        permissions: [
            { label: 'View delivery partners in assigned city', granted: true },
            { label: 'Verify or reject delivery registrations', granted: true },
            { label: 'Suspend delivery partner accounts', granted: true },
            { label: 'View live delivery tracking', granted: true },
            { label: 'Modify delivery partner payouts', granted: false },
        ]
    },
    {
        title: 'Promotions & Marketing',
        icon: Tag,
        color: '#e74c3c',
        permissions: [
            { label: 'Create city-specific promotions', granted: true },
            { label: 'Create and manage coupons', granted: true },
            { label: 'Manage city banners', granted: true },
            { label: 'Set promotion budgets above ₹5,000', granted: false },
            { label: 'Create platform-wide promotions', granted: false },
        ]
    },
    {
        title: 'Support & Refunds',
        icon: MessageCircle,
        color: '#1abc9c',
        permissions: [
            { label: 'View and manage support tickets', granted: true },
            { label: 'Assign tickets to team members', granted: true },
            { label: 'Approve refunds within threshold', granted: true },
            { label: 'Escalate refunds to Super Admin', granted: true },
            { label: 'Override refund threshold limits', granted: false },
        ]
    },
    {
        title: 'Analytics & Reports',
        icon: BarChart3,
        color: '#2980b9',
        permissions: [
            { label: 'View city-level analytics dashboard', granted: true },
            { label: 'View revenue and order reports', granted: true },
            { label: 'View top performing chefs', granted: true },
            { label: 'Export data as CSV/PDF', granted: false },
            { label: 'Access platform-wide analytics', granted: false },
        ]
    },
    {
        title: 'Platform Settings',
        icon: Settings,
        color: '#7f8c8d',
        permissions: [
            { label: 'View city configuration', granted: true },
            { label: 'Modify delivery fees or zones', granted: true },
            { label: 'Change commission rates', granted: true },
            { label: 'Manage other sub-admins', granted: true },
            { label: 'Access system health and logs', granted: false },
        ]
    },
];

const AdminPermissions = () => {
    const { user } = useContext(AuthContext);

    const totalGranted = permissionCategories.reduce((acc, cat) => acc + cat.permissions.filter(p => p.granted).length, 0);
    const totalPermissions = permissionCategories.reduce((acc, cat) => acc + cat.permissions.length, 0);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Permissions</h1>
            </div>

            {/* Summary card */}
            <div className="sa-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={32} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem' }}>
                        {user.name}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Role: <strong style={{ color: 'var(--primary)' }}>City Sub-Admin</strong>
                    </div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>{totalGranted}/{totalPermissions}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Permissions</div>
                </div>
            </div>

            {/* Permission Categories */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {permissionCategories.map((category, idx) => (
                    <div key={idx} className="sa-card" style={{ padding: '0', overflow: 'hidden' }}>
                        {/* Category header */}
                        <div style={{
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            borderBottom: '1px solid var(--border-subtle)',
                            background: 'var(--bg-dark)'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: `${category.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <category.icon size={20} style={{ color: category.color }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{category.title}</h3>
                            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {category.permissions.filter(p => p.granted).length}/{category.permissions.length} granted
                            </div>
                        </div>

                        {/* Permission items */}
                        <div style={{ padding: '4px 0' }}>
                            {category.permissions.map((perm, pIdx) => (
                                <div 
                                    key={pIdx} 
                                    style={{
                                        padding: '10px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        borderBottom: pIdx < category.permissions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                        opacity: perm.granted ? 1 : 0.5,
                                        transition: 'background 0.15s'
                                    }}
                                >
                                    {perm.granted ? (
                                        <CheckCircle size={18} style={{ color: '#2ecc71', flexShrink: 0 }} />
                                    ) : (
                                        <XCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
                                    )}
                                    <span style={{ 
                                        fontSize: '0.9rem', 
                                        color: perm.granted ? 'var(--text-main)' : 'var(--text-muted)',
                                        textDecoration: perm.granted ? 'none' : 'line-through'
                                    }}>
                                        {perm.label}
                                    </span>
                                    <span style={{
                                        marginLeft: 'auto',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: perm.granted ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                                        color: perm.granted ? '#2ecc71' : 'var(--error)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                        flexShrink: 0
                                    }}>
                                        {perm.granted ? 'Granted' : 'Denied'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Permissions are managed by your Super Admin. Contact them to request changes.
            </div>
        </div>
    );
};

export default AdminPermissions;
