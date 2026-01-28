
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useLogin() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await login(email, password);
            if (error) throw error;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { login: handleLogin, loading, error };
}
