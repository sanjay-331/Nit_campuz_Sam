"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBook = exports.addBook = exports.getAllBooks = void 0;
const db_1 = require("../db");
const client_1 = require("@prisma/client");
const getAllBooks = async (req, res) => {
    try {
        const books = await db_1.prisma.book.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(books);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllBooks = getAllBooks;
const addBook = async (req, res) => {
    try {
        const { title, author, bookUrl, imageUrl } = req.body;
        const userRole = req.user?.role;
        if (userRole !== client_1.UserRole.STAFF && userRole !== client_1.UserRole.HOD && userRole !== client_1.UserRole.ADMIN) {
            res.status(403).json({ message: 'Only staff can add books to the library' });
            return;
        }
        if (!title || !author || !bookUrl || !imageUrl) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const newBook = await db_1.prisma.book.create({
            data: { title, author, bookUrl, imageUrl }
        });
        res.status(201).json(newBook);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.addBook = addBook;
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user?.role;
        if (userRole !== client_1.UserRole.STAFF && userRole !== client_1.UserRole.HOD && userRole !== client_1.UserRole.ADMIN) {
            res.status(403).json({ message: 'Only staff can delete books from the library' });
            return;
        }
        await db_1.prisma.book.delete({
            where: { id: id }
        });
        res.json({ message: 'Book deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteBook = deleteBook;
