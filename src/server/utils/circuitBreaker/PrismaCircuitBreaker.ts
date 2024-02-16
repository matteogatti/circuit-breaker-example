import { CircuitBreaker } from '@/server/utils/circuitBreaker/AbstractCircuitBreaker';
import { BreakerOptions } from '@/server/utils/circuitBreaker/BreakerOptions';
import { BreakerState } from '@/server/utils/circuitBreaker/BreakerStates';
import { PrismaClient } from '@prisma/client';

type PrismaQuery<T> = (prisma: PrismaClient) => Promise<T>;

export class PrismaCircuitBreaker extends CircuitBreaker<PrismaClient> {
  constructor(options?: BreakerOptions) {
    super(new PrismaClient(), options);
  }

  async exec<T>(query: PrismaQuery<T>): Promise<T> {
    if (this.getState() === BreakerState.RED) {
      if (this.getNextAttempt() <= Date.now()) {
        this.setState(BreakerState.YELLOW);
      } else {
        throw new Error('Circuit suspended. You shall not pass.');
      }
    }

    try {
      const environment = await query(this.getService());
      await this.getService().$disconnect();
      return this.success(environment);
    } catch (e) {
      await this.getService().$disconnect();
      return this.failure(e);
    }
  }
}
