import http, { IncomingMessage, ServerResponse } from 'node:http';

export class LoadBalancer {
  private currentIndex = 0;
  readonly workerPorts: number[] = [];

  constructor(workerPorts: number[]) {
    this.workerPorts = workerPorts;
  }

  private getNextWorkerPort(): number {
    const port = this.workerPorts[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.workerPorts.length;
    return port;
  }

  async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const workerPort = this.getNextWorkerPort();

    const options = {
      hostname: 'localhost',
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error(`Error forwarding request to worker on port ${workerPort}:`, error.message);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Service temporarily unavailable' }));
    });

    req.pipe(proxyReq);
  }

  createServer(port: number): http.Server {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(port, () => {
      console.log(`Load balancer is listening on http://localhost:${port}/api`);
      console.log(`Distributing requests across workers on ports: ${this.workerPorts.join(', ')}`);
    });

    return server;
  }
}