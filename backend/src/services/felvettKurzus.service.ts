// backend/src/services/felvettkurzus.service.ts
import { AppDataSource } from "../data-source";
import { FelvettKurzus } from "../entity/FelvettKurzus";
import { Hallgato } from "../entity/Hallgato";
import { Kurzus } from "../entity/Kurzus";
import { Repository, FindOneOptions, IsNull, Not } from "typeorm";

interface HallgatoFelvetelDto {
    hallgatoId: number;
    kurzusId: number;
}

interface ErdemjegyDto {
    erdemjegy: number;
}

export class FelvettKurzusService {
    private felvettKurzusRepository: Repository<FelvettKurzus>;
    private hallgatoRepository: Repository<Hallgato>;
    private kurzusRepository: Repository<Kurzus>;

    constructor() {
        this.felvettKurzusRepository = AppDataSource.getRepository(FelvettKurzus);
        this.hallgatoRepository = AppDataSource.getRepository(Hallgato);
        this.kurzusRepository = AppDataSource.getRepository(Kurzus);
    }

    async hallgatoFelveteleKurzusra(adat: HallgatoFelvetelDto): Promise<FelvettKurzus> {
        const hallgato = await this.hallgatoRepository.findOneBy({ id: adat.hallgatoId });
        if (!hallgato) {
            throw new Error(`A(z) ${adat.hallgatoId} ID-jú hallgató nem található.`);
        }

        const kurzus = await this.kurzusRepository.findOneBy({ id: adat.kurzusId });
        if (!kurzus) {
            throw new Error(`A(z) ${adat.kurzusId} ID-jú kurzus nem található.`);
        }

        const options: FindOneOptions<FelvettKurzus> = {
            where: { 
                hallgato: { id: adat.hallgatoId }, 
                kurzus: { id: adat.kurzusId } 
            }
        };
        const korabbiFelvetel = await this.felvettKurzusRepository.findOne(options);

        if (korabbiFelvetel) {
            throw new Error(`A hallgató (${hallgato.nev}) már felvette ezt a kurzust (${kurzus.kurzusKod}).`);
        }
        
        // Opcionális: Kurzus létszámának ellenőrzése
        // const jelenlegiLetszamOptions: FindManyOptions<FelvettKurzus> = { where: { kurzus: { id: adat.kurzusId } } };
        // const jelenlegiLetszam = await this.felvettKurzusRepository.count(jelenlegiLetszamOptions);
        // if (kurzus.maxLetszam > 0 && jelenlegiLetszam >= kurzus.maxLetszam) {
        //    throw new Error(`A kurzus (${kurzus.kurzusKod}) betelt.`);
        // }

        const ujFelvetel = this.felvettKurzusRepository.create({
            hallgato: hallgato,
            kurzus: kurzus,
        });

        return this.felvettKurzusRepository.save(ujFelvetel);
    }

    async erdemjegyBeirasa(felvettKurzusId: number, erdemjegyInput: ErdemjegyDto): Promise<FelvettKurzus | null> {
        const felvettKurzus = await this.felvettKurzusRepository.findOneBy({ id: felvettKurzusId });

        if (!felvettKurzus) {
            return null; 
        }

        if (erdemjegyInput.erdemjegy < 1 || erdemjegyInput.erdemjegy > 5) {
             throw new Error("Az érdemjegynek 1 és 5 közötti egész számnak kell lennie.");
        }

        felvettKurzus.erdemjegy = erdemjegyInput.erdemjegy;
        return this.felvettKurzusRepository.save(felvettKurzus);
    }

    async getFelvettKurzusById(id: number): Promise<FelvettKurzus | null> {
        return this.felvettKurzusRepository.findOne({
            where: { id: id },
            relations: ["hallgato", "kurzus", "kurzus.targy", "kurzus.oktato"]
        });
    }

    async getHallgatoKurzusai(hallgatoId: number): Promise<FelvettKurzus[]> {
        return this.felvettKurzusRepository.find({
            where: { hallgato: { id: hallgatoId } },
            relations: ["kurzus", "kurzus.targy", "kurzus.oktato"]
        });
    }
    
    async getKurzusHallgatoi(kurzusId: number): Promise<FelvettKurzus[]> {
        return this.felvettKurzusRepository.find({
            where: { kurzus: { id: kurzusId } },
            relations: ["hallgato"]
        });
    }

    async getHallgatoAtlag(hallgatoId: number): Promise<{ atlag: number | null; figyelembeVettErdemjegyekSzama: number }> {
        const felvettKurzusok = await this.felvettKurzusRepository.find({
            where: { 
                hallgato: { id: hallgatoId },
                erdemjegy: Not(IsNull())
            },
        });

        const erdemjegyek = felvettKurzusok.map(fk => fk.erdemjegy) as number[];

        if (erdemjegyek.length === 0) {
            return { atlag: null, figyelembeVettErdemjegyekSzama: 0 };
        }

        const osszeg = erdemjegyek.reduce((sum, current) => sum + current, 0);
        const atlag = osszeg / erdemjegyek.length;

        return { atlag: parseFloat(atlag.toFixed(2)), figyelembeVettErdemjegyekSzama: erdemjegyek.length };
    }

    async getTankorAtlag(tankorAzonosito: string): Promise<{ 
        tankor: string;
        atlag: number | null; 
        figyelembeVettErdemjegyekSzama: number;
        hallgatokSzamaEbbenATankorben: number;
    }> {
        const hallgatokATankorben = await this.hallgatoRepository.find({
            where: { tankor: tankorAzonosito }
        });

        if (hallgatokATankorben.length === 0) {
            return { 
                tankor: tankorAzonosito,
                atlag: null, 
                figyelembeVettErdemjegyekSzama: 0,
                hallgatokSzamaEbbenATankorben: 0 
            };
        }

        let osszesErdemjegy: number[] = [];
        for (const hallgato of hallgatokATankorben) {
            const felvettKurzusai = await this.felvettKurzusRepository.find({
                where: { 
                    hallgato: { id: hallgato.id },
                    erdemjegy: Not(IsNull()) // Csak ahol van érdemjegy
                }
            });
            const erdemjegyek = felvettKurzusai.map(fk => fk.erdemjegy) as number[];
            osszesErdemjegy.push(...erdemjegyek);
        }

        if (osszesErdemjegy.length === 0) {
            return { 
                tankor: tankorAzonosito,
                atlag: null, 
                figyelembeVettErdemjegyekSzama: 0,
                hallgatokSzamaEbbenATankorben: hallgatokATankorben.length
            };
        }

        const osszeg = osszesErdemjegy.reduce((sum, current) => sum + current, 0);
        const atlag = osszeg / osszesErdemjegy.length;

        return { 
            tankor: tankorAzonosito,
            atlag: parseFloat(atlag.toFixed(2)), 
            figyelembeVettErdemjegyekSzama: osszesErdemjegy.length,
            hallgatokSzamaEbbenATankorben: hallgatokATankorben.length
        };
    }
}