import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error(`[Error] ${err.name}: ${err.message}`);
    
    if (err.stack) {
        console.error(err.stack);
    }

    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
