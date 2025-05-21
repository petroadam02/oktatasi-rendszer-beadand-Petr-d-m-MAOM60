import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { FelvettKurzus } from "./FelvettKurzus";

@Entity()
@Unique(["tritonKod"])
export class Hallgato {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nev!: string;

    @Column({ length: 6, unique: true })
    tritonKod!: string;               

    @Column() 
    email!: string;

    @Column()
    tankor!: string;

    @OneToMany(() => FelvettKurzus, (felvettKurzus) => felvettKurzus.hallgato)
    felvettKurzusok!: FelvettKurzus[];
}