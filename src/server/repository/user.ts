import { User, PrismaClient } from '@prisma/client';
import { CircuitBreakerFunction, ExecuteFunction, createCircuitBreaker } from '@/server/utils/circuitBreaker';
import { DatabaseErrorHandlerResponse } from '@/server/utils/handler/error';
// ... LIST

export const getDatabaseAllUsers: ExecuteFunction<[PrismaClient], User[]> = async (prisma: PrismaClient) => {
  try {
    const users = prisma.user.findMany();
    return users;
  } catch (e) {
    throw e;
  }
};

export const getAllUsers: CircuitBreakerFunction<[string, PrismaClient], User[] | DatabaseErrorHandlerResponse> = async (uuid: string, prisma: PrismaClient) => {
  const breaker = createCircuitBreaker(uuid, getDatabaseAllUsers);
  return breaker(prisma);
};
