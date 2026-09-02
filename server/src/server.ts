import express from 'express';
import userRouter from './routes/user.js';

const app = express();

app.use("/api/user", userRouter);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'SoundOf server is running a-ok!' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});