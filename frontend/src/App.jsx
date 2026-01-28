
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { isConfigured } from './api/supabaseClient';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Home from './pages/Home';

function ConfigurationError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-yellow-500 mb-4">Configuration Required</h1>
      <p className="max-w-md text-lg text-gray-300">
        Please set <code className="bg-gray-800 p-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-gray-800 p-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your environment variables.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        (The app will still run in demo mode if you proceed, but backend features may be simulated.)
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
      >
        Retry
      </button>
    </div>
  );
}

function App() {
  // Option: If strict config is required, return <ConfigurationError />
  // However, specs said "If !isConfigured show Configuration Error screen "
  // But also said "Ensure fault tolerance" and "mock responses". 
  // Let's stick to the spec "If valid: Initialize... allows UI to show Config Error screen INSTEAD OF CRASHING".
  // Actually, if I show ConfigError, I can't demo the mock fallback. 
  // Wait, Requirement A said:
  // "If missing: export isConfigured=false... allows UI to show 'Configuration Error' screen"
  // Requirement B said: "Fallback Logic... Return intelligent mock responses... This guarantees 100% demo reliability"
  // So there is a conflict. 
  // Interpretation: The "Configuration Error" screen might be a "Start anyway" screen or I should just let it run in mock mode but maybe show a banner?
  // Re-reading Req A: "allows the UI to show 'Configuration Error' screen instead of crashing."
  // It doesn't say I MUST show a blocker. It just says "allows". 
  // But Req App.jsx says: "if (!isConfigured) show Configuration Error screen"
  // Okay, I will show a Configuration Error screen that allows bypassing for Demo Mode.

  const [demoMode, setDemoMode] = React.useState(false);

  if (!isConfigured && !demoMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-900 text-white">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Configuration Missing</h1>
        <p className="text-xl mb-8">Supabase environment variables are missing.</p>
        <button
          onClick={() => setDemoMode(true)}
          className="primary-btn max-w-xs"
        >
          Enter Demo Mode
        </button>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
