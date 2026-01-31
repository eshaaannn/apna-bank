import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, ArrowRight } from 'lucide-react';

const Register = ({ onLoginClick }) => {
    const { signUp } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loginPin, setLoginPin] = useState('');
    const [transferPin, setTransferPin] = useState('');
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
                // Setup Profile and PINs via backend
                const { setupPin } = await import('../api/bankingApi');

                // If we had a direct updateProfile we'd use it, for now we can assume 
                // the first setup-pin call or a separate update will sync the phone.
                // Let's refine the sync_user logic on backend to handle this or add an endpoint.
                if (loginPin) await setupPin(loginPin, 'login', phone);
                if (transferPin) await setupPin(transferPin, 'transfer', phone);

                // Add phone update if needed - for now we'll ensure backend sync_user can get it 
                // but since signUp is Supabase client side, we might need a profile update.
                console.log("Signup and PIN setup successful!");
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
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>+91</div>
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="card" style={{ padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="6-digit Login PIN"
                            value={loginPin}
                            onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '0.9rem', padding: '10px 0' }}
                        />
                    </div>
                    <div className="card" style={{ padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <input
                            type="text"
                            maxLength={4}
                            placeholder="4-digit Trans PIN"
                            value={transferPin}
                            onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
                            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '0.9rem', padding: '10px 0' }}
                        />
                    </div>
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
