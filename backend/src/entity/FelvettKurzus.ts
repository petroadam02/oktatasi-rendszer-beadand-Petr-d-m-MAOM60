import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Hallgato } from "./Hallgato";
import { Kurzus } from "./Kurzus";

@Entity()
export class FelvettKurzus {
    @PrimaryGeneratedColumn()
    id!: number;

    // Kapcsolat a Hallgato entitással
    @ManyToOne(() => Hallgato, (hallgato) => hallgato.felvettKurzusok, { nullable: false })
    @JoinColumn({ name: "hallgatoId" })
    hallgato!: Hallgato;

    // Kapcsolat a Kurzus entitással
    @ManyToOne(() => Kurzus, (kurzus) => kurzus.felvettKurzusok, { nullable: false })
    @JoinColumn({ name: "kurzusId" })
    kurzus!: Kurzus;

    @Column({ type: 'integer', nullable: true }) // Az érdemjegy lehet null, ha még nincs beírva
    erdemjegy?: number; // Pl. 1-től 5-ig, vagy ahogy a rendszer definiálja
}