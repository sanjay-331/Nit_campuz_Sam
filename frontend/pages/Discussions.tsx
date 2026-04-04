import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllDiscussions, fetchDiscussionsRequest, createDiscussionRequest } from '../store/slices/appSlice';
import { selectUser } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, 
    Plus, 
    User, 
    Clock, 
    MessageCircle, 
    Send, 
    X,
    Filter,
    Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Discussions: React.FC = () => {
    const dispatch = useDispatch();
    const discussions = useSelector(selectAllDiscussions);
    const currentUser = useSelector(selectUser);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchDiscussionsRequest());
    }, [dispatch]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            dispatch(createDiscussionRequest({ title, content }));
            setTitle('');
            setContent('');
            setIsModalOpen(false);
        }
    };

    const filteredDiscussions = discussions.filter(d => 
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-indigo-600" />
                        Campus Discussions
                    </h1>
                    <p className="text-slate-500 mt-1">Connect, share, and discuss with the community</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 text-sm font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    Start Discussion
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search discussions..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-medium transition-colors text-sm">
                        <Filter className="w-4 h-4" />
                        Latest
                    </button>
                </div>
            </div>

            {/* Discussions List */}
            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredDiscussions.map((discussion, idx) => (
                        <motion.div
                            key={discussion.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {discussion.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="font-medium text-slate-700">{discussion.author?.name || 'Unknown User'}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(discussion.createdAt))} ago
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed line-clamp-3">
                                        {discussion.content}
                                    </p>
                                    <div className="flex items-center gap-6 pt-2">
                                        <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                                            <MessageCircle className="w-4 h-4" />
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredDiscussions.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <MessageCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900">No discussions found</h3>
                        <p className="text-slate-500 mt-2">Be the first to start a conversation!</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                                <h2 className="text-xl font-bold text-slate-800">New Discussion</h2>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Title</label>
                                    <input 
                                        autoFocus
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="What's on your mind?"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Content</label>
                                    <textarea 
                                        rows={6}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Describe your topic in detail..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={!title.trim() || !content.trim()}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-semibold"
                                    >
                                        <Send className="w-4 h-4" />
                                        Post Discussion
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Discussions;
