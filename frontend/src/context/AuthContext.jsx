
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from '../api/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isConfigured || !supabase) {
            setLoading(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        if (!isConfigured) {
            // Mock Login for demo if config missing (optional, or just fail)
            console.warn("Supabase not configured. Mocking login.");
            setUser({ email, id: 'mock-user-id' });
            return { error: null };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return { error };
        return { data };
    };

    const logout = async () => {
        if (!isConfigured) {
            setUser(null);
            return;
        }
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isConfigured }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
