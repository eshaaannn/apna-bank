import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
    english: {
        greeting: "How can I help you today?",
        tapToSpeak: "Tap to Speak",
        listening: "Listening...",
        processing: "Processing...",
        checkBalance: "Check Balance",
        sendMoney: "Send Money",
        billPay: "Bill Pay",
        home: "HOME",
        history: "HISTORY",
        profile: "PROFILE",
        settings: "SETTINGS",
        helpSupport: "Help & Support",
        security: "Security",
        changeLanguage: "Change Language",
        contactBranch: "Please contact your branch office for support.",
        transactionHistory: "Transaction History",
        sentTo: "Sent to",
        receivedFrom: "Received from",
        noMoreTransactions: "No more transactions.",
        userDetails: "User Details",
        accountNumber: "Account Number",
        ifscCode: "IFSC Code",
        branch: "Branch",
        logout: "Logout",
        voiceLang: "en-US"
    },
    hindi: {
        greeting: "आज मैं आपकी क्या मदद कर सकता हूँ?",
        tapToSpeak: "बोलने के लिए टैप करें",
        listening: "सुन रहा हूँ...",
        processing: "प्रोसेस हो रहा है...",
        checkBalance: "बैंक बैलेंस",
        sendMoney: "पैसे भेजें",
        billPay: "बिल भरें",
        home: "होम",
        history: "लेन-देन",
        profile: "प्रोफाइल",
        settings: "सेटिंग्स",
        helpSupport: "मदद और सहायता",
        security: "सुरक्षा",
        changeLanguage: "भाषा बदलें",
        contactBranch: "कृपया सहायता के लिए अपनी शाखा से संपर्क करें।",
        transactionHistory: "लेन-देन का इतिहास",
        sentTo: "भेजे गए",
        receivedFrom: "प्राप्त हुए",
        noMoreTransactions: "और कोई लेन-देन नहीं है।",
        userDetails: "उपयोगकर्ता विवरण",
        accountNumber: "खाता संख्या",
        ifscCode: "IFSC कोड",
        branch: "शाखा",
        logout: "लॉग आउट",
        voiceLang: "hi-IN"
    },
    marathi: {
        greeting: "आज मी तुम्हाला काय मदत करू शकतो?",
        tapToSpeak: "बोलण्यासाठी टॅप करा",
        listening: "ऐकत आहे...",
        processing: "प्रक्रिया करत आहे...",
        checkBalance: "बॅलन्स तपासा",
        sendMoney: "पैसे पाठवा",
        billPay: "बिल भरा",
        home: "होम",
        history: "इतिहास",
        profile: "प्रोफाइल",
        settings: "सेटिंग्ज",
        helpSupport: "मदत आणि समर्थन",
        security: "सुरक्षा",
        changeLanguage: "भाषा बदला",
        contactBranch: "कृपया समर्थनासाठी आपल्या शाखेशी संपर्क साधा.",
        transactionHistory: "व्यवहार इतिहास",
        sentTo: "पाठवले",
        receivedFrom: "मिळाले",
        noMoreTransactions: "आणखी व्यवहार नाहीत.",
        userDetails: "वापरकर्ता तपशील",
        accountNumber: "खाता क्रमांक",
        ifscCode: "IFSC कोड",
        branch: "शाखा",
        logout: "लॉग आउट",
        voiceLang: "mr-IN"
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('english');

    const t = (key) => {
        return translations[language][key] || key;
    };

    const currentVoiceLang = translations[language].voiceLang;

    const value = {
        language,
        setLanguage,
        t,
        voiceLang: currentVoiceLang
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
