
import React from 'react';
import { motion } from 'framer-motion';

const TransferConfirm = ({ recipient, amount, onConfirm }) => {
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Confirm Transfer?</h2>

            <motion.div
                style={styles.card}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <p style={styles.label}>Sending to</p>
                <h3 style={styles.recipient}>{recipient || "Unknown"}</h3>

                <div style={styles.divider} />

                <p style={styles.label}>Amount</p>
                <h1 style={styles.amount}>${amount || "0"}</h1>
            </motion.div>

            <p style={styles.hint}>Say "Yes" to confirm</p>

            {/* Visual Button for fallback */}
            <motion.button
                style={styles.button}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
            >
                Confirm Transfer
            </motion.button>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '40px',
        color: '#1e293b',
    },
    card: {
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '320px',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        marginBottom: '40px',
    },
    label: {
        fontSize: '0.9rem',
        color: '#64748b',
        margin: 0,
        marginBottom: '8px',
    },
    recipient: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#0f172a',
        margin: 0,
        marginBottom: '24px',
    },
    divider: {
        height: '1px',
        backgroundColor: '#e2e8f0',
        margin: '0 20px 24px',
    },
    amount: {
        fontSize: '3rem',
        fontWeight: '700',
        color: '#0f172a',
        margin: 0,
    },
    hint: {
        color: '#64748b',
        marginBottom: '20px',
    },
    button: {
        backgroundColor: '#0ea5e9',
        color: 'white',
        padding: '16px 32px',
        borderRadius: '16px',
        border: 'none',
        fontSize: '1.1rem',
        fontWeight: '600',
        width: '100%',
        maxWidth: '320px',
        cursor: 'pointer',
    }
};

export default TransferConfirm;
