module.exports = {
  apps: [
    {
      name: "between",
      cwd: "./server",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
