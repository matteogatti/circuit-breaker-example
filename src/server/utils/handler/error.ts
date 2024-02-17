import { DatabaseCrazyMonkeyException, DatabaseInvalidParametersException } from '@/server/exception/database';
import { STATUS_CODE } from '@/server/model/statusCode';

export interface DatabaseErrorHandlerResponse {
  errorCode: string;
  errorMessage: string;
}

export const errorHandler = (err: Error): DatabaseErrorHandlerResponse => {
  if (err instanceof DatabaseInvalidParametersException) {
    return {
      errorCode: `DB_${STATUS_CODE.PRECONDITION_FAILED}`,
      errorMessage: err.message,
    };
  }

  if (err instanceof DatabaseCrazyMonkeyException) {
    return {
      errorCode: `DB_${STATUS_CODE.UNPROCESSABLE_ENTITY}`,
      errorMessage: err.message,
    };
  }

  return {
    errorCode: `DB_${STATUS_CODE.BAD_REQUEST}`,
    errorMessage: err.message,
  };
};
