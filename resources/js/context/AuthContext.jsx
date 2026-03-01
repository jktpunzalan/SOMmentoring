import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '@/services/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const data = await authApi.getMe();
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (credentials) => {
        const data = await authApi.login(credentials);
        setUser(data.user);
        return data;
    };

    const register = async (formData) => {
        const data = await authApi.register(formData);
        return data;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        fetchUser,
        isAuthenticated: !!user,
        isMentor: user?.role === 'mentor',
        isMentee: user?.role === 'mentee',
        isSuperAdmin: user?.role === 'super_admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
