import { Request, Response } from "express";
import { SignupUseCase } from "../../application/use-cases/SignupUseCase";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { GetUsersUseCase } from "../../application/use-cases/GetUsersUseCase";
import { TypeORMUserRepository } from "../../infrastructure/repositories/TypeORMUserRepository";
import { z } from "zod";

const signupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export class AuthController {
    private signupUseCase: SignupUseCase;
    private loginUseCase: LoginUseCase;
    private getUsersUseCase: GetUsersUseCase;

    constructor() {
        const userRepository = new TypeORMUserRepository();
        this.signupUseCase = new SignupUseCase(userRepository);
        this.loginUseCase = new LoginUseCase(userRepository);
        this.getUsersUseCase = new GetUsersUseCase(userRepository);
    }

    async signup(req: Request, res: Response) {
        console.log("Signup request body: for checking...", req.body);
        try {
            const validatedData = signupSchema.parse(req.body);
            const user = await this.signupUseCase.execute(
                validatedData.name,
                validatedData.email,
                validatedData.password
            );
            res.status(201).json(user);
        } catch (error: any) {
            console.error("Signup error:", error);
            res.status(400).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await this.loginUseCase.execute(
                validatedData.email,
                validatedData.password
            );
            res.status(200).json(result);
        } catch (error: any) {
            console.error("Login error:", error);
            res.status(400).json({ message: error.message });
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const users = await this.getUsersUseCase.execute();
            res.status(200).json(users);
        } catch (error: any) {
            console.error("Get users error:", error);
            res.status(500).json({ message: error.message });
        }
    }
}
