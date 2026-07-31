import { networkInterfaces } from 'os';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

function getLanAddresses(): string[] {
  const addresses = new Set<string>();

  for (const interfaces of Object.values(networkInterfaces())) {
    for (const iface of interfaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.add(iface.address);
      }
    }
  }

  return [...addresses];
}

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');

    app.listen(env.port, '0.0.0.0', () => {
      const lanAddresses = getLanAddresses();

      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Listening on all interfaces (0.0.0.0:${env.port})`);

      if (lanAddresses.length) {
        console.log('Mobile API URLs (use one of these in mobile/.env):');
        for (const address of lanAddresses) {
          console.log(`  http://${address}:${env.port}`);
        }
      } else {
        console.log('No LAN IPv4 address detected for mobile testing.');
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to start server:', message);
    process.exit(1);
  }
}

async function shutdown(): Promise<void> {
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
