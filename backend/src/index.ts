import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import 'reflect-metadata'; 
import cors from 'cors';

import { AppDataSource } from './data-source';
import { oktatoRouter } from './routes/oktato.routes';
import { hallgatoRouter } from './routes/hallgato.routes';
import { targyRouter } from './routes/targy.routes';
import { kurzusRouter } from './routes/kurzus.routes';
import { felvettKurzusRouter } from './routes/felvettKurzus.routes';
import { statisztikaRouter } from './routes/statisztika.routes';
import { authRouter } from './routes/auth.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { UserRole } from './entity/User';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// Nem védett autentikációs útvonalak
app.use('/api/auth', authRouter);

// ==== VÉDETT ÚTVONALAK KEZDETE ====
app.use('/api', authMiddleware({ requiredRole: UserRole.ADMIN })); 

// Védett API útvonalak
app.use('/api/oktatok', oktatoRouter);
app.use('/api/hallgatok', hallgatoRouter);
app.use('/api/targyak', targyRouter);
app.use('/api/kurzusok', kurzusRouter);
app.use('/api/felvettkurzusok', felvettKurzusRouter);
app.use('/api/statisztikak', statisztikaRouter);

app.get('/', (req: Request, res: Response) => { // Ez a gyökérútvonal tesztelésre (nem védett)
    res.send('Helló a backend világából! TypeORM csatlakoztatva!');
});

// TypeORM adatforrás inicializálása és szerver indítása
AppDataSource.initialize()
    .then(() => {
        console.log("Adatforrás sikeresen inicializálva!");

        // Csak az adatbázis sikeres inicializálása után indul a szerver
        app.listen(PORT, () => {
            console.log(`A szerver fut a http://localhost:${PORT} címen`);
        });
    })
    .catch((error) => {
        console.error("Hiba az adatforrás inicializálása közben:", error);
    });