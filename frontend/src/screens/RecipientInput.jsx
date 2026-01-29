import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const RecipientInput = ({ onSelect, onBack }) => {
    const contacts = [
        { name: 'Mom', id: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom' },
        { name: 'Rahul', id: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
        { name: 'Shop', id: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shop' },
    ];

    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', padding: '20px', justifyContent: 'flex-start', paddingTop: '80px' }}
        >
            <div className="back-btn" onClick={onBack}>
                <ArrowLeft size={24} color="#1e293b" />
            </div>

            <h2 className="text-center" style={{ marginBottom: '40px' }}>Who are you sending to?</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
                {contacts.map((contact, index) => (
                    <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="card flex-center"
                        style={{ flexDirection: 'column', gap: '10px', padding: '20px', cursor: 'pointer', border: 'none' }}
                        onClick={() => onSelect(contact.name)}
                    >
                        <img
                            src={contact.avatar}
                            alt={contact.name}
                            style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9' }}
                        />
                        <span style={{ fontWeight: 600 }}>{contact.name}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default RecipientInput;
