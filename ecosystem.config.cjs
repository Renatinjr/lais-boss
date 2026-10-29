// PM2 process file for production.
//
//   npm ci && npm run build                # build first; `next start` serves the .next/ output
//   pm2 start ecosystem.config.cjs         # start (or `pm2 reload ecosystem.config.cjs` to redeploy with no downtime)
//   pm2 save && pm2 startup                # restart automatically after a server reboot
//
// Override per server with env vars when starting, e.g. `PORT=8080 WEB_CONCURRENCY=4 pm2 start ecosystem.config.cjs`.

module.exports = {
  apps: [
    {
      name: "BOSS-FRONT",
      cwd: __dirname,
      // run the Next.js CLI directly (not through npm) so PM2 manages the real server process
      script: "node_modules/next/dist/bin/next",
      args: "start",

      // cluster mode: PM2 load-balances one port across instances. Safe here because the app
      // keeps no server-side state (no Server Actions, ISR or shared cache).
      exec_mode: "cluster",
      instances: Number(process.env.WEB_CONCURRENCY) || 2,

      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3011,
        HOSTNAME: process.env.HOSTNAME_BIND || "0.0.0.0",
      },

      // restarts
      autorestart: true,
      max_memory_restart: "1G",
      min_uptime: "10s",
      max_restarts: 10,
      exp_backoff_restart_delay: 200,

      // graceful shutdown: Next.js finishes in-flight requests on SIGINT/SIGTERM (its docs recommend 10-30s)
      kill_timeout: 15000,
      listen_timeout: 15000,

      // logs (one file for all instances, with timestamps)
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
