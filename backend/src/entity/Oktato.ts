import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"; // OneToMany importálása
import { Kurzus } from "./Kurzus"; // Kurzus importálása

@Entity()
export class Oktato {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nev!: string;

    @Column({ nullable: true })
    tanszek?: string;

    // Egy oktató több kurzust is tarthat
    @OneToMany(() => Kurzus, (kurzus) => kurzus.oktato)
    kurzusok!: Kurzus[]; // Ez egy tömb lesz, ami az oktató kurzusait tartalmazza
}