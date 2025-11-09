import { validate as uuidValidate } from 'uuid';
import { CreateUserDto } from '../types/user';

export const isValidUUID = (id: string): boolean => {
  return uuidValidate(id);
};

export const validateCreateUserDto = (data: unknown): data is CreateUserDto => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const dto = data as Record<string, unknown>;

  return (
    typeof dto.username === 'string' &&
    dto.username.length > 0 &&
    typeof dto.age === 'number' &&
    dto.age > 0 &&
    Array.isArray(dto.hobbies) &&
    dto.hobbies.every((hobby) => typeof hobby === 'string')
  );
};

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}