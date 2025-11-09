import cluster, { Worker } from 'node:cluster';
import os from 'node:os';
import http from 'node:http';
import dotenv from 'dotenv';
import { handleRequest } from './app';
import { LoadBalancer } from './cluster/loadBalancer';
import { DBMessage, setupDBSync } from './cluster/dbClient';
import { User } from './types/user';

dotenv.config();

const PORT = Number.parseInt(process.env.PORT || '8000', 10);
const numWorkers = os.availableParallelism() - 1 || 1;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Starting ${numWorkers} workers...`);

  let masterDB: Record<string, User> = {};
  const workerPorts: number[] = [];
  const workers: Worker[] = [];

  for (let i = 0; i < numWorkers; i++) {
    const workerPort = PORT + i + 1;
    workerPorts.push(workerPort);
    const worker = cluster.fork({ WORKER_PORT: workerPort.toString() });
    workers.push(worker);

    worker.on('message', (msg: DBMessage) => {
      if (msg.type === 'sync-request') {
        worker.send({ type: 'sync', data: masterDB } as DBMessage);
      } else if (msg.type === 'update') {
        if (msg.data) {
          masterDB = { ...msg.data };

          for (const w of workers) {
            if (w.id !== worker.id && w.isConnected()) {
              w.send({ type: 'update', data: msg.data } as DBMessage);
            }
          }
        }
      }
    });

    console.log(`Worker ${worker.process.pid} started on port ${workerPort}`);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    const workerIndex = workers.indexOf(worker);

    if (workerIndex !== -1) {
      const workerPort = workerPorts[workerIndex];
      const newWorker = cluster.fork({ WORKER_PORT: workerPort.toString() });
      workers[workerIndex] = newWorker;

      newWorker.on('message', (msg: DBMessage) => {
        if (msg.type === 'sync-request') {
          newWorker.send({ type: 'sync', data: masterDB } as DBMessage);
        } else if (msg.type === 'update') {
          if (msg.data) {
            masterDB = { ...msg.data };
            for (const w of workers) {
              if (w.id !== newWorker.id && w.isConnected()) {
                w.send({ type: 'update', data: msg.data } as DBMessage);
              }
            }
          }
        }
      });

      console.log(`New worker ${newWorker.process.pid} started on port ${workerPort}`);
    }
  });

  const loadBalancer = new LoadBalancer(workerPorts);
  const lbServer = loadBalancer.createServer(PORT);

  const shutdown = () => {
    console.log('\nShutting down cluster...');
    lbServer.close(() => {
      console.log('Load balancer closed');
      for (const worker of workers) {
        worker.kill();
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} else {
  const WORKER_PORT = Number.parseInt(process.env.WORKER_PORT || '8001', 10);

  setupDBSync();

  const server = http.createServer(handleRequest);

  server.listen(WORKER_PORT, () => {
    console.log(`Worker ${process.pid} is listening on port ${WORKER_PORT}`);
  });
}
