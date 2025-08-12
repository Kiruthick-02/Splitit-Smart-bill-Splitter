import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { postMessage } from './controllers/chatController.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import billRoutes from './routes/billRoutes.js';
import settlementRoutes from './routes/settlementRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// This map will store which user is connected to which socket
// Map<userId, socketId>
const userSocketMap = new Map();

// Middleware to make io and the user map available in our routes
app.use((req, res, next) => {
    req.io = io;
    req.userSocketMap = userSocketMap;
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/chat', chatRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('userConnected', (userId) => {
      console.log(`User ${userId} mapped to socket ${socket.id}`);
      userSocketMap.set(userId.toString(), socket.id); // Ensure userId is string
  });

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on('sendMessage', async (payload) => {
    const savedMessage = await postMessage(payload);
    if (savedMessage) {
        io.to(payload.groupId).emit('receiveMessage', savedMessage);
        console.log(`Message sent in group ${payload.groupId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Find and remove the user from the map on disconnect
    for (let [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
            userSocketMap.delete(userId);
            console.log(`Removed user ${userId} from socket map`);
            break;
        }
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));