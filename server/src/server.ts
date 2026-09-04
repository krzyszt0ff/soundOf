import express from 'express';
import accountRouter from './routes/accountRouter.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log("METHOD:", req.method);
    console.log("URL:", req.url);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
    console.log("BODY:", req.body);
    next();
});

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