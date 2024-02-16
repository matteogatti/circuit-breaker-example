import CircuitBreaker from 'opossum';
import { User, PrismaClient } from '@prisma/client';
import logger from '@/server/utils/logger';

// ... LIST

export const getDatabaseAllUsers = async (prisma: PrismaClient): Promise<User[] | void> => {
  try {
    const users = prisma.user.findMany();
    return users;
  } catch (e) {
    throw e;
  }
};

export const getAllUsers = async (prisma: PrismaClient) => {
  const breaker = new CircuitBreaker(getDatabaseAllUsers);
  breaker.on('success', (result) => logger.info(`[SUCCESS] getAllUsers ${JSON.stringify(result)}`));
  breaker.on('reject', () => logger.error(`[REJECTED] getAllUsers`));
  breaker.on('fallback', (data) => logger.info(`[FALLBACK] ${JSON.stringify(data)}`));
  return breaker.fire(prisma);
};
