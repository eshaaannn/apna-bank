
import React, { useState, useEffect, useCallback } from 'react';
import { VoiceInput, speak } from './voice';
import {
    Home,
    RecipientInput,
    TransferConfirm,
    SuccessScreen,
    ErrorScreen,
    BalanceResult
} from './screens';

// Application States
const STATES = {
    HOME: 'HOME',
    LISTENING_COMMAND: 'LISTENING_COMMAND',
    ASK_RECIPIENT: 'ASK_RECIPIENT',
    LISTENING_RECIPIENT: 'LISTENING_RECIPIENT',
    ASK_AMOUNT: 'ASK_AMOUNT',
    LISTENING_AMOUNT: 'LISTENING_AMOUNT',
    CONFIRMATION: 'CONFIRMATION',
    LISTENING_CONFIRM: 'LISTENING_CONFIRM',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    BALANCE: 'BALANCE'
};

const App = () => {
    const [appState, setAppState] = useState(STATES.HOME);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [transferData, setTransferData] = useState({ recipient: "", amount: "" });

    // Reset helper
    const resetFlow = () => {
        setAppState(STATES.HOME);
        setTransferData({ recipient: "", amount: "" });
        setTranscript("");
        setIsListening(false);
    };

    const handleMicClick = () => {
        if (appState === STATES.HOME) {
            setIsListening(true);
            setAppState(STATES.LISTENING_COMMAND);
        }
    };

    const processTranscript = useCallback((text) => {
        // Normalize text
        const lowerText = text.toLowerCase();
        console.log(`Processing state: ${appState}, text: ${lowerText}`);

        // State Machine Logic
        switch (appState) {
            case STATES.LISTENING_COMMAND:
                if (lowerText.includes('send') || lowerText.includes('pay') || lowerText.includes('transfer')) {
                    setIsListening(false);
                    setAppState(STATES.ASK_RECIPIENT);
                } else if (lowerText.includes('balance') || lowerText.includes('spending')) {
                    setIsListening(false);
                    setAppState(STATES.BALANCE);
                    speak("Your savings account balance is 1250 dollars.");
                } else {
                    // Not understood, maybe retry or stay?
                    // For MVP, just stop listening or ask again?
                    // Let's stop and verify if user speaks again.
                    setIsListening(false);
                }
                break;

            case STATES.LISTENING_RECIPIENT:
                if (lowerText) {
                    setTransferData(prev => ({ ...prev, recipient: text })); // Keep Title Case if possible? Web Speech usually lowers.
                    setIsListening(false);
                    setAppState(STATES.ASK_AMOUNT);
                }
                break;

            case STATES.LISTENING_AMOUNT:
                if (lowerText) {
                    // Extract number? or just take the text
                    const amount = lowerText.replace(/[^0-9.]/g, '');
                    setTransferData(prev => ({ ...prev, amount: amount || text }));
                    setIsListening(false);
                    setAppState(STATES.CONFIRMATION);
                }
                break;

            case STATES.LISTENING_CONFIRM:
                if (lowerText.includes('yes') || lowerText.includes('confirm') || lowerText.includes('ok')) {
                    setIsListening(false);
                    setAppState(STATES.SUCCESS);
                } else if (lowerText.includes('no') || lowerText.includes('cancel')) {
                    resetFlow();
                    speak("Transaction cancelled.");
                }
                break;

            default:
                break;
        }
    }, [appState]);

    // Handle State Transitions (Side Effects: Text-to-Speech)
    useEffect(() => {
        console.log("State Changed to:", appState);

        switch (appState) {
            case STATES.ASK_RECIPIENT:
                speak("Who do you want to send money to?", () => {
                    // Start listening after speaking
                    setAppState(STATES.LISTENING_RECIPIENT);
                    setIsListening(true);
                });
                break;

            case STATES.ASK_AMOUNT:
                speak(`How much do you want to send to ${transferData.recipient}?`, () => {
                    setAppState(STATES.LISTENING_AMOUNT);
                    setIsListening(true);
                });
                break;

            case STATES.CONFIRMATION:
                speak(`Sending ${transferData.amount} dollars to ${transferData.recipient}. Confirm?`, () => {
                    setAppState(STATES.LISTENING_CONFIRM);
                    setIsListening(true);
                });
                break;

            case STATES.SUCCESS:
                speak("Transfer complete.");
                break;

            default:
                break;
        }
    }, [appState, transferData.recipient, transferData.amount]);


    // Render Logic
    const renderScreen = () => {
        switch (appState) {
            case STATES.HOME:
            case STATES.LISTENING_COMMAND:
                return <Home isListening={isListening} onMicClick={handleMicClick} />;

            case STATES.ASK_RECIPIENT:
            case STATES.LISTENING_RECIPIENT:
                return <RecipientInput transcript={transcript} />;

            case STATES.ASK_AMOUNT:
            case STATES.LISTENING_AMOUNT:
                // Re-use RecipientInput or a new simple input?
                // Requirement 3.B.5: "Stay on screen or update visual"
                // Let's use TransferConfirm logic or stay on RecipientInput but asking amount?
                // Prompt B.5 says "Stay on screen or update visual".
                // Let's show TransferConfirm with partial data?
                // Or create an AmountInput screen?
                // We didn't create AmountInput.
                // Let's use RecipientInput but change title?
                // Or TransferConfirm but with "..." for amount?
                // Let's use a "Visual Prompt" (maybe the TransferConfirm card partially filled?)
                return (
                    <TransferConfirm
                        recipient={transferData.recipient}
                        amount={transferData.amount || "..."}
                        onConfirm={() => { }} // No manual confirm yet
                    />
                );

            case STATES.CONFIRMATION:
            case STATES.LISTENING_CONFIRM:
                return (
                    <TransferConfirm
                        recipient={transferData.recipient}
                        amount={transferData.amount}
                        onConfirm={() => setAppState(STATES.SUCCESS)}
                    />
                );

            case STATES.SUCCESS:
                return <SuccessScreen onGoHome={resetFlow} />;

            case STATES.BALANCE:
                return <BalanceResult onGoHome={resetFlow} />;

            case STATES.ERROR:
                return <ErrorScreen onRetry={resetFlow} />;

            default:
                return <Home />;
        }
    };

    return (
        <>
            {renderScreen()}
            <VoiceInput
                isListening={isListening}
                onTranscript={(text) => {
                    setTranscript(text);
                    processTranscript(text);
                }}
                onStateChange={(active) => {
                    // Optional: sync listening state if speech API stops automatically
                    // But we handle it via logic flow usually
                    if (!active && isListening) {
                        // Automatically stopped?
                        // Maybe enable manual restart?
                    }
                }}
            />
        </>
    );
};

export default App;
