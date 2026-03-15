import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { SearchIcon, ExternalLinkIcon } from '../../icons/Icons';
import { selectAllBooks, fetchBooksRequest } from '../../../store/slices/appSlice';
import { motion } from 'framer-motion';

const StudentLibrary: React.FC = () => {
    const dispatch = useDispatch();
    const books = useSelector(selectAllBooks);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchBooksRequest());
    }, [dispatch]);

    const filteredBooks = useMemo(() => {

        return books.filter(book => {
            const searchMatch = searchTerm === '' || 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                book.author.toLowerCase().includes(searchTerm.toLowerCase());
            return searchMatch;
        });
    }, [searchTerm, books]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">E-Library</h1>
                <p className="text-slate-500">Access a wide range of digital books and resources.</p>
            </div>
            
            <Card className="border-none shadow-sm bg-slate-50/50">
                <CardContent className="pt-6">
                    <div className="relative">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                            placeholder="Search by title or author..."
                            className="pl-11 bg-white border-slate-200 focus:ring-indigo-500 rounded-xl py-6"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
                        <motion.div 
                            key={book.id} 
                            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            whileHover={{ y: -5 }}
                        >
                            <div className="aspect-[3/4] overflow-hidden relative">
                                <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a 
                                        href={book.bookUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white rounded-full text-indigo-600 shadow-xl hover:scale-110 transition-transform"
                                    >
                                        <ExternalLinkIcon className="w-6 h-6" />
                                    </a>
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
                        <p className="text-slate-500">Try adjusting your search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentLibrary;
