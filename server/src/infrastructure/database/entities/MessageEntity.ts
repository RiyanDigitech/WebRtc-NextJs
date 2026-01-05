import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { UserEntity } from "./UserEntity";

@Entity("messages")
export class MessageEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    senderId: string;

    @Column()
    receiverId: string;

    @Column("text")
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => UserEntity)
    sender: UserEntity;

    @ManyToOne(() => UserEntity)
    receiver: UserEntity;
}
