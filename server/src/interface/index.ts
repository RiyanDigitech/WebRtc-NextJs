import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { AppDataSource } from "../infrastructure/database/data-source";
import authRoutes from "./routes/authRoutes";
import { TypeORMMessageRepository } from "../infrastructure/repositories/TypeORMMessageRepository";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 5000;
const messageRepository = new TypeORMMessageRepository();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/api/messages/:user1/:user2", async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await messageRepository.findConversation(user1, user2);
        res.status(200).json(messages);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/", (req, res) => {
    res.send("Chat App API is running...");
});

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId: string) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined their room: ${userId}`);
        }
    });

    socket.on("send_message", async (data: { recipientId: string; senderId: string; message: string }) => {
        console.log("Message received to save and send:", data);
        try {
            // Save to DB
            const savedMessage = await messageRepository.save(data.senderId, data.recipientId, data.message);

            // Emit to recipient's room
            io.to(data.recipientId).emit("receive_message", {
                id: savedMessage.id,
                senderId: data.senderId,
                message: data.message,
                timestamp: savedMessage.createdAt
            });
            console.log(`Message emitted to room ${data.recipientId}`);
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });
    //web rtc
    // WebRTC Signaling
    socket.on("call-user", (data: { to: string; offer: any; from: string; name: string }) => {
        console.log(`Call offer from ${data.from} to ${data.to}`);
        io.to(data.to).emit("incoming-call", {
            from: data.from,
            offer: data.offer,
            name: data.name
        });
    });

    socket.on("make-answer", (data: { to: string; answer: any }) => {
        console.log(`Answer from to ${data.to}`);
        io.to(data.to).emit("call-accepted", {
            answer: data.answer
        });
    });

    socket.on("ice-candidate", (data: { to: string; candidate: any }) => {
        console.log(`ICE candidate forward to ${data.to}`);
        io.to(data.to).emit("ice-candidate", {
            candidate: data.candidate
        });
    });

    socket.on("hangup", (data: { to: string }) => {
        console.log(`Hangup for ${data.to}`);
        io.to(data.to).emit("call-ended");
    });
    // web rtc end
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        httpServer.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
