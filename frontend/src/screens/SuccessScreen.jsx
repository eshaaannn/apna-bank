import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const SuccessScreen = ({ onHome }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', padding: '30px', backgroundColor: '#f0fdf4' }}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '30px',
                    boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)'
                }}
            >
                <Check size={50} color="white" strokeWidth={3} />
            </motion.div>

            <h2 style={{ color: '#166534', marginBottom: '10px' }}>Transfer Successful!</h2>
            <p style={{ textAlign: 'center', color: '#15803d' }}>
                Money has been sent securely.
            </p>

            <button
                onClick={onHome}
                className="card"
                style={{
                    marginTop: '50px',
                    padding: '15px 40px',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: '#166534',
                    backgroundColor: '#ffffff'
                }}
            >
                Go Home
            </button>

        </motion.div>
    );
};

export default SuccessScreen;
