import CircuitBreaker from 'opossum';
import { Logger } from 'pino';

interface CircuitBreakerFunction<TI extends unknown[] = unknown[], TR = unknown> {
  (...args: TI): Promise<TR>;
}

export const createCircuitBreaker = <TI extends unknown[] = unknown[], TR = unknown>(
  executeFunction: CircuitBreakerFunction<TI, TR>,
  logger: Logger
): CircuitBreakerFunction<TI, TR> => {
  const breaker = new CircuitBreaker(executeFunction);

  breaker.on('success', (result, latencyMs) => logger.info(`[SUCCESS] ${executeFunction.name} ${JSON.stringify(result)} ${latencyMs}ms`));
  breaker.on('reject', (err) => logger.error(`[REJECTED] ${executeFunction.name}`, { error: err }));
  breaker.on('fallback', (data, err) => logger.info(`[FALLBACK] ${JSON.stringify(data)}`, { error: err }));

  return async (...args: TI) => {
    return breaker.fire(...args);
  };
};
