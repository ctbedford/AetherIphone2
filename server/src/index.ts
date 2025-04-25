import express, { Request, Response } from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for client app
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19000', 'http://localhost:19006', 'exp://localhost:19000'],
  credentials: true,
}));

// Health check endpoint
app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create tRPC middleware
app.use('/api/trpc', createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`tRPC API available at http://localhost:${port}/api/trpc`);
}); 