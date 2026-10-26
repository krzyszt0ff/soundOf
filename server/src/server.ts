import express from 'express';
import accountRouter from './routes/accountRouter.js';
import profileRouter from './routes/profileRouter.js'
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cors({
  origin: env.CLIENT_BASE_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(cookieParser()); 

app.use("/api/account", accountRouter);
app.use("/api/profile", profileRouter);  

app.get('/', (req, res) => {
  res.json({ message: 'SoundOf server is running a-ok!' });
});

async function start() {
    await prisma.$connect();
    console.log('PostgreSQL (Prisma) connected');

    app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});