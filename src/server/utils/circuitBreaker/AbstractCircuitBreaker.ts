import { BreakerOptions } from '@/server/utils/circuitBreaker/BreakerOptions';
import {
  BreakerResult,
  BreakerState,
} from '@/server/utils/circuitBreaker/BreakerStates';
import logger from '@/server/utils/logger';

const DEFAULT_SUCCESS_THRESHOLD = 2;
const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_TIMEOUT = 3500;

export abstract class CircuitBreaker<T> {
  private service: T;
  private state: BreakerState;

  private failureCount: number;
  private successCount: number;

  private nextAttempt: number;

  // Options
  private failureThreshold: number;
  private successThreshold: number;
  private timeout: number;

  constructor(service: T, options?: BreakerOptions) {
    this.service = service;
    this.state = BreakerState.GREEN;

    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();

    this.successThreshold =
      options?.successThreshold || DEFAULT_SUCCESS_THRESHOLD;
    this.failureThreshold =
      options?.failureThreshold || DEFAULT_FAILURE_THRESHOLD;
    this.timeout = options?.timeout || DEFAULT_TIMEOUT;
  }

  protected success(res: any): any {
    this.failureCount = 0;

    if (this.state === BreakerState.YELLOW) {
      this.successCount++;

      if (this.successCount > this.successThreshold) {
        this.successCount = 0;
        this.state = BreakerState.GREEN;
      }
    }

    this.log(BreakerResult.SUCCESS);

    return res;
  }

  protected failure(res: any): any {
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = BreakerState.RED;

      this.nextAttempt = Date.now() + this.timeout;
    }

    this.log(BreakerResult.FAILURE);

    return res;
  }

  protected setService(service: T): this {
    if (!this.service) {
      this.service = service;
    }

    return this;
  }

  protected getService(): T {
    return this.service;
  }

  protected setState(state: BreakerState): this {
    this.state = state;

    return this;
  }

  protected getState(): BreakerState {
    return this.state;
  }

  protected setNextAttempt(nextAttempt: number): this {
    this.nextAttempt = nextAttempt;

    return this;
  }

  protected getNextAttempt(): number {
    return this.nextAttempt;
  }

  private log(result: string): void {
    logger.info({
      Result: result,
      Timestamp: Date.now(),
      Successes: this.successCount,
      Failures: this.failureCount,
      State: this.state,
    });
  }
}
