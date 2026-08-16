import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
import { AuthContext } from './AuthContext';

export const SuperadminSocketContext = createContext();

export const SuperadminSocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'superadmin') return;

        const newSocket = io(API_URL.replace('/api', ''), {
            auth: { token: user.token }
        });

        const triggerRefresh = () => {
            setLastUpdated(Date.now());
        };

        // Listen for all events that should cause superadmin data to refresh
        newSocket.on('new_order_alert', triggerRefresh);
        newSocket.on('order_status_update', triggerRefresh);
        newSocket.on('city_updated', triggerRefresh);
        newSocket.on('city_deleted', triggerRefresh);
        newSocket.on('superadmin_refresh', triggerRefresh);

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user]);

    return (
        <SuperadminSocketContext.Provider value={{ lastUpdated, socket }}>
            {children}
        </SuperadminSocketContext.Provider>
    );
};
