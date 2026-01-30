import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, ArrowRight } from 'lucide-react';

const Register = ({ onLoginClick }) => {
    const { signUp } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: signUpError } = await signUp(email, password, name);
            if (signUpError) {
                setError(signUpError.message);
            } else {
                // Supabase might require email confirmation. 
                // In many hackathon configs, it logs you in immediately.
                console.log("Signup successful!");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', padding: '30px', justifyContent: 'center' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ marginBottom: '10px' }}>Create Account</h1>
                <p>Join Voice Bank today</p>
                {error && <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '0.9rem' }}>{error}</p>}
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%', gap: '15px', display: 'flex', flexDirection: 'column' }}>

                <div className="card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <User size={20} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '1rem', padding: '10px 0' }}
                    />
                </div>

                <div className="card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Mail size={20} color="#94a3b8" />
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

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="action-btn"
                    style={{ width: '100%', marginTop: '10px', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Sign Up'} <ArrowRight size={20} />
                </motion.button>
            </form>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Already have an account?</p>
                <button
                    onClick={onLoginClick}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', marginTop: '5px', cursor: 'pointer', fontSize: '1rem' }}
                >
                    Sign In
                </button>
            </div>
        </motion.div>
    );
};

export default Register;
