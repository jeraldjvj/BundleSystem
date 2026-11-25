// PM2 — ejecutar desde backend/: pm2 start ecosystem.config.js && pm2 save
module.exports = {
  apps: [
    {
      name: 'bundlesystem-api',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1,          // 1 instancia: rate limits en memoria y uploads locales
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
