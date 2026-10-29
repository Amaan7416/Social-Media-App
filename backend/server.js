const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://social-media-app-1-to19.onrender.com'
];

// Global CORS configuration for Express APIs
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without an Origin header (e.g. Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect MongoDB
connectDB();

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);

// HTTP server
const server = http.createServer(app);

// Socket.IO CORS configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat ${chatId}`);
  });

  socket.on('sendMessage', (message) => {
    console.log(`Message received from client: ${message.content}`);

    io.to(message.chatId).emit('receiveMessage', message);

    console.log(`Message sent to chat ${message.chatId}: ${message.content}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});