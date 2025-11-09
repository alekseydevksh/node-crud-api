import { validate as uuidValidate } from 'uuid';
import { CreateUserDto, UpdateUserDto } from '../types/user';

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

export const validateUpdateUserDto = (data: unknown): data is UpdateUserDto => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const dto = data as Record<string, unknown>;

  // If username is provided, it must be a non-empty string
  if (dto.username !== undefined) {
    if (typeof dto.username !== 'string' || dto.username.length === 0) {
      return false;
    }
  }

  // If age is provided, it must be a positive number
  if (dto.age !== undefined) {
    if (typeof dto.age !== 'number' || dto.age <= 0) {
      return false;
    }
  }

  // If hobbies is provided, it must be an array of strings (or empty array)
  if (dto.hobbies !== undefined) {
    if (!Array.isArray(dto.hobbies) || !dto.hobbies.every((hobby) => typeof hobby === 'string')) {
      return false;
    }
  }

  return true;
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
