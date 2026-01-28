
import { useEffect, useCallback } from 'react';

const VoiceInput = ({ isListening, onTranscript, onStateChange }) => {

    const startListening = Callback(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Browser does not support Speech Recognition");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Default to English, maybe configurable later

        recognition.onstart = () => {
            onStateChange(true);
        };

        recognition.onend = () => {
            onStateChange(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error", event.error);
            onStateChange(false);
        };

        recognition.start();
    }, [onTranscript, onStateChange]);

    // Hooking into isListening prop to trigger start purely? 
    // actually component logic suggests this component might "control" the recognition
    // but for now, let's expose specific methods or use an effect if props change.
    // Requirement: "App listens" when user taps.

    // Actually easiest path: Expose a helper or just return null and handle logic?
    // User asked for "VoiceInput.jsx ... Main voice listener".

    useEffect(() => {
        if (isListening) {
            startListening();
        }
    }, [isListening, startListening]);

    return null; // This component handles logic, no UI output itself. 
    // UI is VoiceRecorder.
};

// Also need a helper for Synthesis
export const speak = (text, onEnd) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    if (onEnd) {
        utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
};

export default VoiceInput;
