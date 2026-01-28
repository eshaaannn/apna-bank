
import React from 'react';
import { VoiceRecorder } from '../voice';
import { Home as HomeIcon, CreditCard, History, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = ({ isListening, onMicClick, userName = "Rohan Polelwar" }) => {
    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.greeting}>
                    <p style={styles.greetingText}>Good Morning,</p>
                    <h1 style={styles.userName}>{userName}</h1>
                </div>
                <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle"
                    alt="Avatar"
                    style={styles.avatar}
                />
            </header>

            {/* Main Content - Centered */}
            <main style={styles.main}>
                <h2 style={styles.promptText}>How can I help?</h2>

                <div style={styles.micContainer}>
                    <VoiceRecorder isListening={isListening} onClick={onMicClick} />
                </div>

                {/* Suggestions */}
                <div style={styles.suggestions}>
                    <SuggestionCard text="Send Money" />
                    <SuggestionCard text="Spending" />
                </div>
            </main>

            {/* Bottom Nav */}
            <nav style={styles.bottomNav}>
                <NavItem icon={<HomeIcon size={24} />} label="Home" active />
                <NavItem icon={<CreditCard size={24} />} label="Pay" />
                <NavItem icon={<History size={24} />} label="History" />
                <NavItem icon={<User size={24} />} label="Profile" />
            </nav>
        </div>
    );
};

const SuggestionCard = ({ text }) => (
    <motion.button
        style={styles.suggestion}
        whileTap={{ scale: 0.95 }}
    >
        {text}
    </motion.button>
);

const NavItem = ({ icon, label, active }) => (
    <div style={{ ...styles.navItem, color: active ? '#0ea5e9' : '#94a3b8' }}>
        {icon}
        <span style={styles.navLabel}>{label}</span>
    </div>
);

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
    },
    header: {
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greetingText: {
        fontSize: '0.9rem',
        color: '#64748b',
        margin: 0,
    },
    userName: {
        fontSize: '1.25rem',
        fontWeight: '700',
        margin: 0,
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#e2e8f0',
    },
    main: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '80px', // Space for nav
    },
    promptText: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '40px',
        color: '#334155',
    },
    micContainer: {
        marginBottom: '40px',
    },
    suggestions: {
        display: 'flex',
        gap: '16px',
        padding: '0 24px',
        overflowX: 'auto',
    },
    suggestion: {
        padding: '12px 24px',
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        fontSize: '1rem',
        fontWeight: '500',
        color: '#475569',
        cursor: 'pointer',
    },
    bottomNav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
    },
    navItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
    },
    navLabel: {
        fontSize: '0.75rem',
        fontWeight: '500',
    }
};

export default Home;
