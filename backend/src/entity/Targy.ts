import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from "typeorm"; // OneToMany importálása
import { Kurzus } from "./Kurzus"; // Kurzus importálása

@Entity()
@Unique(["kod"])
export class Targy {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    nev!: string;

    @Column({ length: 20 })
    kod!: string;

    @Column({ type: 'integer' })
    kredit!: number;

    // Egy tárgyhoz több kurzus is tartozhat
    @OneToMany(() => Kurzus, (kurzus) => kurzus.targy)
    kurzusok!: Kurzus[]; // Ez egy tömb lesz, ami a tárgyhoz tartozó kurzusokat tartalmazza
}