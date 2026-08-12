/**
 * Local Development Server for Backend
 * Runs the Fastify app locally on port 3000
 * Usage: pnpm api:dev or npx tsx api/dev-server.ts
 */

import { getConfig } from './config.js';
import { createFastifyApp } from './app.js';

async function main() {
  try {
    const config = getConfig();
    console.log('Backend starting...');
    
    const app = await createFastifyApp();
    
    const address = await app.listen({ 
      port: config.port, 
      host: config.host 
    });
    
    console.log(`Backend server running at http://${address}`);
    
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

main();