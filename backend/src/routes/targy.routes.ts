import { Router, Request, Response } from "express";
import { TargyService } from "../services/targy.service";

export const targyRouter = Router();
const targyService = new TargyService();

targyRouter.get("/", async (req: Request, res: Response) => {
    try {
        const targyak = await targyService.getAll();
        res.json(targyak);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba történt";
        res.status(500).json({ message: "Hiba a tárgyak lekérdezése közben", error: message });
    }
});

targyRouter.post("/", async (req: Request, res: Response) => {
    try {
        const { nev, kod, kredit } = req.body;
        if (!nev || !kod || kredit === undefined) { // kredit lehet 0 is, ezért undefined-ot ellenőrzünk
            res.status(400).json({ message: "A 'nev', 'kod' és 'kredit' mezők kitöltése kötelező." });
            return;
        }
        if (typeof kredit !== 'number' || !Number.isInteger(kredit) || kredit < 0) {
            res.status(400).json({ message: "A 'kredit' mezőnek pozitív egész számnak kell lennie." });
            return;
        }

        // Opcionális: Tárgykód egyediségének ellenőrzése itt, a service előtt
        const existingTargy = await targyService.getByKod(kod);
        if (existingTargy) {
            res.status(409).json({ message: `Már létezik tárgy '${kod}' kóddal.`}); // 409 Conflict
            return;
        }

        const ujTargy = await targyService.create({ nev, kod, kredit });
        res.status(201).json(ujTargy);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba történt";
        res.status(500).json({ message: "Hiba a tárgy létrehozása közben", error: message });
    }
});

targyRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID formátum."});
            return;
        }
        const targy = await targyService.getById(id);
        if (targy) {
            res.json(targy);
        } else {
            res.status(404).json({ message: "Tárgy nem található." });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba történt";
        res.status(500).json({ message: "Hiba a tárgy lekérdezése közben", error: message });
    }
});

targyRouter.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID formátum."});
            return;
        }
        // Validáció a req.body mezőire itt is hasznos lenne
        const { nev, kod, kredit } = req.body;
        if (kredit !== undefined && (typeof kredit !== 'number' || !Number.isInteger(kredit) || kredit < 0)) {
            res.status(400).json({ message: "A 'kredit' mezőnek pozitív egész számnak kell lennie, ha meg van adva." });
            return;
        }

        // Ha a tárgykódot is engedném módosítani, az egyediséget itt is ellenőrizni kellene,
        // és figyelni, hogy nem ütközik-e MÁSIK tárgy kódjával.
        // const targyToUpdate = await targyService.getById(id);
        // if (!targyToUpdate) {
        //     return res.status(404).json({ message: "Frissítendő tárgy nem található." });
        // }
        // if (kod && kod !== targyToUpdate.kod) {
        //     const existingTargyWithNewKod = await targyService.getByKod(kod);
        //     if (existingTargyWithNewKod) {
        //         return res.status(409).json({ message: `Már létezik másik tárgy '${kod}' kóddal.` });
        //     }
        // }


        const frissitettTargy = await targyService.update(id, { nev, kod, kredit });
        if (frissitettTargy) {
            res.json(frissitettTargy);
        } else {
            res.status(404).json({ message: "Tárgy nem található a frissítéshez." });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba történt";
        res.status(500).json({ message: "Hiba a tárgy frissítése közben", error: message });
    }
});

targyRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Érvénytelen ID formátum."});
            return;
        }

        await targyService.delete(id);
        res.status(204).send();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        if (message.includes("nem törölhető, mert aktív kurzusok vannak hozzárendelve")) {
            res.status(409).json({ message: "A törlés sikertelen.", error: message });
        } else {
            res.status(500).json({ message: "Hiba a tárgy törlése közben.", error: message });
        }
    }
});