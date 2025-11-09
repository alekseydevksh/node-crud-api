import { IncomingMessage, ServerResponse } from 'node:http';
import { userController } from '../controllers/userController';

export async function handleUserRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string
): Promise<boolean> {
  const userIdPattern = /^\/api\/users\/([^/]+)$/;
  const method = req.method;

  // GET /api/users
  if (pathname === '/api/users' && method === 'GET') {
    await userController.getAllUsers(req, res);
    return true;
  }

  // POST /api/users
  if (pathname === '/api/users' && method === 'POST') {
    await userController.createUser(req, res);
    return true;
  }

  // GET /api/users/:id
  const getUserMatch = userIdPattern.exec(pathname);
  if (getUserMatch && method === 'GET') {
    await userController.getUserById(req, res, getUserMatch[1]);
    return true;
  }

  // PUT /api/users/:id
  const putUserMatch = userIdPattern.exec(pathname);
  if (putUserMatch && method === 'PUT') {
    await userController.updateUser(req, res, putUserMatch[1]);
    return true;
  }

  // DELETE /api/users/:id
  const deleteUserMatch = userIdPattern.exec(pathname);
  if (deleteUserMatch && method === 'DELETE') {
    await userController.deleteUser(req, res, deleteUserMatch[1]);
    return true;
  }

  return false;
}
