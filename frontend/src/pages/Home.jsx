
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import MicButton from '../components/MicButton';
import { sendVoiceCommand } from '../api/bankingApi';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Home() {
    const { logout } = useAuth();
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState("Tap microphone to start");
    const [lastTranscript, setLastTranscript] = useState("");
    const [botResponse, setBotResponse] = useState("");
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one command
            recognitionRef.current.lang = 'en-IN'; // Indian English
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setStatus("Listening...");
                setBotResponse("");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;
                setLastTranscript(transcript);
                setStatus("Processing...");

                // Send to API
                try {
                    const response = await sendVoiceCommand(transcript);

                    if (response && response.text) {
                        setBotResponse(response.text);
                        setStatus("Complete");
                        speak(response.text);
                    } else {
                        setStatus("Error processing request");
                        speak("Sorry, I could not process that.");
                    }
                } catch (e) {
                    console.error(e);
                    setStatus("Error");
                    speak("Sorry, something went wrong.");
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech Recognition Error", event.error);
                setIsListening(false);
                setStatus("Message not clear. Try again.");
                speak("I didn't catch that. Please try again.");
            };
        } else {
            setStatus("Voice not supported on this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onstart = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onresult = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.stop();
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const speak = (text) => {
        if (synthRef.current) {
            synthRef.current.cancel(); // Stop previous speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1;
            synthRef.current.speak(utterance);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            // Small interaction delay to ensure state is clean
            setTimeout(() => {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error("Start error:", e);
                }
            }, 100);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0f172a] text-white">
            <div className="absolute top-4 right-4">
                <button onClick={logout} className="p-2 text-gray-400 hover:text-white">
                    <LogOut size={24} />
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center w-full max-w-md"
            >
                <h1 className="text-4xl font-bold mb-8 text-blue-400">Apna Bank</h1>

                <div className="mb-12">
                    <MicButton isListening={isListening} onClick={toggleListening} />
                </div>

                <div className="w-full text-center space-y-4 min-h-[150px]">
                    <p className="text-gray-400 text-lg uppercase tracking-wider">{status}</p>

                    {lastTranscript && (
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">You said:</p>
                            <p className="text-xl italic">"{lastTranscript}"</p>
                        </div>
                    )}

                    {botResponse && (
                        <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                            <p className="text-2xl font-medium text-blue-200">{botResponse}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
