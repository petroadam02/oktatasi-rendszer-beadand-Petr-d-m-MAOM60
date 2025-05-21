import { Router, Request, Response } from "express";
import { HallgatoService } from "../services/hallgato.service";
import { FelvettKurzusService } from "../services/felvettKurzus.service";

export const hallgatoRouter = Router();
const hallgatoService = new HallgatoService();
const felvettKurzusService = new FelvettKurzusService();

hallgatoRouter.get("/", async (req: Request, res: Response) => {
    try {
        const hallgatok = await hallgatoService.getAll();
        res.json(hallgatok);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba történt";
        res.status(500).json({ message: "Hiba a hallgatók lekérdezése közben", error: message });
    }
});

hallgatoRouter.get("/:hallgatoId/kurzusok", async (req: Request, res: Response) => {
    try {
        const hallgatoId = parseInt(req.params.hallgatoId, 10);
        if (isNaN(hallgatoId)) {
            res.status(400).json({ message: "Érvénytelen hallgató ID." });
            return;
        }

        // Ellenőrizzük, hogy létezik-e a hallgató (opcionális, de jó gyakorlat)
        const hallgato = await hallgatoService.getById(hallgatoId);
        if (!hallgato) {
            res.status(404).json({ message: "Hallgató nem található." });
            return;
        }

        const felvettKurzusok = await felvettKurzusService.getHallgatoKurzusai(hallgatoId);
        res.json(felvettKurzusok);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        res.status(500).json({ message: "Hiba a hallgató kurzusainak lekérdezése közben.", error: message });
    }
});

hallgatoRouter.post("/", async (req: Request, res: Response) => {
    try {
        const { nev, tritonKod, email, tankor } = req.body;
        if (!nev || !tritonKod || !email || !tankor) {
            res.status(400).json({ message: "A 'nev', 'tritonKod', 'email' és 'tankor' mezők kitöltése kötelező." });
            return;
        }
        if (typeof tritonKod !== 'string' || tritonKod.length !== 6) {
            res.status(400).json({ message: "A Triton kódnak pontosan 6 karakter hosszúnak kell lennie." });
            return;
        }

        const ujHallgato = await hallgatoService.create({ nev, tritonKod, email, tankor });
        res.status(201).json(ujHallgato);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba történt";
        if (message.includes("UNIQUE constraint failed") || (error as any)?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
             res.status(409).json({ message: "Hiba a hallgató létrehozása közben: A Triton kód vagy az email cím már létezik.", error: message });
        } else {
             res.status(500).json({ message: "Hiba a hallgató létrehozása közben", error: message });
        }
    }
});

hallgatoRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID formátum."});
            return;
        }
        const hallgato = await hallgatoService.getById(id);
        if (hallgato) {
            res.json(hallgato);
        } else {
            res.status(404).json({ message: "Hallgató nem található." });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba történt";
        res.status(500).json({ message: "Hiba a hallgató lekérdezése közben", error: message });
    }
});

hallgatoRouter.put("/:id", async (req: Request, res: Response) => {
    console.log(`PUT /api/hallgatok/${req.params.id} kérés érkezett.`);
    console.log('Kérés Body:', req.body);
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            console.error('Érvénytelen ID formátum a PUT kérésben.');
            res.status(400).json({ message: "Érvénytelen ID formátum."});
            return;
        }
        
        const { nev, tritonKod, email, tankor } = req.body;

        if (tritonKod !== undefined) { 
            if (typeof tritonKod !== 'string' || tritonKod.length !== 6) {
                res.status(400).json({ message: "A Triton kódnak pontosan 6 karakter hosszúnak kell lennie, ha meg van adva." });
                return;
            }
        }
        
        if (email !== undefined && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
            res.status(400).json({ message: "Érvénytelen email formátum, ha meg van adva." });
            return;
        }

        const frissitettHallgato = await hallgatoService.update(id, req.body); 
        
        if (frissitettHallgato) {
            console.log(`Hallgató (ID: ${id}) sikeresen frissítve.`);
            res.json(frissitettHallgato);
        } else {
            console.warn(`Hallgató (ID: ${id}) nem található a frissítéshez, vagy nem történt módosítás.`);
            res.status(404).json({ message: "Hallgató nem található a frissítéshez, vagy nem történt módosítás." });
        }
    } catch (error: unknown) {
        console.error(`Hiba történt a PUT /api/hallgatok/${req.params.id} feldolgozása közben:`, error);
        const message = error instanceof Error ? error.message : "Ismeretlen szerverhiba.";
        
        if (message.includes("UNIQUE constraint failed") || (error as any)?.code === 'SQLITE_CONSTRAINT_UNIQUE' || (error as any)?.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
             res.status(409).json({ message: "Hiba a hallgató frissítése közben: A Triton kód vagy az email cím már létezik egy másik hallgatónál.", error: message });
        } else {
             res.status(500).json({ message: "Hiba a hallgató frissítése közben.", error: message });
        }
    }
});

hallgatoRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID formátum."});
            return;
        }

        await hallgatoService.delete(id);
        res.status(204).send();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        if (message.includes("nem törölhető, mert kurzusokra van felvéve")) {
            res.status(409).json({ message: "A törlés sikertelen.", error: message });
        } else {
            res.status(500).json({ message: "Hiba a hallgató törlése közben.", error: message });
        }
    }
});

hallgatoRouter.get("/:hallgatoId/atlag", async (req: Request, res: Response) => {
    try {
        const hallgatoId = parseInt(req.params.hallgatoId, 10);
        if (isNaN(hallgatoId)) {
            res.status(400).json({ message: "Érvénytelen hallgató ID." });
            return;
        }

        // Ellenőrizzük, hogy létezik-e a hallgató
        const hallgato = await hallgatoService.getById(hallgatoId);
        if (!hallgato) {
            res.status(404).json({ message: "Hallgató nem található." });
            return;
        }

        const statisztika = await felvettKurzusService.getHallgatoAtlag(hallgatoId);
        res.json(statisztika);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        res.status(500).json({ message: "Hiba a hallgató átlagának lekérdezése közben.", error: message });
    }
});