import express from 'express';
import userRouter from './routes/user.js';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

app.use("/api/user", userRouter);

app.get('/', (req, res) => {
  res.json({ message: 'SoundOf server is running a-ok!' });
});

async function start() {
    await prisma.$connect();
    console.log('PostgreSQL (Prisma) connected');

    const PORT = 4000;
    app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});