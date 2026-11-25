import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import routes from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Expresa cuántos proxies confiables hay delante (nginx=1, cadena más larga=N)
if (config.trustProxy) app.set('trust proxy', Number(config.trustProxy) || config.trustProxy);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use('/uploads', express.static('/app/backend/uploads'));

app.use(config.apiPrefix, apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
