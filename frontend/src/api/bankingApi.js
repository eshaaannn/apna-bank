
import { supabase } from '../supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function sendVoiceCommand(transcript) {
    // 1. Get current session for Auth Token
    const { data: { session } } = await supabase.auth.getSession();

    // For MVP/Dev, if no session, we might want to allow it or mock it.
    // The user requirement says: "if !session ... return getMockResponse".
    if (!session) {
        console.warn("User not logged in (or no session). Using mock response.");
        return getMockResponse(transcript);
    }

    try {
        // 2. Call Python Backend
        const response = await fetch(`${API_BASE_URL}/voice/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}` // Pass Supabase JWT
            },
            body: JSON.stringify({
                text: transcript
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        // 3. Return Data in expected format
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Backend request failed:", err);
        return getMockResponse(transcript); // Graceful fallback
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
