
import React from 'react';
import { motion } from 'framer-motion';

const BalanceResult = ({ balance = "1,250.00", onGoHome }) => {
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Your Balance</h2>

            <motion.div
                style={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={styles.amount}>${balance}</h1>
                <p style={styles.account}>Savings Account ••4582</p>
            </motion.div>

            <button style={styles.button} onClick={onGoHome}>
                Done
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
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#64748b',
        marginBottom: '32px',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        marginBottom: '60px',
        width: '80%',
        maxWidth: '350px',
    },
    amount: {
        fontSize: '3rem',
        fontWeight: '800',
        color: '#0f172a',
        margin: 0,
        marginBottom: '8px',
    },
    account: {
        color: '#94a3b8',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    button: {
        backgroundColor: 'transparent',
        color: '#64748b',
        border: '2px solid #e2e8f0',
        padding: '12px 32px',
        borderRadius: '30px',
        fontWeight: '600',
        cursor: 'pointer',
    }
};

export default BalanceResult;
