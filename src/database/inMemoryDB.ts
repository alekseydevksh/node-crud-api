import { User } from '../types/user';

class InMemoryDB {
  private users: Map<string, User> = new Map();

  async getAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, user: User): Promise<User> {
    this.users.set(id, user);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // For cluster mode
  getAllData(): Record<string, User> {
    return Object.fromEntries(this.users);
  }

  setAllData(data: Record<string, User>): void {
    this.users = new Map(Object.entries(data));
  }

  mergeData(data: Record<string, User>): void {
    for (const [id, user] of Object.entries(data)) {
      this.users.set(id, user);
    }
  }
}

export const db = new InMemoryDB();
