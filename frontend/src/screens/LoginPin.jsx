import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';

const LoginPin = ({ onVerify, onBack }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(null);

    const handlePinInput = (num) => {
        if (pin.length < 6) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 6) {
                onVerify(newPin);
            }
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
        setError(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', padding: '30px', justifyContent: 'center' }}
        >
            <div className="back-btn" onClick={onBack}>
                <ArrowLeft size={24} color="white" />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ marginBottom: '10px' }}>Enter Secure PIN</h1>
                <p>Please enter your 6-digit login PIN</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: '45px',
                            height: '55px',
                            borderRadius: '12px',
                            border: `2px solid ${pin.length > i ? '#4f46e5' : '#334155'}`,
                            background: pin.length > i ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        {pin.length > i ? '●' : ''}
                    </div>
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                width: '100%',
                maxWidth: '280px'
            }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <motion.button
                        key={num}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePinInput(num.toString())}
                        style={{
                            height: '60px',
                            borderRadius: '50%',
                            background: '#1e293b',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {num}
                    </motion.button>
                ))}
                <div />
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePinInput('0')}
                    style={{
                        height: '60px',
                        borderRadius: '50%',
                        background: '#1e293b',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    0
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBackspace}
                    style={{
                        height: '60px',
                        borderRadius: '50%',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    DEL
                </motion.button>
            </div>

            <p style={{ marginTop: '30px', opacity: 0.7, fontSize: '0.9rem' }}>
                Hint: Demo PIN is usually 123456
            </p>
        </motion.div>
    );
};

export default LoginPin;
