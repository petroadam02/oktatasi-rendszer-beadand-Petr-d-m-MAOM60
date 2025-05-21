import { Router, Request, Response } from "express";
import { FelvettKurzusService } from "../services/felvettKurzus.service";

export const statisztikaRouter = Router();
const felvettKurzusService = new FelvettKurzusService(); // Használjuk ugyanazt a service-t

// GET /api/statisztikak/tankor-atlag?tankor=XYZ
statisztikaRouter.get("/tankor-atlag", async (req: Request, res: Response) => {
    try {
        const tankor = req.query.tankor as string;

        if (!tankor) {
            res.status(400).json({ message: "A 'tankor' lekérdezési paraméter megadása kötelező." });
            return;
        }

        const statisztika = await felvettKurzusService.getTankorAtlag(tankor);
        res.json(statisztika);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        res.status(500).json({ message: "Hiba a tankör átlagának lekérdezése közben.", error: message });
    }
});

// Később ide jöhet a hallgatói átlag végpont is, ha egy helyen akarjuk őket kezelni,
// de az most a hallgato.routes.ts-ben van.