import { db } from '../database/inMemoryDB';
import { User } from '../types/user';

export interface DBMessage {
  type: 'sync' | 'sync-request' | 'update';
  data?: Record<string, User>;
  workerId?: number;
}

export function setupDBSync(): void {
  if (!process.send) return;

  process.on('message', (msg: DBMessage) => {
    if ((msg.type === 'sync' || msg.type === 'update') && msg.data) {
      db.setAllData(msg.data);
    }
  });

  process.send({ type: 'sync-request' } as DBMessage);
}

export function notifyDBUpdate(): void {
  if (!process.send) return;

  const data = db.getAllData();
  process.send({
    type: 'update',
    data,
    workerId: process.pid,
  } as DBMessage);
}

const originalCreate = db.create.bind(db);
db.create = async (user: User) => {
  const result = await originalCreate(user);
  notifyDBUpdate();
  return result;
};

const originalUpdate = db.update.bind(db);
db.update = async (id: string, user: User) => {
  const result = await originalUpdate(id, user);
  notifyDBUpdate();
  return result;
};

const originalDelete = db.delete.bind(db);
db.delete = async (id: string) => {
  const result = await originalDelete(id);
  notifyDBUpdate();
  return result;
};
