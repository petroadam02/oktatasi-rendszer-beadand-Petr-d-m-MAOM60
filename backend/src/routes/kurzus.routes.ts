import { Router, Request, Response } from "express";
import { KurzusService } from "../services/kurzus.service";
import { FelvettKurzusService } from "../services/felvettKurzus.service";

export const kurzusRouter = Router();
const kurzusService = new KurzusService();
const felvettKurzusService = new FelvettKurzusService();

kurzusRouter.get("/:kurzusId/felvett-hallgatok", async (req: Request, res: Response) => {
    try {
        const kurzusId = parseInt(req.params.kurzusId, 10);
        if (isNaN(kurzusId)) {
            res.status(400).json({ message: "Érvénytelen kurzus ID." });
            return;
        }
        const felvettHallgatok = await felvettKurzusService.getKurzusHallgatoi(kurzusId);
        res.json(felvettHallgatok);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        res.status(500).json({ message: "Hiba a kurzusra felvett hallgatók lekérdezése közben.", error: message });
    }
});

kurzusRouter.get("/", async (req: Request, res: Response) => {
    try {
        const kurzusok = await kurzusService.getAll();
        res.json(kurzusok);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        res.status(500).json({ message: "Hiba a kurzusok lekérdezése közben.", error: message });
    }
});

kurzusRouter.post("/:kurzusId/hallgatok", async (req: Request, res: Response) => {
    try {
        const kurzusId = parseInt(req.params.kurzusId, 10);
        const { hallgatoId } = req.body;

        if (isNaN(kurzusId) || hallgatoId === undefined) {
            res.status(400).json({ message: "Érvénytelen kurzus ID vagy hiányzó hallgató ID." });
            return;
        }
        if (typeof hallgatoId !== 'number' || !Number.isInteger(hallgatoId)) {
            res.status(400).json({ message: "A hallgatoId számnak kell lennie."});
            return;
        }

        const felvetel = await felvettKurzusService.hallgatoFelveteleKurzusra({kurzusId, hallgatoId });
        res.status(201).json(felvetel);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        // Ha a service dobja a hibát (pl. "már felvette"), az is ide kerül
        if (message.includes("nem található") || message.includes("már felvette") || message.includes("betelt")) {
            res.status(400).json({ message: "Hiba a hallgató kurzusra való felvétele közben.", error: message });
        } else {
            res.status(500).json({ message: "Szerverhiba a hallgató kurzusra való felvétele közben.", error: message });
        }
    }
});

kurzusRouter.post("/", async (req: Request, res: Response) => {
    try {
        const { kurzusKod, kurzusNev, maxLetszam, targyId, oktatoId } = req.body;
        if (!kurzusKod || maxLetszam === undefined || targyId === undefined || oktatoId === undefined) {
            res.status(400).json({ message: "A 'kurzusKod', 'maxLetszam', 'targyId' és 'oktatoId' mezők kitöltése kötelező." });
            return;
        }
        if (typeof maxLetszam !== 'number' || !Number.isInteger(maxLetszam) || maxLetszam < 0 ||
            typeof targyId !== 'number' || !Number.isInteger(targyId) ||
            typeof oktatoId !== 'number' || !Number.isInteger(oktatoId)) {
            res.status(400).json({ message: "Érvénytelen adat típusok."});
            return;
        }

        const ujKurzus = await kurzusService.create({ kurzusKod, kurzusNev, maxLetszam, targyId, oktatoId });
        res.status(201).json(ujKurzus);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        if (message.includes("nem létezik")) { // Specifikusabb hiba a service-ből
            res.status(400).json({ message: "Hiba a kurzus létrehozása közben.", error: message });
        } else {
            res.status(500).json({ message: "Hiba a kurzus létrehozása közben.", error: message });
        }
    }
});

kurzusRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID."});
            return;
        }
        const kurzus = await kurzusService.getById(id);
        if (kurzus) {
            res.json(kurzus);
        } else {
            res.status(404).json({ message: "Kurzus nem található." });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        res.status(500).json({ message: "Hiba a kurzus lekérdezése közben.", error: message });
    }
});

kurzusRouter.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID."});
            return;
        }
        const frissitettKurzus = await kurzusService.update(id, req.body);
        if (frissitettKurzus) {
            res.json(frissitettKurzus);
        } else {
            res.status(404).json({ message: "Kurzus nem található a frissítéshez." });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        if (message.includes("nem létezik")) { // Specifikusabb hiba a service-ből
            res.status(400).json({ message: "Hiba a kurzus frissítése közben.", error: message });
        } else {
            res.status(500).json({ message: "Hiba a kurzus frissítése közben.", error: message });
        }
    }
});

kurzusRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID."});
            return;
        }
        
        await kurzusService.delete(id);
        res.status(204).send();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        console.error(`Hiba a DELETE /api/kurzusok/${req.params.id} során:`, message); 
        if (message.includes("nem törölhető, mert hallgatók vannak hozzá felvéve")) {
            res.status(409).json({ message: "A törlés sikertelen.", error: message });
        } else if (message.includes("nem található")) { 
            res.status(404).json({ message: "A törlés sikertelen: Kurzus nem található.", error: message });
        }
         else {
            res.status(500).json({ message: "Hiba a kurzus törlése közben.", error: message });
        }
    }
});