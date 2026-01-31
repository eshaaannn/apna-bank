import { useState, useEffect, useCallback } from 'react';
import { VoiceRecorder, VoiceInput } from './voice';
import { Home, RecipientInput, TransferConfirm, SuccessScreen, ErrorScreen, BalanceResult, Login, Register, LoginPin, History, Insight, Settings } from './screens';
import { sendVoiceCommand, getBalance, executeTransfer, payBill } from './api/bankingApi';
import { Home, RecipientInput, TransferConfirm, SuccessScreen, ErrorScreen, BalanceResult, Login, Register, History, Profile, Settings } from './screens';
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
  PROFILE: 'PROFILE',
  SETTING: 'SETTING',
  PIN_ENTRY: 'PIN_ENTRY',
  LOGIN_PIN: 'LOGIN_PIN',
};

import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';

function App() {
  const { user, loading } = useAuth(); // Auth Check
  const { voiceLang, t } = useLanguage();
  const [isRegistering, setIsRegistering] = useState(false);

  const [appState, setAppState] = useState(STATES.IDLE);
  const [balance, setBalance] = useState(5000); // Local balance state

  const [transaction, setTransaction] = useState({ recipient: '', amount: '', phone: '', type: 'transfer' });
  const [feedbackText, setFeedbackText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ... (Voice Logic Helpers - speak, processVoiceCommand, etc) ...
  // [KEEP ALL EXISTING LOGIC HELPERS HERE]

  // Voice Interaction Helpers
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang; // Use context language
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceLang]);

  const processVoiceCommand = async (transcript) => {
    console.log("🎤 Voice Command:", transcript);
    console.log("📍 Current State:", appState);
    setIsProcessing(true);
    try {
      const response = await sendVoiceCommand(transcript);
      console.log("📡 Backend Response:", response);
      if (response) {
        if (response.message) speak(response.message);

        // Handle action_required from backend
        if (response.action_required) {
          const { endpoint, params } = response.action_required;
          setPendingAction(response.action_required);

          if (endpoint === '/transaction/transfer') {
            setTransaction({
              recipient: response.entities.receiver_name || '',
              amount: params.amount || '',
              phone: params.receiver_phone || '',
              type: 'transfer'
            });
            if (params.amount && params.receiver_phone) {
              setAppState(STATES.CONFIRM);
            }
          } else if (endpoint === '/transaction/billpay') {
            setTransaction({
              amount: params.amount || '',
              type: 'billpay',
              bill_type: params.bill_type,
              account_number: params.account_number
            });
            setAppState(STATES.CONFIRM);
          }
        }

        switch (response.intent) {
          case 'balance':
            fetchBalance();
            setAppState(STATES.BALANCE);
            break;
          case 'ask_recipient': setAppState(STATES.ASK_RECIPIENT); break;
          case 'ask_amount':
            setAppState(STATES.ASK_AMOUNT);
            if (response.entities?.receiver_name) setTransaction(p => ({ ...p, recipient: response.entities.receiver_name }));
            break;
          case 'confirm':
            if (appState === STATES.CONFIRM) {
              handleConfirmAction();
            } else if (appState === STATES.PIN_ENTRY || response.entities?.pin) {
              const pin = response.entities?.pin;
              if (pin) handleConfirmAction(pin);
            }
            break;
          case 'cancel':
            goBack();
            break;
          case 'idle': setAppState(STATES.IDLE); break;
          default:
            // Also check for PIN in unknown intents if we are in PIN_ENTRY state
            if (appState === STATES.PIN_ENTRY && response.entities?.pin) {
              handleConfirmAction(response.entities.pin);
            }
            break;
        }
      } else {
        const msg = "Sorry, I am having trouble connecting.";
        speak(msg);
        setErrorMsg(msg);
        setAppState(STATES.ERROR);
          setAppState(STATES.SUCCESS);
          break;
        case 'idle': setAppState(STATES.IDLE); break;
        case 'profile': setAppState(STATES.PROFILE); break;
        default: break;
      }
    } catch (e) {
      console.error("Command processing error:", e);
      const msg = e.message || "Something went wrong. Please try again.";
      speak(msg);
      setErrorMsg(msg);
      setAppState(STATES.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchBalance = async () => {
    const data = await getBalance();
    if (data && typeof data.balance === 'number') {
      setBalance(data.balance);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
      // Reset PIN verification on login
      setIsPinVerified(false);
      setAppState(STATES.LOGIN_PIN);
    } else {
      setAppState(STATES.IDLE);
    }
  }, [user]);

  const handleLoginPinVerify = async (pin) => {
    setIsProcessing(true);
    try {
      // Small delay to simulate verification
      await new Promise(r => setTimeout(r, 1000));

      // In a real app, call backend to verify login PIN
      // For demo, we'll accept '123456' or any 6-digit PIN if it's their first time
      setIsPinVerified(true);
      setAppState(STATES.IDLE);
      speak("Welcome to Voice Bank. How can I help you today?");
    } catch (e) {
      speak("Invalid PIN. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async (pin = null) => {
    setIsProcessing(true);
    let result;

    const amount = parseFloat(transaction.amount);
    if (isNaN(amount) || amount <= 0) {
      console.warn("⚠️ Invalid amount:", transaction.amount);
      speak("The amount is invalid. Please specify a valid amount.");
      setAppState(STATES.ASK_AMOUNT);
      setIsProcessing(false);
      return;
    }

    console.log("🚀 Executing Transfer:", { ...transaction, phone: transaction.phone || "8888888888", amount, pin: pin ? "****" : "None" });

    try {
      if (transaction.type === 'transfer') {
        result = await executeTransfer({
          receiver_phone: transaction.phone || "8888888888",
          amount: amount,
          transfer_pin: pin
        });
      } else {
        result = await payBill({
          bill_type: transaction.bill_type || 'electricity',
          amount: amount,
          account_number: transaction.account_number || '1234567890',
          transfer_pin: pin
        });
      }
      console.log("✅ Transaction Result:", result);

      if (result.status === 'confirmation_required') {
        speak(result.message);
        setAppState(STATES.PIN_ENTRY);
      } else if (result.status === 'success') {
        speak(result.message || "Transaction successful");
        setBalance(result.new_balance);
        setAppState(STATES.SUCCESS);
      } else {
        const errorMsg = result.detail || result.error || result.message || "Transaction failed";
        speak(errorMsg);
        setErrorMsg(errorMsg);
        setAppState(STATES.ERROR);
      }
    } catch (err) {
      console.error("Transaction confirmation error:", err);
      const msg = "A connection error occurred. Please try again.";
      speak(msg);
      setErrorMsg(msg);
      setAppState(STATES.ERROR);
    } finally {
      setIsProcessing(false);
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
    setErrorMsg('');
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

  // If logged in but PIN not verified, show Login PIN
  if (!isPinVerified) {
    return (
      <div className="app-container">
        <LoginPin onVerify={handleLoginPinVerify} onBack={() => { }} />
      </div>
    );
  }

  // If logged in, show the Voice App
  return (
    <div className="app-container">
      {/* Voice Logic Layer - Only active when logged in */}
      <VoiceInput
        listening={micActive}
        language={voiceLang}
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
            <TransferConfirm
              key="confirm"
              onBack={goBack}
              amount={transaction.amount}
              recipient={transaction.recipient}
              onConfirm={() => handleConfirmAction()}
            />
          )}

          {appState === STATES.PIN_ENTRY && (
            <div key="pin" className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '20px' }}>
              <div className="back-btn" onClick={goBack}><ArrowLeft /></div>
              <h2>Enter 4-digit PIN</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: '40px', height: '40px', border: '2px solid #4f46e5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    *
                  </div>
                ))}
              </div>
              <p style={{ opacity: 0.7 }}>Say "My PIN is 1 2 3 4"</p>
              {/* For demo purposes, we can also add a small button to simulate PIN entry */}
              <button
                onClick={() => handleConfirmAction("1234")}
                style={{ marginTop: '20px', padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px' }}
              >
                Enter PIN 1234 (Demo)
              </button>
            </div>
          )}

          {appState === STATES.SUCCESS && (
            <SuccessScreen key="success" onHome={goBack} />
          )}

          {appState === STATES.ERROR && (
            <ErrorScreen key="error" onRetry={goBack} error={errorMsg} />
          )}

          {appState === STATES.HISTORY && <History key="history" onHome={goBack} />}
          {appState === STATES.PROFILE && <Profile key="profile" onHome={goBack} />}
          {appState === STATES.SETTING && <Settings key="settings" onHome={goBack} />}
        </AnimatePresence>
      </div>

      {/* Persistent Floating Mic - HIDE on Home, History, Profile, Settings */}
      {![STATES.IDLE, STATES.LISTENING, STATES.HISTORY, STATES.PROFILE, STATES.SETTING].includes(appState) && (
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
