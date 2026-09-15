import { getPayload } from "payload";

import config from "../payload.config";

/**
 * Provisions the first admin account for local development.
 * Default credentials are for DEV ONLY. Change them (or create a real user in
 * the admin UI) before any deployment. Idempotent: does nothing if users exist.
 *
 * Run: npm run seed:admin
 */
const run = async () => {
  const payload = await getPayload({ config });

  const { totalDocs } = await payload.count({ collection: "users" });
  if (totalDocs > 0) {
    payload.logger.info(`Users already exist (${totalDocs}); skipping.`);
    process.exit(0);
  }

  const email = process.env.ADMIN_EMAIL || "admin@verboten.co.za";
  const password = process.env.ADMIN_PASSWORD;

  // No fallback. This repository has been public, and a hardcoded default here
  // was a working admin login on every database seeded without the variable
  // set, with the password printed in the README beside it.
  if (!password || password.length < 12) {
    payload.logger.error("Set ADMIN_PASSWORD (12 characters or more) in .env before creating the admin.");
    process.exit(1);
  }

  const user = await payload.create({
    collection: "users",
    data: { email, password, name: "Verboten Admin", roles: ["admin"] },
  });

  payload.logger.info(`Created admin user: ${user.email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
