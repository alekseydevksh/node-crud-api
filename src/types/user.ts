export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: Array<string>;
}

export type CreateUserDto = Omit<User, 'id'>;
export type UpdateUserDto = Partial<CreateUserDto>;
export type ApiResponseData = User | Array<User> | { error: string } | null;
