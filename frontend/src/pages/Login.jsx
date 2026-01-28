
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLogin } from '../auth/useLogin';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { login, loading, error } = useLogin();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
        // AuthContext will update user, triggering PrivateRoute redirect
        // But we can also manually navigate if needed, though usually context update is enough
        navigate('/');
    };

    return (
        <div className="flex bg-[#0f172a] min-h-screen w-full flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="auth-card"
            >
                <h1 className="text-3xl font-bold mb-8 text-white">Bank Login</h1>

                {error && (
                    <div className="bg-red-500 text-white p-3 rounded mb-4 w-full text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mb-4"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mb-8"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="primary-btn"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
