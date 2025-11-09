import http from 'node:http';
import { handleRequest } from '../app';
import { db } from '../database/inMemoryDB';
import { User, ApiResponseData } from '../types/user';

const PORT = 8000;
let server: http.Server;

beforeAll((done) => {
  server = http.createServer(handleRequest);
  server.listen(PORT, done);
});

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  // Clear database before each test
  db['users'] = new Map();
});

function isUser(data: ApiResponseData): data is User {
  return data !== null && typeof data === 'object' && 'id' in data && !Array.isArray(data);
}

function isError(data: ApiResponseData): data is { error: string } {
  return data !== null && typeof data === 'object' && 'error' in data && !Array.isArray(data);
}

function makeRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<{ statusCode: number; data: ApiResponseData }> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 500,
          data: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

describe('API CRUD Operations', () => {
  const newUser = {
    username: 'John Doe',
    age: 30,
    hobbies: ['reading', 'gaming'],
  };

  const updateData = {
    username: 'Jane Doe',
    age: 25,
    hobbies: ['coding', 'traveling'],
  };

  async function createUser(user = newUser): Promise<string> {
    const response = await makeRequest('POST', '/api/users', user);
    if (isUser(response.data)) {
      return response.data.id;
    }
    throw new Error('Failed to create user');
  }

  test('GET /api/users returns empty array when no users exist', async () => {
    const response = await makeRequest('GET', '/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.data).toEqual([]);
  });

  test('POST /api/users creates a new user and returns the created record with id', async () => {
    const response = await makeRequest('POST', '/api/users', newUser);
    expect(response.statusCode).toBe(201);
    expect(isUser(response.data)).toBe(true);
    if (isUser(response.data)) {
      expect(response.data).toMatchObject(newUser);
      expect(response.data.id).toBeDefined();
    }
  });

  test('GET /api/users/{userId} returns the user record by id after creating it', async () => {
    const userId = await createUser();

    const response = await makeRequest('GET', `/api/users/${userId}`);
    expect(response.statusCode).toBe(200);
    expect(isUser(response.data)).toBe(true);
    if (isUser(response.data)) {
      expect(response.data).toMatchObject(newUser);
      expect(response.data.id).toBe(userId);
    }
  });

  test('PUT /api/users/{userId} updates an existing user and returns updated record with same id', async () => {
    const userId = await createUser();

    const response = await makeRequest('PUT', `/api/users/${userId}`, updateData);
    expect(response.statusCode).toBe(200);
    expect(isUser(response.data)).toBe(true);
    if (isUser(response.data)) {
      expect(response.data).toMatchObject(updateData);
      expect(response.data.id).toBe(userId);
    }
  });

  test('DELETE /api/users/{userId} deletes a user and returns 204 status code', async () => {
    const userId = await createUser();

    const response = await makeRequest('DELETE', `/api/users/${userId}`);
    expect(response.statusCode).toBe(204);
    expect(response.data).toBeNull();
  });

  test('GET /api/users/{userId} returns 404 error when trying to get a deleted user', async () => {
    const userId = await createUser();
    await makeRequest('DELETE', `/api/users/${userId}`);

    const response = await makeRequest('GET', `/api/users/${userId}`);
    expect(response.statusCode).toBe(404);
    expect(isError(response.data)).toBe(true);
    if (isError(response.data)) {
      expect(response.data.error).toBe('User not found');
    }
  });
});
