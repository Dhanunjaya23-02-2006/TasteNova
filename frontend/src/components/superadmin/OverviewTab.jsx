import React from 'react';
import { motion } from 'framer-motion';
import { UserCog, ChefHat, UserCircle, Truck } from 'lucide-react';

const OverviewTab = ({ managementData }) => {
    return (
        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                    <UserCog size={32} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                    <h3>{managementData.admins?.length || 0}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sub-admins</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                    <ChefHat size={32} style={{ color: 'var(--success)', marginBottom: '10px' }} />
                    <h3>{managementData.chefs?.length || 0}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Active Chefs</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                    <UserCircle size={32} style={{ color: 'var(--info)', marginBottom: '10px' }} />
                    <h3>{managementData.users?.length || 0}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Total Customers</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                    <Truck size={32} style={{ color: 'var(--warning)', marginBottom: '10px' }} />
                    <h3>{managementData.delivery?.length || 0}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Delivery Partners</p>
                </div>
            </div>
        </motion.div>
    );
};

export default OverviewTab;
