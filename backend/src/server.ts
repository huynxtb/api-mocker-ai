import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './infrastructure/config';
import { connectDatabase } from './infrastructure/database/connection';
import { errorHandler } from './presentation/middleware/errorHandler';
import { projectRoutes } from './presentation/routes/projectRoutes';
import { endpointRoutes } from './presentation/routes/endpointRoutes';
import { settingsRoutes } from './presentation/routes/settingsRoutes';
import { authRoutes } from './presentation/routes/authRoutes';
import { mockApiRouter } from './presentation/routes/mockApiRoutes';
import { authMiddleware } from './presentation/middleware/authMiddleware';

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow configured origins
app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (same-origin, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (public + self-protected)
app.use('/api/auth', authRoutes);

// Admin API routes — require authentication
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/projects', authMiddleware, endpointRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// Mock API handler (catch-all for project APIs)
app.use('/mock', mockApiRouter);

app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Allowed origins: ${config.corsOrigins.join(', ')}`);
  });
}

start();
