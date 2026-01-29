import { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ listening, onSpeechStart, onSpeechEnd, onResult, onError }) => {
    const recognitionRef = useRef(null);
    const isRunning = useRef(false);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                isRunning.current = true;
                if (onSpeechStart) onSpeechStart();
            };

            recognition.onend = () => {
                isRunning.current = false;
                if (onSpeechEnd) onSpeechEnd();
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (onResult) onResult(transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (onError) onError(event.error);

                // If not allowed/error, force stop state
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    if (onSpeechEnd) onSpeechEnd();
                }
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition API not supported.");
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
        };
    }, []);

    useEffect(() => {
        if (!recognitionRef.current) return;

        if (listening) {
            try {
                // Only start if not already running (approximate check, api throws if started)
                if (!isRunning.current) recognitionRef.current.start();
            } catch (e) {
                console.log("Start error (likely already started):", e);
            }
        } else {
            recognitionRef.current.stop();
        }
    }, [listening]);

    return null;
};

export default VoiceInput;
