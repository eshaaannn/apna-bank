import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowLeft } from 'lucide-react';

const BalanceResult = ({ onHome, balance }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', padding: '30px', paddingTop: '80px', justifyContent: 'flex-start' }}
        >
            <div className="back-btn" onClick={onHome} style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 50
            }}>
                <ArrowLeft size={24} color="white" />
            </div>

            <div className="card" style={{ width: '100%', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '50%' }}>
                    <Wallet size={40} color="#3b82f6" />
                </div>

                <div className="text-center">
                    <p style={{ margin: 0, fontSize: '1rem' }}>Total Balance</p>
                    <h1 style={{ margin: '10px 0', fontSize: '3rem', color: '#1e293b' }}>₹{balance && balance.toLocaleString()}</h1>
                </div>
            </div>
        </motion.div>
    );
};

export default BalanceResult;
