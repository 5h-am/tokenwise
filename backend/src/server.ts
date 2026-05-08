/**
 * server.ts — HTTP server entry point
 * Starts the Express app on the configured PORT.
 * Populated in Part 3.
 */
import { app } from './index.js';

const PORT = process.env['PORT'] ?? 3001;

app.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT}`);
});
