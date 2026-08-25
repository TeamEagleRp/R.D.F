// PM2 Ecosystem Configuration for LSPD
// Run with: pm2 start ecosystem.config.js
// This keeps the bot running 24/7 and auto-restarts on code changes (watch mode).

module.exports = {
  apps: [
    {
      name: 'lspd-bot',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      // Files/folders to watch for changes -> triggers auto-restart
      watch_delay: 1000,
      ignore_watch: [
        'node_modules',
        'uploads',
        'data.json',
        '*.log',
        'public/assets',
        '.git',
      ],
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '500M',
      autorestart: true,
      // Logs
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      time: true,
    },
  ],
};

