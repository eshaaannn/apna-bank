import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react';

const Login = ({ onRegisterClick }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // For MVP/Demo: Allow explicit simple login or use mock
        // If email/pass is empty, we act as a "Quick Login" for demo
        const { error } = await login(email || 'demo@example.com', password || 'demo');

        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // Success will filter down from Context
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', padding: '30px', justifyContent: 'center' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>VB</span>
                </div>
                <h1 style={{ marginBottom: '10px' }}>Welcome Back</h1>
                <p>Sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%', gap: '20px', display: 'flex', flexDirection: 'column' }}>

                <div className="card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <User size={20} color="#94a3b8" />
                    <input
                        type="email"
                        placeholder="Email ID"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '1rem', padding: '10px 0' }}
                    />
                </div>

                <div className="card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Lock size={20} color="#94a3b8" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '1rem', padding: '10px 0' }}
                    />
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="action-btn"
                    style={{ width: '100%', marginTop: '10px', fontSize: '1.1rem', cursor: 'pointer' }}
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </motion.button>
            </form>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Don't have an account?</p>
                <button
                    onClick={onRegisterClick}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', marginTop: '5px', cursor: 'pointer', fontSize: '1rem' }}
                >
                    Create Account
                </button>
            </div>
        </motion.div>
    );
};

export default Login;
