import { User, PrismaClient } from '@prisma/client';
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

export const getAllUsers = async (uuid: string, prisma: PrismaClient) => {
  const breaker = createCircuitBreaker(uuid, getDatabaseAllUsers);
  return breaker(prisma);
};
