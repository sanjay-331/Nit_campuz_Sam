import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { AcademicCapIcon, BookOpenIcon, LifebuoyIcon, UsersIcon, ChevronDownIcon, QuestionMarkIcon, EnvelopeIcon, PhoneIcon } from '../components/icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const HelpPage: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const helpSections = [
        {
            title: "Getting Started",
            icon: <AcademicCapIcon className="w-8 h-8 text-blue-500" />,
            content: "Welcome to NIT Campuz! This platform is designed to streamline institutional management. Use the sidebar to navigate between your dashboard, grades, and resources."
        },
        {
            title: "Leave & OD",
            icon: <UsersIcon className="w-8 h-8 text-indigo-500" />,
            content: "Need to take a leave or apply for On-Duty? Visit the 'Leave / OD' section. You can submit new requests and track the approval status in real-time."
        },
        {
            title: "Academic Records",
            icon: <BookOpenIcon className="w-8 h-8 text-emerald-500" />,
            content: "Access your grades, attendance, and study materials easily. If you notice any discrepancies, please reach out to your department advisor."
        },
        {
            title: "Technical Support",
            icon: <LifebuoyIcon className="w-8 h-8 text-rose-500" />,
            content: "Facing technical issues or login problems? Our support team is here to help you 24/7. Check our FAQs or contact us directly below."
        }
    ];

    const faqs = [
        {
            q: "How do I update my profile information?",
            a: "Go to your Profile page by clicking your avatar in the top right. Click on 'Edit Profile' to change your name, phone number, or address."
        },
        {
            q: "Where can I find my semester marksheet?",
            a: "In the 'Grades' section, you can view your current results and download official marksheets for previous semesters."
        },
        {
            q: "What should I do if my attendance is incorrect?",
            a: "Attendance is updated daily by staff. If you find an error, please contact your course instructor or department HOD immediately."
        },
        {
            q: "How do I apply for OD for an external event?",
            a: "Use the 'Leave / OD' form. Select 'OD' as the type, provide the event details in the reason field, and upload any necessary invitation letters if required."
        }
    ];

    return (
        <div className="space-y-12 max-w-5xl mx-auto py-6">
            <header className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider"
                >
                    <LifebuoyIcon className="w-4 h-4" /> Support Center
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">How can we help?</h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto italic">Search our knowledge base or reach out to our dedicated support team.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {helpSections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="h-full border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="p-4 bg-slate-50 rounded-2xl mb-4 group-hover:bg-white group-hover:shadow-inner transition-colors">
                                    {section.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{section.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{section.content}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <QuestionMarkIcon className="w-6 h-6 text-indigo-500" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <button 
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-slate-800">{faq.q}</span>
                                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-50 italic">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <EnvelopeIcon className="w-6 h-6 text-blue-500" />
                        Contact Us
                    </h2>
                    <Card className="border-indigo-100 shadow-lg shadow-indigo-100/50 bg-gradient-to-br from-white to-indigo-50/30">
                        <CardContent className="p-6 space-y-5">
                            <p className="text-xs font-medium text-slate-500">Submit a ticket and our team will get back to you within 24 hours.</p>
                            <div className="space-y-4">
                                <Input placeholder="Subject" className="bg-white border-slate-200" />
                                <textarea 
                                    placeholder="Describe your issue..." 
                                    className="w-full h-32 p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                                />
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 shadow-md shadow-indigo-100">Send Message</Button>
                            </div>
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                                    +91 12345 67890
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                    <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                                    support@nitcampuz.edu
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
