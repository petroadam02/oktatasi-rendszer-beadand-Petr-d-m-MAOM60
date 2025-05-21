import { AppDataSource } from "../data-source";
import { Kurzus } from "../entity/Kurzus";
import { Targy } from "../entity/Targy";
import { Oktato } from "../entity/Oktato";
import { Repository, FindOneOptions } from "typeorm";

interface CreateKurzusDto {
    kurzusKod: string;
    kurzusNev?: string;
    maxLetszam: number;
    targyId: number;
    oktatoId: number;
}

interface UpdateKurzusDto {
    kurzusKod?: string;
    kurzusNev?: string;
    maxLetszam?: number;
    targyId?: number;
    oktatoId?: number;
}

export class KurzusService {
    private kurzusRepository: Repository<Kurzus>;
    private targyRepository: Repository<Targy>;
    private oktatoRepository: Repository<Oktato>;

    constructor() {
        this.kurzusRepository = AppDataSource.getRepository(Kurzus);
        this.targyRepository = AppDataSource.getRepository(Targy);
        this.oktatoRepository = AppDataSource.getRepository(Oktato);
    }

    async getAll(): Promise<Kurzus[]> {
        return this.kurzusRepository.find({ relations: ["targy", "oktato"] });
    }

    async getById(id: number): Promise<Kurzus | null> {
        const options: FindOneOptions<Kurzus> = { 
            where: { id: id },
            relations: ["targy", "oktato"] 
        };
        return this.kurzusRepository.findOne(options);
    }

    async create(kurzusData: CreateKurzusDto): Promise<Kurzus> {
        const targy = await this.targyRepository.findOneBy({ id: kurzusData.targyId });
        if (!targy) {
            throw new Error(`A megadott targyId (${kurzusData.targyId}) nem létezik.`);
        }

        const oktato = await this.oktatoRepository.findOneBy({ id: kurzusData.oktatoId });
        if (!oktato) {
            throw new Error(`A megadott oktatoId (${kurzusData.oktatoId}) nem létezik.`);
        }

        const ujKurzus = this.kurzusRepository.create({
            ...kurzusData,
            targy: targy,
            oktato: oktato,
        });
        return this.kurzusRepository.save(ujKurzus);
    }

    async update(id: number, kurzusData: UpdateKurzusDto): Promise<Kurzus | null> {
        const kurzusToUpdate = await this.kurzusRepository.findOneBy({ id });
        if (!kurzusToUpdate) {
            return null;
        }

        // skalár tulajdonságok frissítése
        if (kurzusData.kurzusKod !== undefined) kurzusToUpdate.kurzusKod = kurzusData.kurzusKod;
        if (kurzusData.kurzusNev !== undefined) kurzusToUpdate.kurzusNev = kurzusData.kurzusNev;
        if (kurzusData.maxLetszam !== undefined) kurzusToUpdate.maxLetszam = kurzusData.maxLetszam;

        // relációk frissítése, ha meg vannak adva
        if (kurzusData.targyId !== undefined) {
            const targy = await this.targyRepository.findOneBy({ id: kurzusData.targyId });
            if (!targy) {
                throw new Error(`A megadott targyId (${kurzusData.targyId}) nem létezik a frissítéshez.`);
            }
            kurzusToUpdate.targy = targy;
        }

        if (kurzusData.oktatoId !== undefined) {
            const oktato = await this.oktatoRepository.findOneBy({ id: kurzusData.oktatoId });
            if (!oktato) {
                throw new Error(`A megadott oktatoId (${kurzusData.oktatoId}) nem létezik a frissítéshez.`);
            }
            kurzusToUpdate.oktato = oktato;
        }
        
        return this.kurzusRepository.save(kurzusToUpdate);
    }

    async delete(id: number): Promise<void> {
    console.log(`KurzusService.delete meghívva. ID: ${id}`);
    const kurzusToRemove = await this.kurzusRepository.findOne({
        where: { id: id },
        relations: ["felvettKurzusok"]
    });

    if (!kurzusToRemove) {
        console.log(`Kurzus (ID: ${id}) nem található a törléshez.`);
        return; 
    }

    console.log(`Törlendő kurzus (ID: ${id}) felvett kurzusainak száma: ${kurzusToRemove.felvettKurzusok ? kurzusToRemove.felvettKurzusok.length : 'nem tudni (reláció nincs betöltve?)'}`);

    if (kurzusToRemove.felvettKurzusok && kurzusToRemove.felvettKurzusok.length > 0) {
        console.log(`Kurzus (ID: ${id}) nem törölhető, mert ${kurzusToRemove.felvettKurzusok.length} hallgató van hozzárendelve.`);
        throw new Error("A kurzus nem törölhető, mert hallgatók vannak hozzá felvéve. Először törölje a hallgatókat a kurzusról.");
    }

    console.log(`Kurzus (ID: ${id}) törlése megkezdődik.`);
    await this.kurzusRepository.delete(id);
    console.log(`Kurzus (ID: ${id}) sikeresen törölve az adatbázisból.`);
    }
}