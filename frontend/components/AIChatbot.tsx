import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { ChatIcon, PaperAirplaneIcon, XIcon } from './icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

// The base URL of the Railway backend is the only env var needed here – no API key.
const BASE_URL = import.meta.env.VITE_BASE_URL || '';

// ---------------------------------------------------------------------------
// Message renderer – parses basic markdown lists / bold / italic
// ---------------------------------------------------------------------------
const ChatMessageContent: React.FC<{ text: string }> = ({ text }) => {
    const formatText = (inputText: string) =>
        inputText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .split('\n')
            .join('<br />');

    const lines = text.split('\n');
    const intro: string[] = [];
    const listItems: string[] = [];
    let isListStarted = false;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
            isListStarted = true;
            listItems.push(trimmed.replace(/^(\*\s|-\s|\d+\.\s)/, ''));
        } else if (!isListStarted) {
            intro.push(line);
        }
    });

    if (listItems.length > 0) {
        return (
            <div className="text-left space-y-2">
                {intro.length > 0 && <p dangerouslySetInnerHTML={{ __html: formatText(intro.join('\n')) }} />}
                <ul className="list-disc list-outside pl-4 space-y-1.5">
                    {listItems.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: formatText(item) }} />
                    ))}
                </ul>
            </div>
        );
    }

    return <p className="text-left whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formatText(text) }} />;
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
}

// ---------------------------------------------------------------------------
// AIChatbot component
// ---------------------------------------------------------------------------
const AIChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            text: "Hello! I'm your NIT Campuz AI Assistant. I can help you navigate the portal and understand academic workflows. How can I help you today?",
            sender: 'bot',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const user = useSelector(selectUser);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    // Build a lean history array for the backend (skip error/system messages)
    const buildHistory = () =>
        messages
            .filter(m => !m.text.includes('trouble connecting') && !m.text.includes('encountered an error'))
            .map(m => ({ role: m.sender === 'user' ? 'user' : 'bot', text: m.text }));

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Retrieve the JWT from localStorage (same way the rest of the app uses it)
            const token = localStorage.getItem('lms_token');

            const response = await fetch(`${BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Attach the JWT so the backend can verify the user and know their role
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message: input,
                    history: buildHistory(),
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Unknown server error' }));
                throw new Error(err.message || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
        } catch (error) {
            console.error('AI Chatbot Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setMessages(prev => [
                ...prev,
                {
                    text: `I'm having trouble connecting to my brain right now. Error: ${errorMessage}. Please try again shortly.`,
                    sender: 'bot',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating toggle button */}
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    aria-label={isOpen ? 'Close chat' : 'Open chat'}
                    aria-expanded={isOpen}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div
                            key={isOpen ? 'x' : 'chat'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isOpen ? <XIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Chat window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-28 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8.5rem)] bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl flex flex-col z-50 origin-bottom-right"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <header className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-center text-slate-900">AI Assistant ({user?.role})</h3>
                        </header>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-sm text-slate-600 h-full flex items-center justify-center">
                                    <p>Ask me anything about your dashboard!</p>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`p-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${
                                            msg.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-lg'
                                                : 'bg-slate-200 text-slate-900 rounded-bl-lg'
                                        }`}
                                    >
                                        <ChatMessageContent text={msg.text} />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="p-3 rounded-2xl bg-slate-200 rounded-bl-lg">
                                        <div className="flex items-center space-x-1.5">
                                            <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 border-t border-gray-200 flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask something..."
                                className="flex-1 w-full px-4 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                                disabled={isLoading}
                            />
                            <Button onClick={handleSend} disabled={isLoading} className="!p-2.5">
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;