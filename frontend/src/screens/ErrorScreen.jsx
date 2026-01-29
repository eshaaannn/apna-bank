import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const ErrorScreen = ({ onRetry }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', padding: '30px', backgroundColor: '#fef2f2' }}
        >
            <div
                style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)'
                }}
            >
                <AlertCircle size={40} color="white" />
            </div>

            <h2 style={{ color: '#991b1b', marginBottom: '10px' }}>Something went wrong</h2>
            <p style={{ textAlign: 'center', color: '#b91c1c' }}>
                We couldn't assume that. Please try again.
            </p>

            <button
                onClick={onRetry}
                className="card"
                style={{
                    marginTop: '40px',
                    padding: '15px 40px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#991b1b'
                }}
            >
                Try Again
            </button>
        </motion.div>
    );
};

export default ErrorScreen;
