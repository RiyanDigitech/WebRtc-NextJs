import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class LoginUseCase {
    constructor(private userRepository: UserRepository) { }

    async execute(email: string, password: string): Promise<{ token: string; user: { id: string; name: string; email: string } }> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        return {
            token,
            user: {
                id: user.id!,
                name: user.name,
                email: user.email,
            },
        };
    }
}
