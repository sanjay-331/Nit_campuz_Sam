import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import { AppDispatch, RootState } from '../../../store';
import { fetchDiscussionsRequest, createDiscussionRequest } from '../../../store/slices/appSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, ChatIcon, PlusIcon, TrashIcon } from '../../icons/Icons';
import EmptyState from '../../shared/EmptyState';

const DiscussionForum: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const discussions = useSelector((state: RootState) => state.app.discussions);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        dispatch(fetchDiscussionsRequest());
    }, [dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        dispatch(createDiscussionRequest({ title, content }));
        setTitle('');
        setContent('');
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Faculty Discussion Forum</h1>
                    <p className="text-slate-500">Share ideas, research, and department updates.</p>
                </div>
                <Button 
                    leftIcon={isAdding ? undefined : <PlusIcon className="w-4 h-4"/>} 
                    onClick={() => setIsAdding(!isAdding)}
                    variant={isAdding ? 'secondary' : 'primary'}
                >
                    {isAdding ? 'Cancel' : 'New Topic'}
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="border-indigo-100 bg-indigo-50/30">
                            <CardHeader>
                                <CardTitle>Start a Discussion</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input 
                                        placeholder="Discussion Title" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-white"
                                    />
                                    <textarea 
                                        placeholder="What's on your mind?" 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none min-h-[120px]"
                                    />
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={!title.trim() || !content.trim()}>Post Discussion</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                {discussions.length > 0 ? (
                    discussions.map((discussion: any) => (
                        <Card key={discussion.id} className="hover:shadow-md transition-shadow group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{discussion.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-medium text-indigo-600">{discussion.author?.name}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-xs text-slate-500 font-medium">{discussion.author?.designation || 'Faculty'}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-xs text-slate-500">{new Date(discussion.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {discussion.content}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <EmptyState 
                        title="No Discussions Yet" 
                        message="Be the first to start a conversation in the faculty forum." 
                    />
                )}
            </div>
        </div>
    );
};

export default DiscussionForum;
