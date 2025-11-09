import http from 'node:http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  res.end('Server is running');
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});