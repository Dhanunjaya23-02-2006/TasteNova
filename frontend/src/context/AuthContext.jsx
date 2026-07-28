import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('userInfo');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // useEffect is no longer needed for initial re-hydration as it's handled in useState

    const login = (userData) => {
        // Map accessToken to token for frontend API compatibility
        const tokenToStore = userData.accessToken || userData.token;
        const safeUserData = { ...userData, token: tokenToStore };
        delete safeUserData.accessToken;
        delete safeUserData.refreshToken;
        
        setUser(safeUserData);
        localStorage.setItem('userInfo', JSON.stringify(safeUserData));
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, { 
                method: 'POST',
                credentials: 'omit' // or use api.post('/auth/logout') if imported
            });
        } catch (e) {
            console.error(e);
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
