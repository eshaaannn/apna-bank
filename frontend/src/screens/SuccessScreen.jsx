
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const SuccessScreen = ({ onGoHome }) => {
    return (
        <div style={styles.container}>
            <motion.div
                style={styles.circle}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                <Check size={64} color="white" strokeWidth={3} />
            </motion.div>

            <motion.h2
                style={styles.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Transfer Complete!
            </motion.h2>

            <motion.button
                style={styles.button}
                whileTap={{ scale: 0.95 }}
                onClick={onGoHome}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Go Home
            </motion.button>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    circle: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: '#22c55e', // Green 500
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
        boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '60px',
    },
    button: {
        backgroundColor: '#0f172a', // Slate 900
        color: 'white',
        padding: '16px 48px',
        borderRadius: '16px',
        border: 'none',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        width: '80%',
        maxWidth: '300px',
    }
};

export default SuccessScreen;
