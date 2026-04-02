module.exports = {
  apps: [
    {
      name: 'dolphboard',
      cwd: './apps/server',
      script: 'npx',
      args: 'tsx src/index.ts',
      interpreter: 'none',
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        DATABASE_URL: './data/dolphboard.db',
        JWT_SECRET: 'dev-secret-change-in-production',
        STORAGE_TYPE: 'local',
        UPLOAD_DIR: './uploads',
      },
      out_file: '/tmp/dolphboard-pm2.log',
      error_file: '/tmp/dolphboard-pm2-err.log',
    },
  ],
};
