module.exports = {
  apps: [
    {
      name: 'dify-webapp',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/opt/dify-webapp',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/opt/dify-webapp/logs/error.log',
      out_file: '/opt/dify-webapp/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
    },
  ],
}
