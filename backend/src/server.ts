import 'dotenv/config';
import { app } from './index.js';
import { connectDb } from './lib/db.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

async function start(): Promise<void> {
  await connectDb();
  console.log('[db] Connection verified');

  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT} (${process.env['NODE_ENV'] ?? 'development'})`);
  });
}

start().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
