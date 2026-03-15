import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    departmentId?: string | null;
  };
}

import { prisma } from '../db';

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Missing Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Malformed token' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.decode(token, secret);
    
    // Verify user exists in database
    const user = await prisma.user.findUnique({ 
        where: { id: decoded.sub },
        select: { id: true, role: true, departmentId: true }
    });

    if (!user) {
        res.status(401).json({ message: 'Invalid session. User not found.' });
        return;
    }

    req.user = {
      id: user.id,
      role: user.role,
      departmentId: user.departmentId,
    };
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
       res.status(403).json({ message: 'Forbidden. You do not have the required role.' });
       return;
    }
    next();
  };
};
