import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { ChatIcon, PaperAirplaneIcon, XIcon } from './icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { UserRole } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Basic check for API key. In a real app, you might want more robust feedback.
if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set. AI Chatbot functionality will be limited to mock responses or error messages.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Renders the AI's message, parsing basic markdown for lists and emphasis.
const ChatMessageContent: React.FC<{ text: string }> = ({ text }) => {
    const formatText = (inputText: string) => {
        return inputText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .split('\n').join('<br />');
    };

    // Detect if the message contains list items (starting with * or - or number)
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


const AIChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'bot' }[]>([
        { text: "Hello! I'm your NIT Campuz AI Assistant. I can help you navigate the portal and understand academic workflows. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector(selectUser);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);
    
    const getSystemInstruction = () => {
        const role = user?.role;
        const base = "You are an AI assistant for the NIT Campuz LMS platform. ";
        const context = "Current User Role: " + role + ". ";
        
        switch(role) {
            case UserRole.ADMIN: return base + context + "You help admins manage users, departments, and promote classes. Explain that user management is in the 'Users' tab, and Promoting classes is in the 'Promote' tab.";
            case UserRole.PRINCIPAL: return base + context + "You help the Principal monitor college performance. Mention the 'Verify Results' section for final mark approvals after HOD verification, and 'Reports' for analytics.";
            case UserRole.HOD: return base + context + "You help the HOD manage their department. Mention the 'Verify Results' section for approving marks from the Exam Cell, and 'Staff' management.";
            case UserRole.STAFF: return base + context + "You help teachers manage students. Mark entry is in 'Marks', and Attendance is in the 'Attendance' tab. Mention that marks go through Exam Cell, HOD, and Principal before publication.";
            case UserRole.STUDENT: return base + context + "You are a study buddy for the student. Help them find 'Grades', 'Attendance', and 'Documents'. If grades aren't showing, explain they might be pending publication by the Exam Cell.";
            case UserRole.EXAM_CELL: return base + context + "You help the Exam Cell with schedules and results. Mention the 'Results' tab where they can verify Staff marks and Publish the final results after Principal approval.";
            default: return base + "You are a helpful assistant for NIT Campuz.";
        }
    };

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage = { text: input, sender: 'user' as const };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            let botResponseText = "";
            
            if (!genAI) {
                 await new Promise(resolve => setTimeout(resolve, 1000));
                 botResponseText = "AI services are currently offline. Please ensure the GEMINI API Key is correctly configured in the platform environment.";
            } else {
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-1.5-flash",
                    systemInstruction: getSystemInstruction()
                });
                
                const result = await model.generateContent(input);
                const response = result.response;
                botResponseText = response.text() || "I received an empty response from the AI service.";
            }
            
            setMessages(prev => [...prev, { text: botResponseText, sender: 'bot' as const }]);

        } catch (error) {
            console.error("AI Chatbot Error:", error);
            setMessages(prev => [...prev, { 
                text: "I encountered an error while processing your request. This could be due to an invalid API key, network issues, or service quotas. Please try again in a moment.", 
                sender: 'bot' as const 
            }]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    aria-label={isOpen ? "Close chat" : "Open chat"}
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
                            {isOpen ? <XIcon className="w-8 h-8"/> : <ChatIcon className="w-8 h-8" />}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>
            </div>

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
                                    <div className={`p-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-slate-200 text-slate-900 rounded-bl-lg'}`}>
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
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask something..."
                                className="flex-1 w-full px-4 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                                disabled={isLoading}
                            />
                            <Button onClick={handleSend} disabled={isLoading} className="!p-2.5">
                                <PaperAirplaneIcon className="w-5 h-5"/>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;