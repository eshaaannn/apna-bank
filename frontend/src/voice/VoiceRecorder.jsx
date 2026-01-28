
import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import styles from './VoiceRecorder.module.css';

const VoiceRecorder = ({ isListening, onClick }) => {
  return (
    <div className={styles.container}>
      {/* Ripple/Pulse Effect */}
      {isListening && (
        <>
          <motion.div
            className={styles.pulseRing}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 2.5 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className={styles.pulseRingDelayed}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 2.0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
        </>
      )}

      {/* Main Mic Button */}
      <motion.button
        className={`${styles.micButton} ${isListening ? styles.active : ''}`}
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
        animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
      >
        <Mic size={40} color={isListening ? "#ffffff" : "#475569"} />
      </motion.button>
      
      <p className={styles.statusText}>
        {isListening ? "Listening..." : "Tap to Speak"}
      </p>
    </div>
  );
};

export default VoiceRecorder;
