import express from 'express';
import accountRouter from './routes/accountRouter.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = express();
app.use(express.json());

app.use("/api/account", accountRouter);

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