import { Router, Request, Response } from "express";
import { FelvettKurzusService } from "../services/felvettKurzus.service";

export const felvettKurzusRouter = Router();
const felvettKurzusService = new FelvettKurzusService();

// Érdemjegy beírása/módosítása egy adott kurzusfelvételhez
// PUT /api/felvettkurzusok/:id
felvettKurzusRouter.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { erdemjegy } = req.body;

        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen kurzusfelvétel ID." });
            return;
        }
        if (erdemjegy === undefined || typeof erdemjegy !== 'number' || !Number.isInteger(erdemjegy)) {
            res.status(400).json({ message: "Az 'erdemjegy' mező megadása kötelező, és egész számnak kell lennie." });
            return;
        }

        const frissitettFelvetel = await felvettKurzusService.erdemjegyBeirasa(id, { erdemjegy });

        if (!frissitettFelvetel) {
            res.status(404).json({ message: "Kurzusfelvétel nem található." });
            return;
        }
        res.json(frissitettFelvetel);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        if (message.includes("1 és 5 közötti")) { // Specifikus validációs hiba
             res.status(400).json({ message: "Hiba az érdemjegy beírása közben.", error: message });
        } else {
             res.status(500).json({ message: "Hiba az érdemjegy beírása közben.", error: message });
        }
    }
});

// GET /api/felvettkurzusok/:id - Egy konkrét felvétel lekérdezése
felvettKurzusRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID." }); // Először küldd a választ
            return;                                              // Majd egy külön return
        }
        const felvettKurzus = await felvettKurzusService.getFelvettKurzusById(id);
        if (felvettKurzus) {
            res.json(felvettKurzus);
        } else {
            // Itt nem kell külön 'return', mert ez az 'else' ág utolsó művelete,
            // és a függvény implicit 'void' visszatérési értékkel zárul ezen az ágon.
            res.status(404).json({ message: "Felvett kurzus nem található." });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        // Itt sem kell külön 'return', mert ez a 'catch' blokk utolsó művelete.
        res.status(500).json({ message: "Hiba a felvett kurzus lekérdezése közben.", error: message });
    }
});