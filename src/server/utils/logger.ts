import { NODE_ENV } from '@/server/model/env';
import pino, { Logger } from 'pino';

let loggerInstance: Logger;

const createLogger = () => {
  return pino({
    level: process.env.NODE_ENV === NODE_ENV.PRODUCTION ? 'info' : 'debug',
  });
};

const getLoggerInstance = () => {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
};

export default getLoggerInstance();
