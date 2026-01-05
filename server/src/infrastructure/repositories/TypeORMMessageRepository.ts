import { Repository } from "typeorm";
import { MessageEntity } from "../database/entities/MessageEntity";
import { AppDataSource } from "../database/data-source";

export class TypeORMMessageRepository {
    private repository: Repository<MessageEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(MessageEntity);
    }

    async save(senderId: string, receiverId: string, content: string): Promise<MessageEntity> {
        const message = this.repository.create({
            senderId,
            receiverId,
            content,
        });
        return await this.repository.save(message);
    }

    async findConversation(user1Id: string, user2Id: string): Promise<MessageEntity[]> {
        return await this.repository.find({
            where: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id },
            ],
            order: { createdAt: "ASC" },
        });
    }
}
