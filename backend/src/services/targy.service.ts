import { AppDataSource } from "../data-source";
import { Targy } from "../entity/Targy";
import { Repository, FindOneOptions } from "typeorm";

interface CreateTargyDto {
    nev: string;
    kod: string;
    kredit: number;
}

interface UpdateTargyDto {
    nev?: string;
    kod?: string;
    kredit?: number;
}

export class TargyService {
    private targyRepository: Repository<Targy>;

    constructor() {
        this.targyRepository = AppDataSource.getRepository(Targy);
    }

    async getAll(): Promise<Targy[]> {
        return this.targyRepository.find();
    }

    async getById(id: number): Promise<Targy | null> {
        const options: FindOneOptions<Targy> = { where: { id: id } };
        return this.targyRepository.findOne(options);
    }
    
    async getByKod(kod: string): Promise<Targy | null> {
        const options: FindOneOptions<Targy> = { where: { kod: kod } };
        return this.targyRepository.findOne(options);
    }

    async create(targyData: CreateTargyDto): Promise<Targy> {
        const ujTargy = this.targyRepository.create(targyData);
        return this.targyRepository.save(ujTargy);
    }

    async update(id: number, targyData: UpdateTargyDto): Promise<Targy | null> {
        const updateResult = await this.targyRepository.update(id, targyData);
        if (updateResult.affected === 0) {
            return null;
        }
        return this.getById(id);
    }

    async delete(id: number): Promise<void> {
        const targyToRemove = await this.targyRepository.findOne({
            where: { id: id },
            relations: ["kurzusok"]
        });

        if (!targyToRemove) {
            return; 
        }

        if (targyToRemove.kurzusok && targyToRemove.kurzusok.length > 0) {
            throw new Error("A tárgy nem törölhető, mert aktív kurzusok vannak hozzárendelve. Először törölje vagy rendelje át a kurzusokat.");
        }

        await this.targyRepository.delete(id);
    }
}