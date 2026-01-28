
import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

const MicButton = ({ isListening, onClick }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                className={`relative flex items-center justify-center w-32 h-32 rounded-full border-4 shadow-xl transition-colors duration-300 focus:outline-none ${isListening
                        ? 'bg-red-500 border-red-300 shadow-red-500/50'
                        : 'bg-blue-600 border-blue-400 shadow-blue-500/50'
                    }`}
            >
                {isListening && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut",
                        }}
                        className="absolute inset-0 rounded-full bg-red-500"
                    />
                )}
                <Mic className="w-16 h-16 text-white z-10" />
            </motion.button>
            <div className="text-xl font-medium text-white transition-opacity duration-300">
                {isListening ? "Listening..." : "Tap to Speak"}
            </div>
        </div>
    );
};

export default MicButton;
