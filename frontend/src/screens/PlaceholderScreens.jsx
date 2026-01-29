import React from 'react';
import { motion } from 'framer-motion';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';

const ScreenContainer = ({ title, children, onHome }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-center"
        style={{
            flexDirection: 'column',
            height: '100%',
            padding: '20px',
            background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
            color: 'white',
            justifyContent: 'flex-start',
            paddingTop: '80px'
        }}
    >
        <div className="back-btn" onClick={onHome} style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 50
        }}>
            <ArrowLeft size={24} color="white" />
        </div>

        <h2 style={{ marginBottom: '20px' }}>{title}</h2>
        <div style={{
            width: '100%',
            padding: '20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {children}
        </div>
    </motion.div>
);

export const History = ({ onHome }) => (
    <ScreenContainer title="Transaction History" onHome={onHome}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Sent to Rohan</span>
                <span style={{ color: '#ef4444' }}>-₹500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Received from Dad</span>
                <span style={{ color: '#22c55e' }}>+₹2000</span>
            </div>
            <p style={{ marginTop: '20px', opacity: 0.5, fontSize: '0.9rem' }}>No more transactions.</p>
        </div>
    </ScreenContainer>
);

export const Insight = ({ onHome }) => (
    <ScreenContainer title="Financial Insights" onHome={onHome}>
        <p>You spent 20% less this month compared to last month!</p>
        <div style={{ marginTop: '20px', height: '100px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'end', justifyContent: 'space-around', paddingBottom: '10px' }}>
            <div style={{ width: '20px', height: '40%', background: '#3b82f6', borderRadius: '4px' }}></div>
            <div style={{ width: '20px', height: '60%', background: '#3b82f6', borderRadius: '4px' }}></div>
            <div style={{ width: '20px', height: '30%', background: '#3b82f6', borderRadius: '4px' }}></div>
            <div style={{ width: '20px', height: '80%', background: '#3b82f6', borderRadius: '4px' }}></div>
        </div>
    </ScreenContainer>
);

export const Settings = ({ onHome }) => (
    <ScreenContainer title="Settings" onHome={onHome}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>Change Language</div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>Security</div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>Help & Support</div>
        </div>
    </ScreenContainer>
);
