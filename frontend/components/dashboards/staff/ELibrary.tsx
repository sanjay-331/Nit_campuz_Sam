import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Input } from '../../ui/Input';
import Button from '../../ui/Button';
import { SearchIcon, PlusIcon, TrashIcon, ExternalLinkIcon } from '../../icons/Icons';
import { selectAllBooks, addBookRequest, deleteBookRequest, fetchBooksRequest } from '../../../store/slices/appSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../ui/Dialog';

const ELibrary: React.FC = () => {
    const dispatch = useDispatch();
    const books = useSelector(selectAllBooks);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

    useEffect(() => {
        dispatch(fetchBooksRequest());
    }, [dispatch]);
    
    const [newBook, setNewBook] = useState<Omit<Book, 'id'>>({
        title: '',
        author: '',
        bookUrl: '', // Will treat as Image link based on user's feedback
        imageUrl: '' // Will treat as PDF link based on user's feedback
    });

    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const searchMatch = searchTerm === '' || 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                book.author.toLowerCase().includes(searchTerm.toLowerCase());
            return searchMatch;
        });
    }, [searchTerm, books]);

    const handleAddBook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBook.title || !newBook.author || !newBook.bookUrl || !newBook.imageUrl) return;
        dispatch(addBookRequest(newBook));
        setNewBook({ title: '', author: '', bookUrl: '', imageUrl: '' });
        setIsAddModalOpen(false);
    };

    const confirmDeleteBook = () => {
        if (bookToDelete) {
            dispatch(deleteBookRequest(bookToDelete.id));
            setBookToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">E-Library Management</h1>
                    <p className="text-slate-500">Manage digital books and resources for students.</p>
                </div>
                <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add New Book
                </Button>
            </div>
            
            <Card className="border-none shadow-sm bg-slate-50/50">
                <CardContent className="pt-6">
                    <div className="relative">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                            placeholder="Search library by title or author..."
                            className="pl-11 bg-white border-slate-200 focus:ring-indigo-500 rounded-xl py-6"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Book</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-slate-800">{bookToDelete?.title}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setBookToDelete(null)}>Cancel</Button>
                        <Button 
                            className="bg-red-500 hover:bg-red-600 text-white" 
                            onClick={confirmDeleteBook}
                        >
                            Delete Book
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg"
                        >
                            <Card className="border-none shadow-2xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Add New Book</CardTitle>
                                        <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                            <PlusIcon className="w-6 h-6 rotate-45" />
                                        </button>
                                    </div>
                                    <CardDescription>Fill in the details to add a book to the e-library.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAddBook} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Book Title</label>
                                            <Input 
                                                required
                                                placeholder="e.g. Clean Code"
                                                value={newBook.title}
                                                onChange={e => setNewBook({...newBook, title: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Author Name</label>
                                            <Input 
                                                required
                                                placeholder="e.g. Robert C. Martin"
                                                value={newBook.author}
                                                onChange={e => setNewBook({...newBook, author: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Cover Image URL</label>
                                                <Input 
                                                    required
                                                    type="url"
                                                    placeholder="https://example.com/cover.jpg"
                                                    value={newBook.imageUrl}
                                                    onChange={e => setNewBook({...newBook, imageUrl: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Book PDF/Link</label>
                                                <Input 
                                                    required
                                                    type="url"
                                                    placeholder="https://example.com/book.pdf"
                                                    value={newBook.bookUrl}
                                                    onChange={e => setNewBook({...newBook, bookUrl: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 flex gap-3">
                                            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                                                Add Book
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
                        <motion.div 
                            key={book.id} 
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-[3/4] overflow-hidden relative">
                                <a href={book.bookUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                    <img src={book.bookUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </a>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-end justify-between p-4">
                                    <div className="flex gap-2 pointer-events-auto">
                                        <a 
                                            href={book.imageUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors"
                                            title="Open PDF"
                                        >
                                            <ExternalLinkIcon className="w-5 h-5" />
                                        </a>
                                        <button 
                                            onClick={() => setBookToDelete(book)}
                                            className="p-2 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-600 transition-colors shadow-lg"
                                            title="Delete Book"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                                <p className="text-sm text-slate-500">{book.author}</p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="mb-4 inline-flex p-4 bg-slate-100 rounded-full text-slate-400">
                            <SearchIcon className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800">No books found</h3>
                        <p className="text-slate-500">Try adjusting your search term or add a new book.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ELibrary;
