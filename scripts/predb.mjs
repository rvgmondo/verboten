// Local-dev convenience only: start the portable Postgres before `dev`/`build`,
// but ONLY on Windows with a local (or unset) DATABASE_URI. On any other
// platform (a Linux / cPanel server) or with a remote DATABASE_URI (Neon,
// Supabase), this does nothing, so `npm run build` never tries to run
// PowerShell or reach a local database on the server.
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const uri = process.env.DATABASE_URI || "";
const isLocalDb = uri === "" || uri.includes("127.0.0.1") || uri.includes("localhost");

if (process.platform !== "win32" || !isLocalDb) {
  process.exit(0);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
try {
  execFileSync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(dir, "db-start.ps1")],
    { stdio: "inherit" },
  );
} catch (err) {
  // Never fail the dev/build because the local DB helper could not run.
  console.warn("[predb] skipped local Postgres start:", err.message);
}
