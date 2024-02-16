import { User, PrismaClient } from '@prisma/client';
import logger from '@/server/utils/logger';
import { createCircuitBreaker } from '@/server/utils/circuitBreaker';

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
  const breaker = createCircuitBreaker(getDatabaseAllUsers, logger);
  return breaker(prisma);
};
