import { ServerResponse } from 'node:http';
import { AppError } from './validation';

const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

export function handleError(error: unknown, res: ServerResponse): void {
  // Only log errors in non-test environments
  if (!isTestEnvironment) {
  console.error('Error:', error);
  }

  if (error instanceof AppError) {
    res.statusCode = error.statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
    return;
  }

  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Internal server error' }));
}