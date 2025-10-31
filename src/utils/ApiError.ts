class ApiError<T> {
  statusCode: number;
  message: string;
  errors?: T[];
  success: boolean;
  data: null;
  stack?: string;

  constructor(
    statusCode = 500,
    message = 'Something went wrong',
    errors?: T[],
    stack = '',
  ) {
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
