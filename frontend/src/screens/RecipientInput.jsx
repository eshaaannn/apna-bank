
import React from 'react';
import { motion } from 'framer-motion';

const RecipientInput = ({ transcript }) => {
    const contacts = [
        { name: "Mom", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom" },
        { name: "Rahul", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
        { name: "Sarah", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    ];

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Who do you want to send money to?</h2>

            <div style={styles.grid}>
                {contacts.map((contact) => (
                    <motion.div
                        key={contact.name}
                        style={styles.card}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <img src={contact.image} alt={contact.name} style={styles.image} />
                        <p style={styles.name}>{contact.name}</p>
                    </motion.div>
                ))}
            </div>

            {transcript && (
                <div style={styles.transcriptBox}>
                    <p>Listening: "{transcript}"</p>
                </div>
            )}
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
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: '40px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        width: '100%',
        maxWidth: '400px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    },
    image: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        marginBottom: '12px',
        backgroundColor: '#e2e8f0',
    },
    name: {
        fontSize: '1.1rem',
        fontWeight: '500',
        color: '#334155',
        margin: 0,
    },
    transcriptBox: {
        marginTop: 'auto',
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        marginBottom: '20px'
    }
};

export default RecipientInput;
