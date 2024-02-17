import { errorHandler } from '@/server/utils/handler/error';
import logger from '@/server/utils/logger';
import CircuitBreaker from 'opossum';

/**
    EVENTS:
    fire - emitted when the breaker is fired.
    reject - emitted when the breaker is open (or halfOpen).
    timeout - emitted when the breaker action times out.
    success - emitted when the breaker action completes successfully
    failure - emitted when the breaker action fails, called with the error
    open - emitted when the breaker state changes to open
    close - emitted when the breaker state changes to closed
    halfOpen - emitted when the breaker state changes to halfOpen
    fallback - emitted when the breaker has a fallback function and executes it
    semaphoreLocked - emitted when the breaker is at capacity and cannot execute the request
    healthCheckFailed - emitted when a user-supplied health check function returns a rejected promise
    shutdown - emitted when the breaker shuts down

    ref.: node_modules/opossum/lib/circuit.js
 */

const options = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 10000, // After 10 seconds, try again.
};

interface CircuitBreakerFunction<TI extends unknown[] = unknown[], TR = unknown> {
  (...args: TI): Promise<TR | unknown>;
}

export const createCircuitBreaker = <TI extends unknown[] = unknown[], TR = unknown>(
  uuid: string,
  executeFunction: CircuitBreakerFunction<TI, TR>
): CircuitBreakerFunction<TI, TR> => {
  const breaker = new CircuitBreaker(executeFunction, options);

  breaker.on('fire', () => logger.info({ topic: executeFunction.name, status: 'fire', uuid }));
  breaker.on('reject', () => logger.info({ topic: executeFunction.name, status: 'reject', uuid }));
  breaker.on('timeout', () => logger.info({ topic: executeFunction.name, status: 'timeout', uuid }));
  breaker.on('success', () => logger.info({ topic: executeFunction.name, status: 'success', uuid }));
  breaker.on('failure', () => logger.info({ topic: executeFunction.name, status: 'failure', uuid }));
  breaker.on('halfOpen', () => logger.info({ topic: executeFunction.name, status: 'halfOpen', uuid }));
  breaker.on('semaphoreLocked', () => logger.info({ topic: executeFunction.name, status: 'semaphoreLocked', uuid }));
  breaker.on('healthCheckFailed', () => logger.info({ topic: executeFunction.name, status: 'healthCheckFailed', uuid }));

  breaker.on('fallback', () => logger.info({ topic: executeFunction.name, status: 'fallback', uuid }));
  breaker.fallback((_, e) => errorHandler(e));

  return async (...args: TI) => {
    return breaker.fire(...args);
  };
};
