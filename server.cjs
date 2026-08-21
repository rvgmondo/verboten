/**
 * Passenger / LiteSpeed (lsnode) entry point for cPanel "Setup Node.js App".
 *
 * The host launches this file and passes the port via process.env.PORT. It
 * starts the already-built Next.js app in production mode. Run the build
 * first (`npm run build`) or upload a prebuilt `.next`. CommonJS (.cjs) on
 * purpose so it works regardless of package.json "type": "module".
 *
 * next.config redirects() and headers() are applied by Next's request
 * handler, so the 301 redirect map and security headers work through this
 * custom server unchanged.
 */

// Cap thread pools BEFORE anything loads. On shared hosts (CloudLinux LVE)
// the process/thread limit is low, but the Postgres driver and sharp default
// to one thread per CPU core and shared boxes report dozens of cores. Any
// value the host already set wins.
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || "4";
process.env.VIPS_CONCURRENCY = process.env.VIPS_CONCURRENCY || "1";
process.env.NEXT_TELEMETRY_DISABLED = process.env.NEXT_TELEMETRY_DISABLED || "1";
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const { createServer } = require("http");
const next = require("next");

// Resolve relative paths against the app root regardless of the host's cwd.
process.chdir(__dirname);

const port = process.env.PORT || 3001;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Verboten ready on port ${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start Next.js:", err);
    process.exit(1);
  });
