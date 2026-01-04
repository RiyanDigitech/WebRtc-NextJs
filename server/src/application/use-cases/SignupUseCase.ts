import bcrypt from "bcrypt";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class SignupUseCase {
    constructor(private userRepository: UserRepository) { }

    async execute(name: string, email: string, password: string): Promise<User> {
        console.log("SignupUseCase");
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User(undefined, name, email, hashedPassword);

        return this.userRepository.create(user);
    }
}
