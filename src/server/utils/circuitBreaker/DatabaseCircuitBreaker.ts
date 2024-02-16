import { CircuitSuspendedException } from '@/server/exception/circuitBraker';
import { CrazyMonkeyDatabaseException } from '@/server/exception/database';
import { CircuitBreaker } from '@/server/utils/circuitBreaker/AbstractCircuitBreaker';
import { BreakerOptions } from '@/server/utils/circuitBreaker/BreakerOptions';
import { BreakerState } from '@/server/utils/circuitBreaker/BreakerStates';
import { hasCrazyMonkey } from '@/server/utils/crazyMonkey';
import { PrismaClient } from '@prisma/client';

type PrismaQuery<T> = (prisma: PrismaClient) => Promise<T>;

export class PrismaService extends PrismaClient {
  private static instance: PrismaService | undefined;

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }
}

export class PrismaCircuitBreaker extends CircuitBreaker<PrismaClient> {
  constructor(options?: BreakerOptions) {
    super(PrismaService.getInstance(), options);
  }

  async exec<T>(query: PrismaQuery<T>): Promise<T> {
    if (this.getState() === BreakerState.RED) {
      if (this.getNextAttempt() <= Date.now()) {
        this.setState(BreakerState.YELLOW);
      } else {
        throw new CircuitSuspendedException(
          'Circuit suspended. You shall not pass.'
        );
      }
    }

    try {
      if (hasCrazyMonkey()) {
        throw new CrazyMonkeyDatabaseException('Prisma Crazy monkey!');
      }

      const environment = await query(this.getService());
      await this.getService().$disconnect();
      return this.success(environment);
    } catch (e) {
      await this.getService().$disconnect();
      return this.failure(e);
    }
  }
}
