import { Request, Response } from 'express';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

export const getAllDiscussions = async (req: Request, res: Response): Promise<void> => {
    try {
        const discussions = await prisma.discussion.findMany({
            include: {
                author: {
                    select: {
                        name: true,
                        role: true,
                        designation: true,
                        department: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createDiscussion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content } = req.body;
        const authorId = (req as any).user.id;

        if (!title || !content) {
            res.status(400).json({ message: 'Title and content are required' });
            return;
        }

        const newDiscussion = await prisma.discussion.create({
            data: {
                title,
                content,
                authorId
            },
            include: {
                author: {
                    select: {
                        name: true,
                        role: true,
                        designation: true,
                        department: true
                    }
                }
            }
        });

        res.status(201).json(newDiscussion);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteDiscussion = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const currentUser = (req as any).user;

        const discussion = await prisma.discussion.findUnique({ where: { id } });

        if (!discussion) {
            res.status(404).json({ message: 'Discussion not found' });
            return;
        }

        // Only author or admin/HOD can delete
        if (discussion.authorId !== currentUser.id && currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.HOD) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        await prisma.discussion.delete({ where: { id } });
        res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
