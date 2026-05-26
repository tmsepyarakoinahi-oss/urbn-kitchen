const { spawn } = require('child_process');
const path = require('path');

function startServer() {
  console.log('Starting server...');
  const server = spawn('node', [path.join(__dirname, '.next/standalone/server.js'), '-p', '3000'], {
    cwd: __dirname,
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  server.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  server.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  server.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code}, signal ${signal}`);
    console.log('Restarting in 3 seconds...');
    setTimeout(startServer, 3000);
  });
  
  return server;
}

const server = startServer();

// Keep this process alive
process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});
