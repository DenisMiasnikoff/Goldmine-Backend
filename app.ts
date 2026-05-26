import express, { Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import dungeonRoutes from './routes/dungeonRoutes';
import postRoutes from './routes/postRoutes';
import itemRoutes from './routes/itemRoutes';
import commentRouter from "./routes/commentRoutes";
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello from the Goldmine!');
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dungeons', dungeonRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/posts/:postId/comments', commentRouter);
app.use('/api/v1/items', itemRoutes);

export default app;