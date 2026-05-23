// Crash-proof production server wrapper
process.on('uncaughtException', (err) => {
  console.error('[CRASH-PROOF] Uncaught exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[CRASH-PROOF] Unhandled rejection:', reason);
});

// Start the Next.js standalone server
require('./.next/standalone/server.js');
