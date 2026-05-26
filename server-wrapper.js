// Crash-proof production server wrapper
// Prevents uncaught exceptions from crashing the server process
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.message, err.stack || '');
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// Start the Next.js standalone server
require('./.next/standalone/server.js');
