
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const ErrorScreen = ({ onRetry }) => {
    return (
        <div style={styles.container}>
            <motion.div
                style={styles.iconContainer}
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
            >
                <AlertCircle size={80} color="#ef4444" />
            </motion.div>

            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.subtitle}>we couldn't process your request.</p>

            <button style={styles.button} onClick={onRetry}>
                Try Again
            </button>
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
        backgroundColor: '#fef2f2',
    },
    iconContainer: {
        marginBottom: '24px',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#991b1b',
        marginBottom: '8px',
    },
    subtitle: {
        color: '#b91c1c',
        marginBottom: '40px',
    },
    button: {
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '16px 32px',
        borderRadius: '12px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
    }
};

export default ErrorScreen;
