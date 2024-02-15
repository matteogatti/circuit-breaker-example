declare module 'easy-breaker' {
  import { EventEmitter } from 'events';

  interface EasyBreakerOptions {
    threshold?: number;
    timeout?: number;
    resetTimeout?: number;
    context?: unknown;
    maxEventListeners?: number;
    promise?: boolean;
  }

  type EasyBreakerFunction = (
    cb: (err: Error | null, result?: unknown) => void
  ) => void;

  interface EasyBreakerInstance extends EventEmitter, EasyBreakerFunction {
    state: string;
    _failures: number;
    on: EventEmitter['on'];
  }

  function EasyBreaker(
    fn: EasyBreakerFunction,
    opts?: EasyBreakerOptions
  ): EasyBreakerInstance;

  class TimeoutError extends Error {
    constructor(message?: string);
  }

  class CircuitOpenError extends Error {
    constructor(message?: string);
  }

  export { EasyBreaker, TimeoutError, CircuitOpenError };
  export const errors: {
    TimeoutError: typeof TimeoutError;
    CircuitOpenError: typeof CircuitOpenError;
  };
  export const states: { OPEN: string; HALFOPEN: string; CLOSE: string };
}
