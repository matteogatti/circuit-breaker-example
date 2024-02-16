import { NODE_ENV } from '@/server/model/env';
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === NODE_ENV.PRODUCTION ? 'info' : 'debug',
});

export default logger;
