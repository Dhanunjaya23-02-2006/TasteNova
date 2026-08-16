import React from 'react';
import ChefSettings from '../../components/ChefSettings';
import { Thermometer } from 'lucide-react';

const ChefKitchenPage = () => {
    return (
        <div className="animate-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(39,174,96,0.1)', color: '#27ae60' }}>
                    <Thermometer size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Kitchen & Availability</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Manage your operating hours, capacity, and delivery radius.</p>
                </div>
            </div>
            <ChefSettings />
        </div>
    );
};

export default ChefKitchenPage;
