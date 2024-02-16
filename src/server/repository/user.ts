import { PrismaCircuitBreaker } from '@/server/utils/circuitBreaker/DatabaseCircuitBreaker';
import { User, PrismaClient } from '@prisma/client';

export const getAllUsers = async (): Promise<User[] | void> => {
  try {
    const client = new PrismaCircuitBreaker();
    const users = await client.exec((prisma: PrismaClient) =>
      prisma.user.findMany()
    );
    return users;
  } catch (e) {
    throw e;
  }
};
