import { useState, useEffect, useCallback } from 'react';
import { VoiceRecorder, VoiceInput } from './voice';
import { Home, RecipientInput, TransferConfirm, SuccessScreen, ErrorScreen, BalanceResult, Login, Register, History, Insight, Settings } from './screens';
import { sendVoiceCommand } from './api/bankingApi';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import './index.css';



// App States
const STATES = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  ASK_RECIPIENT: 'ASK_RECIPIENT',
  ASK_AMOUNT: 'ASK_AMOUNT',
  CONFIRM: 'CONFIRM',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  BALANCE: 'BALANCE',
  HISTORY: 'HISTORY',
  INSIGHT: 'INSIGHT',
  SETTING: 'SETTING',
};

// ... imports
import { useAuth } from './context/AuthContext';

// ... STATES ...

function App() {
  const { user, loading } = useAuth(); // Auth Check
  const [isRegistering, setIsRegistering] = useState(false);

  const [appState, setAppState] = useState(STATES.IDLE);
  const [balance, setBalance] = useState(5000); // Local balance state

  const [transaction, setTransaction] = useState({ recipient: '', amount: '' });
  const [feedbackText, setFeedbackText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [micActive, setMicActive] = useState(false);

  // ... (Voice Logic Helpers - speak, processVoiceCommand, etc) ...
  // [KEEP ALL EXISTING LOGIC HELPERS HERE]

  // Need to redefine these here because I am replacing the whole function body or part of it? 
  // Wait, I should not replace the whole file content blindly.
  // I will just modify the RETURN statement and the top-level hook.

  // EDIT: I cannot easily insert hooks at top and wrap return at bottom with one replace call if they are far apart.
  // I will use a larger replacement to cover the structure.

  // Voice Interaction Helpers
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const processVoiceCommand = async (transcript) => {
    console.log("Heard:", transcript);
    setIsProcessing(true);
    const response = await sendVoiceCommand(transcript);
    setIsProcessing(false);

    if (response) {
      if (response.text) speak(response.text);
      switch (response.intent) {
        case 'balance': setAppState(STATES.BALANCE); break;
        case 'ask_recipient': setAppState(STATES.ASK_RECIPIENT); break;
        case 'ask_amount':
          setAppState(STATES.ASK_AMOUNT);
          if (response.data?.recipient) setTransaction(p => ({ ...p, recipient: response.data.recipient }));
          break;
        case 'confirm_transfer':
          setAppState(STATES.CONFIRM);
          if (response.data?.amount) setTransaction(p => ({ ...p, amount: response.data.amount }));
          break;
        case 'transfer_success':
        case 'transfer':
          if (appState === STATES.CONFIRM) {
            const amt = parseInt(transaction.amount);
            if (!isNaN(amt)) setBalance(prev => prev - amt);
          }
          setAppState(STATES.SUCCESS);
          break;
        case 'idle': setAppState(STATES.IDLE); break;
        default: break;
      }
    } else {
      speak("Sorry, I am having trouble connecting.");
      setAppState(STATES.ERROR);
    }
  };

  const handleMicClick = () => {
    if ([STATES.IDLE, STATES.BALANCE, STATES.ERROR].includes(appState)) {
      setMicActive(true);
      if (appState !== STATES.BALANCE) setAppState(STATES.LISTENING);
    } else {
      setMicActive(true);
    }
  };

  const onSpeechEnd = () => setMicActive(false);

  const onResult = (transcript) => {
    if (!transcript) return;
    processVoiceCommand(transcript);
  };

  useEffect(() => {
    if ([STATES.ASK_RECIPIENT, STATES.ASK_AMOUNT, STATES.CONFIRM].includes(appState)) {
      const timer = setTimeout(() => {
        setMicActive(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const goBack = () => {
    setAppState(STATES.IDLE);
    window.speechSynthesis.cancel();
  };

  const handleOptionSelect = (option) => {
    processVoiceCommand(option);
  };

  const navigateTo = (screen) => {
    setAppState(STATES[screen]);
  };

  // ----------------------------------------------------
  // AUTH GUARD
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="app-container flex-center">
        <span style={{ color: '#3b82f6' }}>Loading your secure bank...</span>
      </div>
    );
  }

  // If not logged in, show Login Screen (standard React conditional)
  // If not logged in, show Login/Register Screen
  if (!user) {
    return (
      <div className="app-container">
        <AnimatePresence mode="wait">
          {isRegistering ? (
            <Register key="register" onLoginClick={() => setIsRegistering(false)} />
          ) : (
            <Login key="login" onRegisterClick={() => setIsRegistering(true)} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // If logged in, show the Voice App
  return (
    <div className="app-container">
      {/* Voice Logic Layer - Only active when logged in */}
      <VoiceInput
        listening={micActive}
        onSpeechStart={() => console.log('Speech Started')}
        onSpeechEnd={onSpeechEnd}
        onResult={onResult}
      />

      {/* Screen Router */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {isProcessing && (
          <div className="flex-center" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, background: 'rgba(255,255,255,0.8)', padding: '10px', backdropFilter: 'blur(5px)' }}>
            <span style={{ color: '#4f46e5', fontWeight: 600 }}>Processing...</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {appState === STATES.IDLE && (
            <Home key="home" isListening={micActive} onOptionClick={handleOptionSelect} onMicClick={handleMicClick} onNavigate={navigateTo} />
          )}
          {appState === STATES.LISTENING && (
            <Home key="home-listening" isListening={micActive} onOptionClick={handleOptionSelect} onMicClick={handleMicClick} />
          )}

          {appState === STATES.BALANCE && (
            <BalanceResult key="balance" onHome={goBack} balance={balance} />
          )}

          {appState === STATES.ASK_RECIPIENT && (
            <RecipientInput key="recipient" onBack={goBack} onSelect={(name) => processVoiceCommand(name)} />
          )}

          {appState === STATES.ASK_AMOUNT && (
            <div key="amount" className="flex-center" style={{ height: '100%', flexDirection: 'column' }}>
              <div className="back-btn" onClick={goBack}><ArrowLeft /></div>
              <h2>How much?</h2>
              <p>Say "500"</p>
            </div>
          )}

          {appState === STATES.CONFIRM && (
            <TransferConfirm key="confirm" onBack={goBack} amount={transaction.amount} recipient={transaction.recipient} />
          )}

          {appState === STATES.SUCCESS && (
            <SuccessScreen key="success" onHome={goBack} />
          )}

          {appState === STATES.ERROR && (
            <ErrorScreen key="error" onRetry={goBack} />
          )}

          {appState === STATES.HISTORY && <History key="history" onHome={goBack} />}
          {appState === STATES.INSIGHT && <Insight key="insight" onHome={goBack} />}
          {appState === STATES.SETTING && <Settings key="settings" onHome={goBack} />}
        </AnimatePresence>
      </div>

      {/* Persistent Floating Mic - HIDE on Home (IDLE & LISTENING) because Home has its own Hello-style Mic */}
      {![STATES.IDLE, STATES.LISTENING].includes(appState) && (
        <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 100 }}>
          <div style={{ pointerEvents: 'auto' }}>
            <VoiceRecorder isListening={micActive} onClick={handleMicClick} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
