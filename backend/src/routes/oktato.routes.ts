import { Router, Request, Response } from "express";
import { OktatoService } from "../services/oktato.service";
// Validációhoz később pl. class-validator-t

export const oktatoRouter = Router();
const oktatoService = new OktatoService();

// GET /api/oktatok - Összes oktató listázása
oktatoRouter.get("/", async (req: Request, res: Response) => {
    try {
        const oktatok = await oktatoService.getAll();
        res.json(oktatok);
    } catch (error: any) {
        res.status(500).json({ message: "Hiba az oktatók lekérdezése közben", error: error.message });
    }
});

// POST /api/oktatok - Új oktató létrehozása
oktatoRouter.post("/", async (req: Request, res: Response) => {
    try {
        const { nev, tanszek } = req.body;
        if (!nev) {
            res.status(400).json({ message: "A 'nev' mező kitöltése kötelező." });
            return; // <--- Módosítás: Külön return; a válasz elküldése után
        }
        const ujOktato = await oktatoService.create({ nev, tanszek });
        res.status(201).json(ujOktato);
    } catch (error: any) {
        res.status(500).json({ message: "Hiba az oktató létrehozása közben", error: error.message });
    }
});

// GET /api/oktatok/:id - Egy oktató lekérdezése ID alapján
oktatoRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const oktato = await oktatoService.getById(id);
        if (oktato) {
            res.json(oktato);
        } else {
            res.status(404).json({ message: "Oktató nem található." });
        }
    } catch (error: any) {
        res.status(500).json({ message: "Hiba az oktató lekérdezése közben", error: error.message });
    }
});


// PUT /api/oktatok/:id - Oktató frissítése
oktatoRouter.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const frissitettOktato = await oktatoService.update(id, req.body);
        if (frissitettOktato) {
            res.json(frissitettOktato);
        } else {
            res.status(404).json({ message: "Oktató nem található a frissítéshez." });
        }
    } catch (error: any) {
        res.status(500).json({ message: "Hiba az oktató frissítése közben", error: error.message });
    }
});

// DELETE /api/oktatok/:id - Oktató törlése
// ... (meglévő importok) ...

// DELETE /api/oktatok/:id - Oktató törlése
oktatoRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID formátum."});
            return;
        }
        
        await oktatoService.delete(id);
        res.status(204).send(); // Sikeres törlés, nincs tartalom
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        if (message.includes("nem törölhető, mert aktív kurzusok vannak hozzárendelve")) {
            res.status(409).json({ message: "A törlés sikertelen.", error: message }); // 409 Conflict
        } else if (message.includes("Oktató nem található")) {
            res.status(404).json({ message: "A törlés sikertelen.", error: message }); // Ha a service dobja ezt
        }
         else {
            res.status(500).json({ message: "Hiba az oktató törlése közben.", error: message });
        }
    }
});

// GET /api/oktatok/:oktatoId/targyak
oktatoRouter.get("/:oktatoId/targyak", async (req: Request, res: Response) => {
    try {
        const oktatoId = parseInt(req.params.oktatoId, 10);
        if (isNaN(oktatoId)) {
            res.status(400).json({ message: "Érvénytelen oktató ID." });
            return;
        }

        const targyak = await oktatoService.getOktatottTargyak(oktatoId);
        res.json(targyak);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        if (message.includes("Oktató nem található")) {
            res.status(404).json({ message: "Hiba az oktató tárgyainak lekérdezése közben.", error: message });
        } else {
            res.status(500).json({ message: "Hiba az oktató tárgyainak lekérdezése közben.", error: message });
        }
    }
});