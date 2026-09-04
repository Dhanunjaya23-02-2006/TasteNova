import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('userInfo');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (userData) => {
        // Map accessToken to token for frontend API compatibility
        const tokenToStore = userData.accessToken || userData.token;
        const refreshToStore = userData.refreshToken || null;
        const safeUserData = { ...userData, token: tokenToStore };
        delete safeUserData.accessToken;
        // Keep refreshToken in the stored data so api.js can use it
        safeUserData.refreshToken = refreshToStore;
        
        setUser(safeUserData);
        localStorage.setItem('userInfo', JSON.stringify(safeUserData));
    };

    const logout = async () => {
        try {
            const storedUser = localStorage.getItem('userInfo');
            const refreshToken = storedUser ? JSON.parse(storedUser).refreshToken : null;
            await fetch(`${API_URL}/auth/logout`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ refreshToken })
            });
        } catch (e) {
            // Logout API failure is non-critical; clear local state regardless
        }
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    useEffect(() => {
        const handleForceLogout = () => logout();
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, []);

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
