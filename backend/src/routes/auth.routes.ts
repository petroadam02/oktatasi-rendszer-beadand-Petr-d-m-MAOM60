import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export const authRouter = Router();
const authService = new AuthService();

// Admin regisztráció
authRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email és jelszó megadása kötelező." });
            return;
        }

        const user = await authService.registerAdmin({ email, password_hash: password });
        res.status(201).json(user);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
        if (message.includes("már regisztrálva van")) {
            res.status(409).json({ message: "Regisztrációs hiba.", error: message });
        } else {
            res.status(500).json({ message: "Regisztrációs hiba.", error: message });
        }
    }
});

// Admin bejelentkezés
authRouter.post("/login", async (req: Request, res: Response) => {
    try {
        console.log('POST /api/auth/login req.body:', req.body);
        const { email, password_hash } = req.body; 

        if (!email || !password_hash) {
            res.status(400).json({ message: "Email és jelszó megadása kötelező." });
            return;
        }

        const result = await authService.loginAdmin({ email, password_hash: password_hash }); 

        if (!result) {
            res.status(401).json({ message: "Hibás email cím vagy jelszó." });
            return;
        }
        res.json(result);
    } catch (error: unknown) {
    }
});