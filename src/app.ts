import { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { handleUserRoutes } from './routes/userRoutes';
import { handleError } from './utils/errorHandler';
import { handleNotFound } from './utils/notFound';

export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    const handled = await handleUserRoutes(req, res, pathname);

    if (!handled) {
      handleNotFound(res);
    }
  } catch (error) {
    handleError(error, res);
  }
}