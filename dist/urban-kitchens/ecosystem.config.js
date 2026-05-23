module.exports = {
  apps: [{
    name: 'urban-kitchens',
    script: 'server.js',
    cwd: '/var/www/urban-kitchens',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    max_restarts: 10,
    restart_delay: 5000,
    error_file: '/var/log/urban-kitchens/err.log',
    out_file: '/var/log/urban-kitchens/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    kill_timeout: 5000,
    listen_timeout: 10000,
    shutdown_with_message: true
  }]
}
