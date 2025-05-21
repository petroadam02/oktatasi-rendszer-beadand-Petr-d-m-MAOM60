import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, Unique } from "typeorm";
import * as bcrypt from 'bcrypt';

export enum UserRole {
    ADMIN = "admin",
}

@Entity()
@Unique(["email"])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255, select: false }) // A 'select: false' megakadályozza, hogy alapból visszajöjjön a jelszó
    password!: string;

    @Column({
        type: "simple-enum",
        enum: UserRole,
        default: UserRole.ADMIN
    })
    role!: UserRole;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) { // Csak akkor hash-el, ha a jelszó megváltozott/meg van adva
            const saltRounds = 10; // Ajánlott érték
            this.password = await bcrypt.hash(this.password, saltRounds);
        }
    }

    async comparePassword(attempt: string): Promise<boolean> {
        return bcrypt.compare(attempt, this.password);
    }
}