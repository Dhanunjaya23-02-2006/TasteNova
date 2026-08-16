import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import ChefGrowth from '../../components/ChefGrowth';

const ChefGrowthPage = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/orders/chef/stats`, { headers: { Authorization: `Bearer ${user.token}` } });
                if (res.ok) setStats(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchStats();
    }, [user]);

    return (
        <div className="animate-fade-up">
            <ChefGrowth stats={stats} />
        </div>
    );
};

export default ChefGrowthPage;
