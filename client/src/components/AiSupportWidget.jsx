import React, { useState } from 'react';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AiSupportWidget = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: t('ai.greeting', "Hi! I'm your Kisan Assistant. Ask me about prices, delivery, or finding organic products."), isBot: true }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/messages/assistant`, { question: userMsg });
            setMessages(prev => [...prev, { text: data.data.answer, isBot: true }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: t('ai.error', "Sorry, I'm having trouble connecting right now."), isBot: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 hover:scale-110 transition-transform flex items-center justify-center"
                >
                    <FaRobot className="text-2xl" />
                </button>
            )}

            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-80 sm:w-96 flex flex-col border border-gray-200" style={{ height: '400px' }}>
                    <div className="bg-green-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center">
                            <FaRobot className="mr-2" />
                            <span className="font-bold">{t('ai.assistant', 'Kisan Assistant')} 🤖</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                            <FaTimes />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.isBot ? 'bg-white border border-gray-200 text-gray-800' : 'bg-green-600 text-white'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-500 p-2 rounded-lg text-xs animate-pulse">
                                    {t('ai.thinking', 'Thinking...')}
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white rounded-b-lg flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('ai.placeholder', 'Ask me anything...')}
                            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AiSupportWidget;
