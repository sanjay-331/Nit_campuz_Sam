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
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    // Attempt to split the message into an intro and a list if it contains list-like formatting.
    const parts = text.split(/\s\*\s/);

    if (parts.length > 1) {
        const intro = formatText(parts[0]);
        const listItems = parts.slice(1);
        
        let outro = '';
        const lastItemIndex = listItems.length - 1;
        const lastItem = listItems[lastItemIndex];
        
        // Heuristically detect if there's trailing text after the list.
        const outroMatch = lastItem.match(/(.*?)\s+(Would you like to see.*)/s);
        if (outroMatch) {
            listItems[lastItemIndex] = outroMatch[1];
            outro = formatText(outroMatch[2]);
        }

        return (
            <div className="text-left">
                <p dangerouslySetInnerHTML={{ __html: intro }} />
                <ul className="list-disc list-outside pl-4 mt-2 space-y-1.5">
                    {listItems.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: formatText(item.trim()) }} />
                    ))}
                </ul>
                {outro && <p className="mt-2" dangerouslySetInnerHTML={{ __html: outro }} />}
            </div>
        );
    }

    // If no list is detected, render the formatted text as a simple paragraph.
    return <p className="text-left" dangerouslySetInnerHTML={{ __html: formatText(text) }} />;
};


const AIChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'bot' }[]>([
        { text: "Hello! I'm your AI Assistant. How can I help you today?", sender: 'bot' }
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
        switch(role) {
            case UserRole.ADMIN: return "You are an AI assistant for an Admin in a Learning Management System (LMS). You can help manage users, departments, and view activity logs. You cannot execute actions directly but can provide information and guidance on how to perform them. For example, if asked to promote students, explain the steps to do it in the admin dashboard.";
            case UserRole.PRINCIPAL: return "You are an AI assistant for a Principal in an LMS. You can help analyze department performance, view attendance records, and generate reports. You cannot execute actions directly but can provide insights from data.";
            case UserRole.HOD: return "You are an AI assistant for a Head of Department (HOD) in an LMS. You can help monitor student and staff performance within the department. You cannot execute actions directly but can provide specific data points.";
            case UserRole.STAFF: return "You are an AI assistant for a Staff member/teacher in an LMS. You can help with managing attendance, marks, and course materials. You cannot execute actions directly but can answer questions about your students and courses.";
            case UserRole.STUDENT: return "You are an AI assistant and a study buddy for a Student using the LMS. You can help check grades, attendance, and assignment deadlines. You cannot submit assignments but can provide information about them.";
            case UserRole.EXAM_CELL: return "You are an AI assistant for the Exam Cell in an LMS. You can help with managing exam schedules, publishing results, and generating academic reports. You cannot execute actions directly but can provide data and summaries.";
            default: return "You are a helpful AI assistant for an LMS.";
        }
    };

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage = { text: input, sender: 'user' as const };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            let botResponseText = "";
            
            if (!genAI) {
                 // Simulated "Mock Mode" response
                 await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate realistic delay
                 botResponseText = "I'm currently in **Maintenance Mode**. While I can't process complex queries using live AI models right now, I can still provide general information about the NIT Campuz platform. \n\n* **Academic Info:** Check the 'Grades' and 'Attendance' tabs. \n* **Absences:** Use the 'Leave / OD' section. \n* **Admin tasks:** Use the Sidebar for user management.";
            } else {
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-1.5-flash",
                    systemInstruction: getSystemInstruction()
                });
                
                const result = await model.generateContent(input);
                const response = await result.response;
                botResponseText = response.text();
            }
            
            const botResponse = { text: botResponseText, sender: 'bot' as const };
            setMessages([...newMessages, botResponse]);

        } catch (error) {
            console.error("AI Chatbot Error:", error);
            const errorMessage = { 
                text: !API_KEY 
                    ? "The AI Chatbot is currently in 'Mock Mode' because no API Key was found. I can't process your request right now, but I'm here!" 
                    : "Sorry, I'm having trouble connecting right now. Please check your API key or try again later.", 
                sender: 'bot' as const 
            };
            setMessages([...newMessages, errorMessage]);
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