import React from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, History, Home as HomeIcon, Settings, Mic, LogOut } from 'lucide-react';
import { VoiceRecorder } from '../voice';
import { useAuth } from '../context/AuthContext';

// NOTE: We rely on the App.jsx to render the *Functional* VoiceRecorder logic usually.
// However, for this UI, we want a BIG CENTRAL MIC.
// We can render a visual representation here, or coordinate with the main App.
// Let's render the VISUAL here, but we need to trigger the parent's logic.
// OR simpler: Pass `onMicClick` to this component.

const Home = ({ onMicClick, isListening, onOptionClick, onNavigate }) => {
    const { logout } = useAuth();
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-center"
            style={{ flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '20px', background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}
        >
            {/* Header */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>VB</span>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '1px' }}>VOICE BANK</span>
                </div>

                <div onClick={logout} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <LogOut size={20} color="#ef4444" />
                </div>
            </div>

            {/* Central Content */}
            <div className="flex-center" style={{ flexDirection: 'column', gap: '30px', flex: 1 }}>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>How can I help you<br />today?</h1>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>I'm ready to assist with your finances.</p>
                </div>

                {/* Replicating the Visual of the layout: Big Mic in Center */}
                {/* We use a placeholder div to structure the layout, relying on position:absolute in App.jsx OR we move Mic here? */}
                {/* For best results with THIS design, the Mic should be statically placed here in flow. */}
                {/* Let's render a CLICKABLE area here that triggers the mic */}

                {/* Visual Placeholder for Mic - The ACTUAL mic is stuck to bottom in App.jsx currently. 
                    We should probably HIDE the persistent mic on Home info App.jsx and render local one?
                    OR we just style the persistent one to float here? 
                    Easier: Render a button here calling onMicClick. App.jsx handles logic. */}

                <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                    {/* We will let the user click this area to trigger mic if not listening */}
                    {/* Actually, let's ask the USER's App.jsx to render the mic here? No, complicated props. */}
                    {/* We will create a Visual trigger here. */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onMicClick}
                        style={{
                            width: '100%', height: '100%',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <Mic size={32} color="white" fill="white" />
                        {/* We need Mic Icon */}
                    </motion.button>
                    {/* Ripple effect */}
                    {isListening && (
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                borderRadius: '50%', border: '2px solid #3b82f6'
                            }}
                        />
                    )}
                </div>

                <p style={{ fontSize: '0.9rem', letterSpacing: '2px', opacity: 0.6, textTransform: 'uppercase' }}>
                    {isListening ? "Listening..." : "Tap to Speak"}
                </p>

                {/* Waveform graphic could go here */}
            </div>

            {/* Bottom Actions */}
            <div style={{ width: '100%', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                    <button className="chip" onClick={() => onOptionClick('Check Balance')}>Check Balance</button>
                    <button className="chip" onClick={() => onOptionClick('Send Money')}>Send Money</button>
                    <button className="chip">Bill Pay</button>
                </div>

                {/* Nav */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
                    <div onClick={() => onNavigate && onNavigate('IDLE')} className="flex-center" style={{ flexDirection: 'column', gap: '5px', color: '#3b82f6', cursor: 'pointer' }}>
                        <HomeIcon size={24} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>HOME</span>
                    </div>
                    <div onClick={() => onNavigate && onNavigate('HISTORY')} className="flex-center" style={{ flexDirection: 'column', gap: '5px', color: '#64748b', cursor: 'pointer' }}>
                        <History size={24} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>HISTORY</span>
                    </div>
                    <div onClick={() => onNavigate && onNavigate('INSIGHT')} className="flex-center" style={{ flexDirection: 'column', gap: '5px', color: '#64748b', cursor: 'pointer' }}>
                        <CreditCard size={24} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>INSIGHT</span>
                    </div>
                    <div onClick={() => onNavigate && onNavigate('SETTING')} className="flex-center" style={{ flexDirection: 'column', gap: '5px', color: '#64748b', cursor: 'pointer' }}>
                        <Settings size={24} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>SETTINGS</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Home;
