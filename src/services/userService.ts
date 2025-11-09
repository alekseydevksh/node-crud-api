import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/inMemoryDB';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';
import { AppError } from '../utils/validation';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return await db.getAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await db.getById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      ...dto,
    };
    return await db.create(newUser);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const existingUser = await db.getById(id);
    if (!existingUser) {
      throw new AppError(404, 'User not found');
    }

    const updatedUser: User = {
      ...existingUser,
      ...dto,
    };

    return await db.update(id, updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await db.getById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await db.delete(id);
  }
}

export const userService = new UserService();
