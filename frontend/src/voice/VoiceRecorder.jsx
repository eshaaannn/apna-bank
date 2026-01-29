import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

const VoiceRecorder = ({ isListening, onClick }) => {
  return (
    <div className="flex-center" style={{ position: 'relative', height: '140px', width: '140px' }}>
      {/* Pulsing Rings */}
      {isListening && (
        <>
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #3b82f6',
              opacity: 0.5,
              zIndex: 1
            }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #60a5fa',
              opacity: 0.3,
              zIndex: 1
            }}
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3, ease: "easeOut" }}
          />
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 70%)',
              zIndex: 0
            }}
            animate={{ scale: [0.8, 1.2], opacity: [0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />

        </>
      )}

      {/* Main Mic Button */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: isListening
            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            : 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: isListening ? 'none' : '1px solid rgba(255,255,255,0.5)',
          boxShadow: isListening
            ? "0 0 30px rgba(59, 130, 246, 0.6)"
            : "0 10px 25px rgba(0,0,0,0.1)",
          color: isListening ? 'white' : '#3b82f6',
          zIndex: 10,
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        <Mic size={40} />
      </motion.button>
    </div>
  );
};

export default VoiceRecorder;
