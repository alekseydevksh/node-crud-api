# Node.js CRUD API

A RESTful CRUD API for managing users, built with Node.js and TypeScript.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd node-crud-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Or create a `.env` file with:
   ```
   PORT=8000
   ```

## Running the Application

**Development Mode:**
```bash
npm run start:dev
```

**Production Mode:**
```bash
npm run start:prod
```

**Multi-Process Mode (Load Balancer):**
```bash
npm run start:multi
```

The server will be available at `http://localhost:8000` (or the port specified in `.env`).

## API Endpoints

All endpoints are prefixed with `/api/users`.

### GET /api/users
Get all users.

**Example:**
```bash
curl http://localhost:8000/api/users
```

**Response:** 200 OK
```json
[
  {
    "id": "uuid",
    "username": "string",
    "age": number,
    "hobbies": ["string"] or []
  }
]
```

### GET /api/users/{userId}
Get a user by ID.

**Example:**
```bash
curl http://localhost:8000/api/users/{userId}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "username": "string",
  "age": number,
  "hobbies": ["string"] or []
}
```

### POST /api/users
Create a new user.

**Example:**
```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"John Doe","age":30,"hobbies":["reading","gaming"]}'
```

**Request Body:**
```json
{
  "username": "string (required, non-empty)",
  "age": number (required, positive),
  "hobbies": ["string"] or [] (required, array of strings or empty array)
}
```

**Response:** 201 Created

### PUT /api/users/{userId}
Update a user by ID. All fields are optional.

**Example:**
```bash
curl -X PUT http://localhost:8000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{"age":31}'
```

**Response:** 200 OK

### DELETE /api/users/{userId}
Delete a user by ID.

**Example:**
```bash
curl -X DELETE http://localhost:8000/api/users/{userId}
```

**Response:** 204 No Content

## Error Handling

All errors return JSON:
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- 200 OK, 201 Created, 204 No Content: Success
- 400 Bad Request: Invalid UUID, invalid request body, or missing required fields
- 404 Not Found: User not found or endpoint not found
- 500 Internal Server Error: Server-side error
