import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User"; // UserRole importálása is
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// DTO-k a regisztrációhoz és bejelentkezéshez
interface CreateAdminDto {
    email: string;
    password_hash: string; // Jelszó, amit a frontend már előkészíthet, vagy itt hash-el
}

interface LoginDto {
    email: string;
    password_hash: string;
}

// A felhasználói objektum, amit visszaad (jelszó nélkül)
type SafeUser = Omit<User, 'password' | 'hashPassword' | 'comparePassword'>;


export class AuthService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    async registerAdmin(userData: CreateAdminDto): Promise<SafeUser | null> {
        const { email, password_hash } = userData;

        const existingUser = await this.userRepository.findOneBy({ email });
        if (existingUser) {
            throw new Error("Ez az email cím már regisztrálva van.");
        }

        const user = new User();
        user.email = email;
        user.password = password_hash; // Az entitás hashPassword metódusa kezeli
        user.role = UserRole.ADMIN;

        const savedUser = await this.userRepository.save(user);
        
        const { password, ...safeUserData } = savedUser;
        return safeUserData as SafeUser;
    }

    async loginAdmin(loginData: LoginDto): Promise<{ user: SafeUser, token: string } | null> {
        const { email, password_hash } = loginData;
        const user = await this.userRepository.findOne({
            where: { email },
            select: ["id", "email", "password", "role", "createdAt", "updatedAt"]
        });

        if (!user) {
            return null; 
        }

        const isPasswordMatching = await user.comparePassword(password_hash);
        if (!isPasswordMatching) {
            return null; 
        }

        const { password, ...safeUserData } = user;
        
        // JWT token generálása
        const payload = { 
            userId: user.id, 
            email: user.email,
            role: user.role 
        };
        
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET nincs beállítva a .env fájlban!");
            throw new Error("Szerver oldali konfigurációs hiba a bejelentkezés során."); 
        }

        const token = jwt.sign(payload, secret, { expiresIn: '1h' }); // Token lejár 1 óra múlva

        return { user: safeUserData as SafeUser, token: token };
    }

    
}