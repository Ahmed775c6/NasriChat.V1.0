const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
const dotenv = require('dotenv');
/*const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/user.js');
const postRoutes = require('./routes/post.js');
const commentRoutes = require('./routes/comment.js');
const likeRoutes = require('./routes/like.js');
const followRoutes = require('./routes/follow.js');
const chatRoutes = require('./routes/chat.js');
const messageRoutes = require('./routes/message.js');
const notificationRoutes = require('./routes/notification.js');*/
const { Server } = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/social-media-app';
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);

app.use('/api/like', likeRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/notification', notificationRoutes);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    }
);
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    }
    );