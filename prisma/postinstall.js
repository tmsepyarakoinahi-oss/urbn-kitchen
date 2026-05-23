// This script runs after npm install to generate the Prisma client
// Required for Vercel deployment
const { execSync } = require('child_process');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  console.warn('Prisma generate failed, continuing...');
}
