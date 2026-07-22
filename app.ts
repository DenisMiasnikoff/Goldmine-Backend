import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import userRoutes from './routes/userRoutes';
import dungeonRoutes from './routes/dungeonRoutes';
import postRoutes from './routes/postRoutes';
import itemRoutes from './routes/itemRoutes';
import commentRouter from "./routes/commentRoutes";

const app = express();


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'fail', message: 'Too many requests, please try again later.' }
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'fail', message: 'Too many login attempts, please try again later.' }
});


const upvoteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { status: 'fail', message: 'Slow down! Too many upvotes.' }
});

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello from the Goldmine!');
});

app.use('/api/v1/users/signup', authLimiter);
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/users/forgotPassword', authLimiter);
app.use('/api/v1/posts/:postId/upvote', upvoteLimiter);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dungeons', dungeonRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/posts/:postId/comments', commentRouter);
app.use('/api/v1/items', itemRoutes);

export default app;