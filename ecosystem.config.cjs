module.exports = {
  apps: [
    {
      name: 'wb-server',
      cwd: './apps/server',
      script: 'npx',
      args: 'tsx src/index.ts',
      interpreter: 'none',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: '3000',
        DATABASE_URL: './data/whiteboard.db',
        STORAGE_TYPE: 'local',
        UPLOAD_DIR: './uploads',
      },
      out_file: '/tmp/wb-server-pm2.log',
      error_file: '/tmp/wb-server-pm2-err.log',
    },
    {
      name: 'wb-client',
      cwd: './apps/client',
      script: 'npx',
      args: 'vite',
      interpreter: 'none',
      watch: false,
      out_file: '/tmp/wb-client-pm2.log',
      error_file: '/tmp/wb-client-pm2-err.log',
    },
  ],
};
