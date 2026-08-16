import React from 'react';
import ChefPlans from '../../components/ChefPlans';

const ChefSubscriptionsPage = () => {
    return (
        <div className="animate-fade-up">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>Subscriptions & Plans</h1>
            <ChefPlans />
        </div>
    );
};

export default ChefSubscriptionsPage;
