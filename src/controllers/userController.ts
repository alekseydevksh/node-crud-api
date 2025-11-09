import { IncomingMessage, ServerResponse } from 'node:http';
import { userService } from '../services/userService';
import { isValidUUID, validateCreateUserDto, AppError } from '../utils/validation';
import { UpdateUserDto } from '../types/user';

export class UserController {
  async getAllUsers(_req: IncomingMessage, res: ServerResponse): Promise<void> {
    const users = await userService.getAllUsers();
    this.sendJSON(res, 200, users);
  }

  async getUserById(_req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    if (!isValidUUID(id)) {
      throw new AppError(400, 'Invalid user ID (not UUID)');
    }

    const user = await userService.getUserById(id);
    this.sendJSON(res, 200, user);
  }

  async createUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await this.parseBody(req);

    if (!validateCreateUserDto(body)) {
      throw new AppError(
        400,
        'Invalid request body. Required fields: username (string), age (number), hobbies (string[])'
      );
    }

    const newUser = await userService.createUser(body);
    this.sendJSON(res, 201, newUser);
  }

  async updateUser(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    if (!isValidUUID(id)) {
      throw new AppError(400, 'Invalid user ID (not UUID)');
    }

    const body = await this.parseBody(req);
    const updateData = body as UpdateUserDto;

    // Validate that at least some fields are provided and valid
    if (!updateData || typeof updateData !== 'object') {
      throw new AppError(400, 'Invalid request body');
    }

    const updatedUser = await userService.updateUser(id, updateData);
    this.sendJSON(res, 200, updatedUser);
  }

  async deleteUser(_req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    if (!isValidUUID(id)) {
      throw new AppError(400, 'Invalid user ID (not UUID)');
    }

    await userService.deleteUser(id);
    res.statusCode = 204;
    res.end();
  }

  private async parseBody(req: IncomingMessage): Promise<unknown> {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk.toString();
      }
      return body ? JSON.parse(body) : {};
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new AppError(400, 'Invalid JSON');
      }
      throw error;
    }
  }

  private sendJSON(res: ServerResponse, statusCode: number, data: unknown): void {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }
}

export const userController = new UserController();
