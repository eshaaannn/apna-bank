import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const TransferConfirm = ({ amount, recipient, onBack }) => {
    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', padding: '30px', paddingTop: '80px', justifyContent: 'flex-start' }}
        >
            <div className="back-btn" onClick={onBack}>
                <ArrowLeft size={24} color="white" />
            </div>

            <h2 style={{ marginBottom: '40px' }}>Confirm Transfer</h2>

            <div className="card" style={{ width: '100%', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', background: 'white' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '-2px' }}>
                    ₹{amount}
                </div>

                <div style={{ width: '100%', height: '1px', background: '#e2e8f0' }}></div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', marginBottom: '5px' }}>Sending to</p>
                    <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>{recipient}</h3>
                </div>
            </div>

            <div style={{ marginTop: 'auto', marginBottom: '100px', textAlign: 'center', opacity: 0.8 }}>
                <p>Say <strong>"Yes"</strong> to confirm</p>
                <p>Say <strong>"No"</strong> to cancel</p>
            </div>
        </motion.div>
    );
};

export default TransferConfirm;
