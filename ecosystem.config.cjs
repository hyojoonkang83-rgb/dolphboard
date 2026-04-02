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
        YJS_PORT: '1234',
        DATABASE_URL: './data/dolphboard.db',   // PGlite (로컬 파일, PostgreSQL 설치 불필요)
        JWT_SECRET: 'dev-secret-change-in-production',
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
