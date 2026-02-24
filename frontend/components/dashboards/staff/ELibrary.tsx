

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { SearchIcon } from '../../icons/Icons';
import { BOOKS } from '../../../constants';
import { motion } from 'framer-motion';

const ELibrary: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const categories = useMemo(() => [...new Set(BOOKS.map(b => b.category))], []);
    
    const filteredBooks = useMemo(() => {
        return BOOKS.filter(book => {
            const searchMatch = searchTerm === '' || 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                book.author.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter === '' || book.category === categoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [searchTerm, categoryFilter]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">E-Library</h1>
                <p className="text-gray-500">Access a wide range of digital books and resources.</p>
            </div>
            
            <Card className="overflow-visible">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative">
                            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                                placeholder="Search by title or author..."
                                className="pl-11"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger><SelectValue placeholder="Filter by category..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Categories</SelectItem>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredBooks.map(book => (
                    <motion.div 
                        key={book.id} 
                        className="space-y-2 group cursor-pointer"
                        whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
                    >
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-gray-800 truncate">{book.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{book.author}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ELibrary;
