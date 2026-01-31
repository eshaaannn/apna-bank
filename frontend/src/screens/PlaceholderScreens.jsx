import React from 'react';
import { motion } from 'framer-motion';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

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
            width: '90%',
            maxWidth: '350px',
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

export const History = ({ onHome }) => {
    const { t } = useLanguage();
    return (
        <ScreenContainer title={t('transactionHistory')} onHome={onHome}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span>{t('sentTo')} Rohan</span>
                    <span style={{ color: '#ef4444' }}>-₹500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span>{t('receivedFrom')} Dad</span>
                    <span style={{ color: '#22c55e' }}>+₹2000</span>
                </div>
                <p style={{ marginTop: '20px', opacity: 0.5, fontSize: '0.9rem' }}>{t('noMoreTransactions')}</p>
            </div>
        </ScreenContainer>
    );
};

export const Profile = ({ onHome }) => {
    const { t } = useLanguage();
    const { user } = useAuth(); // Assuming user object has details or we show mock
    // Mock data for demo if user doesn't have details
    const userDetails = {
        name: user?.user_metadata?.name || "Rohan Sharma",
        account: "1234567890",
        ifsc: "SBIN0001234",
        branch: "Pune Main Branch"
    };

    return (
        <ScreenContainer title={t('userDetails')} onHome={onHome}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                <div>
                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>Name</span>
                    <h3 style={{ fontSize: '1.2rem' }}>{userDetails.name}</h3>
                </div>
                <div>
                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>{t('accountNumber')}</span>
                    <h3 style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>{userDetails.account}</h3>
                </div>
                <div>
                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>{t('ifscCode')}</span>
                    <h3 style={{ fontSize: '1.2rem' }}>{userDetails.ifsc}</h3>
                </div>
                <div>
                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>{t('branch')}</span>
                    <h3 style={{ fontSize: '1.2rem' }}>{userDetails.branch}</h3>
                </div>
            </div>
        </ScreenContainer>
    );
};

export const Settings = ({ onHome }) => {
    const { t, setLanguage, language } = useLanguage();

    return (
        <ScreenContainer title={t('settings')} onHome={onHome}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>

                {/* Language Section */}
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#93c5fd' }}>{t('changeLanguage')}</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['english', 'hindi', 'marathi'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: language === lang ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Security Section */}
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '5px', color: '#93c5fd' }}>{t('security')}</h4>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>App Lock, Change Pin</p>
                </div>

                {/* Help Section */}
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '5px', color: '#93c5fd' }}>{t('helpSupport')}</h4>
                    <p style={{ color: '#fbbf24', fontSize: '0.95rem', fontWeight: 500 }}>
                        {t('contactBranch')}
                    </p>
                </div>

            </div>
        </ScreenContainer>
    );
};
