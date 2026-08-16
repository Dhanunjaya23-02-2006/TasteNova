import React from 'react';
import MenuTab from '../../components/chef/MenuTab';

const ChefMenuPage = () => {
    return (
        <div className="animate-fade-up">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>Menu Management</h1>
            <MenuTab />
        </div>
    );
};

export default ChefMenuPage;
