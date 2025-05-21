import { AppDataSource } from "../data-source";
import { Oktato } from "../entity/Oktato";
import { Targy } from "../entity/Targy";
import { Repository, FindOneOptions } from "typeorm";

export class OktatoService {
    private oktatoRepository: Repository<Oktato>;

    constructor() {
        this.oktatoRepository = AppDataSource.getRepository(Oktato);
    }

    async getAll(): Promise<Oktato[]> {
        return this.oktatoRepository.find(); // Lekérdezi az összes oktatót
    }

    async getById(id: number): Promise<Oktato | null> {
        return this.oktatoRepository.findOneBy({ id: id });
    }

    // A create metódusnak szüksége lesz az oktató adataira (név, tanszék)
    // Ezt egy interfészben vagy DTO-ban (Data Transfer Object)
    // Egyelőre egyszerűsítve:
    async create(oktatoData: { nev: string; tanszek?: string }): Promise<Oktato> {
        const ujOktato = this.oktatoRepository.create(oktatoData);
        return this.oktatoRepository.save(ujOktato);
    }

    async update(id: number, oktatoData: Partial<Oktato>): Promise<Oktato | null> {
        await this.oktatoRepository.update(id, oktatoData);
        return this.getById(id); // Visszaadja a frissített oktatót
    }

    async delete(id: number): Promise<void> {
        // 1. Ellenőrizzük, hogy létezik-e az oktató, és vannak-e kapcsolódó kurzusai
        const oktatoToRemove = await this.oktatoRepository.findOne({
            where: { id: id },
            relations: ["kurzusok"] // Fontos, hogy betöltsük a kurzusokat
        });

        if (!oktatoToRemove) {
            // Ha nincs ilyen oktató, akkor nincs mit törölni, vagy jelezhetnénk, hogy nem található
            // A TypeORM delete metódusa egyszerűen nem csinál semmit, ha nincs ilyen ID,
            // de explicit ellenőrzéssel szebb hibát adhatnánk. Egyelőre marad ez :)
            const deleteResult = await this.oktatoRepository.delete(id);
            if (deleteResult.affected === 0) {
                console.warn(`Oktató törlése: Nincs oktató ezzel az ID-val: ${id}`);
            }
            return;
        }

        if (oktatoToRemove.kurzusok && oktatoToRemove.kurzusok.length > 0) {
            // 2. Ha vannak kurzusai, dobunk egy hibát
            throw new Error("Az oktató nem törölhető, mert aktív kurzusok vannak hozzárendelve. Először törölje vagy rendelje át a kurzusokat.");
        }

        // 3. Ha nincsenek kurzusai, akkor törölhetjük
        await this.oktatoRepository.delete(id);
    }
    async getOktatottTargyak(oktatoId: number): Promise<Targy[]> {
        const options: FindOneOptions<Oktato> = {
            where: { id: oktatoId },
            relations: ["kurzusok", "kurzusok.targy"] // Betöltjük a kurzusokat és azok tárgyait
        };
        const oktato = await this.oktatoRepository.findOne(options);

        if (!oktato) {
            throw new Error(`Oktató nem található ezzel az ID-val: ${oktatoId}`);
        }

        if (!oktato.kurzusok || oktato.kurzusok.length === 0) {
            return []; // Ha nincsenek kurzusai, üres tömböt adunk vissza
        }

        // Egyedi tárgyak kigyűjtése
        const targyakMap = new Map<number, Targy>();
        oktato.kurzusok.forEach(kurzus => {
            if (kurzus.targy && !targyakMap.has(kurzus.targy.id)) {
                targyakMap.set(kurzus.targy.id, kurzus.targy);
            }
        });

        return Array.from(targyakMap.values());
    }
}