import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm"; // OneToMany importálása
import { Targy } from "./Targy";
import { Oktato } from "./Oktato";
import { FelvettKurzus } from "./FelvettKurzus"; // FelvettKurzus importálása

@Entity()
export class Kurzus {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50, unique: true })
    kurzusKod!: string;

    @Column({ nullable: true, length: 150 })
    kurzusNev?: string;

    @Column({ type: 'integer', default: 0 })
    maxLetszam!: number;

    @ManyToOne(() => Targy, (targy) => targy.kurzusok, { eager: false, nullable: false })
    @JoinColumn({ name: "targyId" })
    targy!: Targy;

    @ManyToOne(() => Oktato, (oktato) => oktato.kurzusok, { eager: false, nullable: false })
    @JoinColumn({ name: "oktatoId" })
    oktato!: Oktato;

    // Egy kurzushoz több hallgatói felvétel (és érdemjegy) tartozhat
    @OneToMany(() => FelvettKurzus, (felvettKurzus) => felvettKurzus.kurzus)
felvettKurzusok!: FelvettKurzus[];
}