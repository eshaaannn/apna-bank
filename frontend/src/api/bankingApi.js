
import { supabase, isConfigured } from './supabaseClient';

/**
 * Sends a voice command transcript to the backend or returns a mock response.
 * @param {string} transcript - The user's spoken command.
 * @returns {Promise<{text: string, data?: any}>}
 */
export async function sendVoiceCommand(transcript) {
    // 1. Try Supabase Edge Function if configured
    if (isConfigured && supabase) {
        try {
            const { data, error } = await supabase.functions.invoke('voice-command', {
                body: { transcript },
            });

            if (!error && data) {
                return data; // Expected format: { text: "Response text", ... }
            }
        } catch (err) {
            console.warn("Backend unavailable, switching to fallback mode:", err);
        }
    }

    // 2. Fallback Logic (Mock Responses)
    return getMockResponse(transcript);
}

function getMockResponse(transcript) {
    const t = transcript.toLowerCase();

    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            if (t.includes('balance') || t.includes('paisa') || t.includes('money')) {
                resolve({ text: "Your total balance is 5,000 rupees." });
            } else if (t.includes('send') || t.includes('transfer') || t.includes('bhejo')) {
                resolve({ text: "I have sent 1,000 rupees to your mother." });
            } else if (t.includes('loan') || t.includes('udhar')) {
                resolve({ text: "Your loan application for 50,000 rupees is approved." });
            } else if (t.includes('hello') || t.includes('hi')) {
                resolve({ text: "Namaste! I am your banking assistant. Say balance, or send money." });
            } else if (t.includes('help')) {
                resolve({ text: "You can ask me to check balance, send money, or check loan status." });
            } else {
                resolve({ text: "I did not understand. Please say balance, send money, or loan." });
            }
        }, 800);
    });
}
