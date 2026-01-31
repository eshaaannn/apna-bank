
import { supabase } from '../supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

export async function sendVoiceCommand(transcript) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return getMockResponse(transcript);

    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/voice/intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ text: transcript })
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error("Voice intent failed:", err);
        return getMockResponse(transcript);
    }
}

export async function executeTransfer(transferData) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetchWithTimeout(`${API_BASE_URL}/transaction/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(transferData)
        });
        return await response.json();
    } catch (e) {
        return { status: 'error', detail: 'Request timed out or connection failed' };
    }
}

export async function payBill(billData) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetchWithTimeout(`${API_BASE_URL}/transaction/billpay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(billData)
        });
        return await response.json();
    } catch (e) {
        return { status: 'error', detail: 'Request timed out or connection failed' };
    }
}

export async function getBalance() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetchWithTimeout(`${API_BASE_URL}/account/balance`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` },
            timeout: 5000
        });
        if (!response.ok) return { balance: 0 };
        return await response.json();
    } catch (e) {
        return { balance: 0 };
    }
}

export async function setupPin(pin, type = 'login', phone = null) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetchWithTimeout(`${API_BASE_URL}/account/setup-pin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ pin, type, phone })
        });
        return await response.json();
    } catch (e) {
        return { message: 'Failed to set up PIN' };
    }
}

// Fallback Mock Logic (Mimics Backend for testing UI without Backend)
function getMockResponse(text) {
    const lowerText = text.toLowerCase();

    // DELAY to simulate network
    return new Promise(resolve => {
        setTimeout(() => {
            if (lowerText.includes('balance') || lowerText.includes('spending')) {
                resolve({
                    text: "Your current balance is 5,000 rupees.",
                    intent: "balance",
                    data: { balance: 5000 }
                });
            } else if (lowerText.includes('send') || lowerText.includes('pay')) {
                // If incomplete
                resolve({
                    text: "Who do you want to send money to?",
                    intent: "ask_recipient"
                });
            } else if (['mom', 'rahul', 'shop', 'sarah'].some(name => lowerText.includes(name))) {
                resolve({
                    text: `How much do you want to send?`,
                    intent: "ask_amount",
                    data: { recipient: text } // Simplified
                });
            } else if (lowerText.match(/\d+/)) {
                resolve({
                    text: `Confirm transfer of ${lowerText.match(/\d+/)[0]}? Say Yes.`,
                    intent: "confirm_transfer",
                    data: { amount: lowerText.match(/\d+/)[0] }
                });
            } else if (lowerText.includes('yes') || lowerText.includes('confirm')) {
                resolve({
                    text: "Successfully transferred.",
                    intent: "transfer_success"
                });
            } else {
                resolve({
                    text: "I didn't understand that.",
                    intent: "unknown"
                });
            }
        }, 1000);
    });
}
