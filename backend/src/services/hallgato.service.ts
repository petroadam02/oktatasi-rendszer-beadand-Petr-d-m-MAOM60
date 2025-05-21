import { AppDataSource } from "../data-source";
import { Hallgato } from "../entity/Hallgato";
import { Repository, FindOneOptions } from "typeorm";

interface CreateHallgatoDto {
    nev: string;
    tritonKod: string;
    email: string;
    tankor: string;
}

interface UpdateHallgatoDto {
    nev?: string;
    tritonKod?: string;
    email?: string;
    tankor?: string;
}

export class HallgatoService {
    private hallgatoRepository: Repository<Hallgato>;

    constructor() {
        this.hallgatoRepository = AppDataSource.getRepository(Hallgato);
    }

    async getAll(): Promise<Hallgato[]> {
        return this.hallgatoRepository.find();
    }

    async getById(id: number): Promise<Hallgato | null> {
        return this.hallgatoRepository.findOneBy({ id: id });
    }

    async create(hallgatoData: CreateHallgatoDto): Promise<Hallgato> {
        const ujHallgato = this.hallgatoRepository.create(hallgatoData);
        return this.hallgatoRepository.save(ujHallgato);
    }

    async update(id: number, hallgatoData: UpdateHallgatoDto): Promise<Hallgato | null> {
    console.log(`HallgatoService.update meghívva. ID: ${id}, Adat:`, hallgatoData); // ÚJ LOG
    try {
            const updateResult = await this.hallgatoRepository.update(id, hallgatoData);
            console.log('Update result:', updateResult); // ÚJ LOG

            if (updateResult.affected === 0) {
                console.warn(`HallgatoService.update: Nincs érintett sor. ID: ${id}`); // ÚJ LOG
                return null; 
            }
            console.log(`HallgatoService.update: Sikeres update, getById hívása... ID: ${id}`); // ÚJ LOG
            return this.getById(id);
        } catch (dbError) {
        console.error('Adatbázis hiba a HallgatoService.update metódusban:', dbError); // ÚJ LOG
        throw dbError; // Dobjuk tovább a hibát, hogy a router elkapja
        }
    }

    async delete(id: number): Promise<void> {
        const hallgatoToRemove = await this.hallgatoRepository.findOne({
            where: { id: id },
            relations: ["felvettKurzusok"] // Betöltjük a felvett kurzusokat
        });

        if (!hallgatoToRemove) {
            // Nincs ilyen hallgató, nincs teendő, vagy dobhatnánk 404-et a route-ban
            return; 
        }

        if (hallgatoToRemove.felvettKurzusok && hallgatoToRemove.felvettKurzusok.length > 0) {
            throw new Error("A hallgató nem törölhető, mert kurzusokra van felvéve. Először törölje a hallgató kurzusfelvételeit.");
        }

        await this.hallgatoRepository.delete(id);
    }
}