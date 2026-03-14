import { Request, Response } from 'express';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const books = await prisma.book.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, author, bookUrl, imageUrl } = req.body;
        const userRole = (req as any).user?.role;

        if (userRole !== UserRole.STAFF && userRole !== UserRole.HOD && userRole !== UserRole.ADMIN) {
            res.status(403).json({ message: 'Only staff can add books to the library' });
            return;
        }

        if (!title || !author || !bookUrl || !imageUrl) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const newBook = await prisma.book.create({
            data: { title, author, bookUrl, imageUrl }
        });

        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userRole = (req as any).user?.role;

        if (userRole !== UserRole.STAFF && userRole !== UserRole.HOD && userRole !== UserRole.ADMIN) {
            res.status(403).json({ message: 'Only staff can delete books from the library' });
            return;
        }

        await prisma.book.delete({
            where: { id: id as string }
        });

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
