import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const TransferConfirm = ({ amount, recipient, onBack, onConfirm }) => {
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

            <div className="card" style={{ width: '100%', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', background: 'white' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '-1px' }}>
                    ₹{amount}
                </div>

                <div style={{ width: '100%', height: '1px', background: '#f1f5f9' }}></div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {recipient ? 'Sending to' : 'Paying Bill'}
                    </p>
                    <h3 style={{ margin: '5px 0', fontSize: '1.5rem', color: '#0f172a' }}>
                        {recipient || 'Utility Payment'}
                    </h3>
                    {recipient && <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Verified Account</p>}
                </div>
            </div>

            <button
                onClick={onConfirm}
                style={{
                    marginTop: '40px',
                    width: '100%',
                    padding: '15px',
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                }}
            >
                Confirm Transfer
            </button>

            <div style={{ marginTop: 'auto', marginBottom: '100px', textAlign: 'center', opacity: 0.8 }}>
                <p>Say <strong>"Yes"</strong> to confirm</p>
                <p>Say <strong>"No"</strong> to cancel</p>
            </div>
        </motion.div>
    );
};

export default TransferConfirm;
