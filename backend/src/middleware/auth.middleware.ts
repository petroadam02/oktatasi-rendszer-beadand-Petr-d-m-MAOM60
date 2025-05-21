import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../entity/User'; 

declare global {
    namespace Express {
        interface Request {
            user?: any; 
        }
    }
}

export interface AuthMiddlewareOptions {
    requiredRole?: UserRole;
}

export function authMiddleware(options?: AuthMiddlewareOptions) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ message: 'Hiányzó autentikációs fejléc.' });
            return; 
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            res.status(401).json({ message: 'Hibás autentikációs fejléc formátum. "Bearer <token>" várt.' });
            return; 
        }

        const token = parts[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET nincs beállítva a .env fájlban a middleware számára!");
            res.status(500).json({ message: "Szerver oldali konfigurációs hiba." });
            return; 
        }

        try {
            const decoded = jwt.verify(token, secret) as any; // Típuskonverzió 'any'-ra, vagy egy Payload interfészre
            req.user = decoded;

            if (options && options.requiredRole) {
                if (!decoded.role || decoded.role !== options.requiredRole) {
                    res.status(403).json({ message: 'Nincs megfelelő jogosultságod a művelethez.' });
                    return; 
                }
            }
            next();
        } catch (err: any) { // jwt.verify hibáját itt kapjuk el szinkron módon, ha a callback-et nem használjuk
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'A token lejárt.' });
                return;
            }
            res.status(401).json({ message: 'Érvénytelen token.' });
            return;
        }
    };
}