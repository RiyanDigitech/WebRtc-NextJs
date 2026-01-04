import { Repository } from "typeorm";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { UserEntity } from "../database/entities/UserEntity";
import { AppDataSource } from "../database/data-source";

export class TypeORMUserRepository implements UserRepository {
    private repository: Repository<UserEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(UserEntity);
    }

    async create(user: User): Promise<User> {
        const userEntity = this.repository.create(user);
        const savedUser = await this.repository.save(userEntity);
        return new User(
            savedUser.id,
            savedUser.name,
            savedUser.email,
            savedUser.password,
            savedUser.createdAt,
            savedUser.updatedAt
        );
    }

    async findByEmail(email: string): Promise<User | null> {
        const userEntity = await this.repository.findOne({ where: { email } });
        if (!userEntity) return null;
        return new User(
            userEntity.id,
            userEntity.name,
            userEntity.email,
            userEntity.password,
            userEntity.createdAt,
            userEntity.updatedAt
        );
    }

    async findById(id: string): Promise<User | null> {
        const userEntity = await this.repository.findOne({ where: { id } });
        if (!userEntity) return null;
        return new User(
            userEntity.id,
            userEntity.name,
            userEntity.email,
            userEntity.password,
            userEntity.createdAt,
            userEntity.updatedAt
        );
    }

    async findAll(): Promise<User[]> {
        const userEntities = await this.repository.find();
        return userEntities.map(userEntity => new User(
            userEntity.id,
            userEntity.name,
            userEntity.email,
            userEntity.password,
            userEntity.createdAt,
            userEntity.updatedAt
        ));
    }
}
