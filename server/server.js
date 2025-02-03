// server.js
require('dotenv').config();
const { db } = require('./firebase.js');
const { collection, getDocs } = require('firebase/firestore');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'CLIENT_URL',
  'AZURE_TRANSLATOR_KEY',
  'AZURE_TRANSLATOR_REGION',
  'GEMINI_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Configuration
const config = {
  port: process.env.PORT || 3001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  translation: {
    endpoint: 'https://api.cognitive.microsofttranslator.com',
    key: process.env.AZURE_TRANSLATOR_KEY,
    region: process.env.AZURE_TRANSLATOR_REGION,
  },
};

// Initialize Express app with security middleware
const app = express();
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling'],
  },
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Knowledge Base functions
async function getKnowledgeBase() {
  try {
    const kbCollection = collection(db, 'kb');
    const kbSnapshot = await getDocs(kbCollection);

    console.log('KB snapshot size:', kbSnapshot.size); // Add this log

    if (kbSnapshot.empty) {
      console.warn('Knowledge base is empty');
      return [];
    }
    const data = kbSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('KB data:', data); // Add this log
    return data;
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    throw new Error('Failed to fetch knowledge base');
  }
}

async function translateText(text, targetLanguage) {
  if (!text || !targetLanguage) {
    throw new Error('Missing required translation parameters');
  }

  try {
    const response = await axios({
      baseURL: config.translation.endpoint,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': config.translation.key,
        'Ocp-Apim-Subscription-Region': config.translation.region,
        'Content-Type': 'application/json',
      },
      params: {
        'api-version': '3.0',
        to: targetLanguage,
      },
      data: [{ text }],
      timeout: 5000, // 5 second timeout
    });
    return response.data[0].translations[0].text;
  } catch (error) {
    console.error('Translation error:', error.message);
    throw new Error('Translation service failed');
  }
}

async function analyzeMessage(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid message format');
  }

  try {
    const data = await getKnowledgeBase();
    if (!data || data.length === 0) {
      throw new Error('Knowledge base is empty');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `As a customer service assistant, analyze this message and provide relevant solutions based on the knowledge base:
    User message: "${text}"
    Knowledge base: ${JSON.stringify(data)}
    Provide 3 short, relevant solutions.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = response
      .text()
      .split('\n')
      .filter((s) => s.trim());

    // Add logging
    console.log('Generated suggestions:', suggestions);

    return suggestions;
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(`Message analysis failed: ${error.message}`);
  }
}

// API Routes
app.get('/api/kb', async (req, res) => {
  try {
    const data = await getKnowledgeBase();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const suggestions = await analyzeMessage(text);

    // Add logging to debug the response
    console.log('Analysis suggestions:', suggestions);

    if (!suggestions || suggestions.length === 0) {
      return res.status(404).json({ error: 'No suggestions found' });
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO handlers
const rooms = new Map();
const messageHistory = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join', ({ room, username, language, role }) => {
    // Validate input
    if (!room || !username || !language || !role) {
      socket.emit('error', { message: 'Invalid join parameters' });
      return;
    }

    try {
      socket.join(room);
      if (!rooms.has(room)) {
        rooms.set(room, new Map());
      }
      rooms.get(room).set(socket.id, { username, language, role });

      if (messageHistory.has(room)) {
        const filteredHistory = messageHistory
          .get(room)
          .filter((msg) =>
            role === 'user'
              ? msg.type !== 'system' && msg.type !== 'private'
              : true
          );
        socket.emit('messageHistory', filteredHistory);
      }

      const joinMessage = {
        username: 'System',
        text: `${username} has joined the chat`,
        timestamp: new Date().toISOString(),
        type: 'system',
      };

      if (!messageHistory.has(room)) {
        messageHistory.set(room, []);
      }
      messageHistory.get(room).push(joinMessage);
      io.to(room).emit('message', joinMessage);
    } catch (error) {
      console.error('Join error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('chatMessage', async ({ room, message, language }) => {
    // Validate input
    if (!room || !message || !language) {
      socket.emit('error', { message: 'Invalid message parameters' });
      return;
    }

    const roomUsers = rooms.get(room);
    if (!roomUsers) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const sender = roomUsers.get(socket.id);
    if (!sender) {
      socket.emit('error', { message: 'User not found in room' });
      return;
    }

    const timestamp = new Date().toISOString();

    try {
      if (sender.role === 'user') {
        try {
          const suggestions = await analyzeMessage(message);
          console.log('Emitting suggestions:', suggestions); // Add this log

          for (const [userId, user] of roomUsers) {
            if (user.role === 'agent') {
              io.to(userId).emit('suggestions', suggestions);
            }
          }
        } catch (error) {
          console.error('Analysis error:', error);
          socket.emit('error', { message: 'Failed to generate suggestions' });
        }
      }

      for (const [userId, user] of roomUsers) {
        try {
          const messageToSend = {
            username: sender.username,
            text:
              user.language !== language
                ? await translateText(message, user.language)
                : message,
            originalText: message,
            isTranslated: user.language !== language,
            timestamp,
            type: 'public',
            role: sender.role,
          };

          messageHistory.get(room).push(messageToSend);
          io.to(userId).emit('message', messageToSend);
        } catch (error) {
          console.error(
            `Message delivery error for user ${user.username}:`,
            error
          );
          io.to(userId).emit('error', { message: 'Message delivery failed' });
        }
      }
    } catch (error) {
      console.error('Chat message error:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const [room, users] of rooms) {
      if (users.has(socket.id)) {
        const { username } = users.get(socket.id);
        users.delete(socket.id);
        if (users.size === 0) {
          rooms.delete(room);
          messageHistory.delete(room);
        }
        console.log(`${username} left room ${room}`);
        break;
      }
    }
  });
});

// Error handling for unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

server.listen(config.port, '0.0.0.0', () => {
  console.log(`Server running on port ${config.port}`);
  console.log('Server is ready to accept connections');
});

module.exports = app;
