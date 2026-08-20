import type { Access, FieldAccess } from "payload";

/**
 * Role-based access control.
 *
 * Two roles: `admin` (full access, incl. user & settings management) and
 * `editor` (content + orders, no user management). Access is enforced at the
 * collection and field level server-side; never rely on hiding admin UI alone.
 */

const rolesOf = (user: unknown): string[] =>
  ((user as { roles?: string[] } | null | undefined)?.roles ?? []) as string[];

export const anyone: Access = () => true;

export const authenticated: Access = ({ req: { user } }) => Boolean(user);

export const isAdmin: Access = ({ req: { user } }) => rolesOf(user).includes("admin");

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  const roles = rolesOf(user);
  return roles.includes("admin") || roles.includes("editor");
};

const isStaff = (user: unknown): boolean =>
  (user as { collection?: string } | null)?.collection === "users";

/**
 * Admins see all staff users; a signed-in staff member may read/update only
 * their own record.
 *
 * The `collection` guard is load-bearing: customers are a separate auth
 * collection but share the integer PK space, so without it a customer with
 * id N would match the staff user with id N (account takeover). Non-staff
 * get no access to the users collection at all.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user || !isStaff(user)) return false;
  if (rolesOf(user).includes("admin")) return true;
  return { id: { equals: user.id } };
};

/** Admin-panel access must be boolean-only (no Where query). */
export const canAccessAdmin = ({ req }: { req: { user?: unknown } }): boolean =>
  rolesOf(req.user).length > 0;

/** Public sees only published docs; editors/admins see everything (incl. drafts). */
export const publishedOrEditor: Access = ({ req: { user } }) => {
  const roles = rolesOf(user);
  if (roles.includes("admin") || roles.includes("editor")) return true;
  return { _status: { equals: "published" } };
};

/** Staff see everything; a signed-in customer sees only their own orders. */
export const staffOrOwnCustomer: Access = ({ req: { user } }) => {
  if (!user) return false;
  const roles = rolesOf(user);
  if (roles.includes("admin") || roles.includes("editor")) return true;
  if ((user as { collection?: string }).collection === "customers") {
    return { customer: { equals: user.id } };
  }
  return false;
};

/** Staff see all customers; a customer may only read/update their own record. */
export const staffOrSelfCustomer: Access = ({ req: { user } }) => {
  if (!user) return false;
  const roles = rolesOf(user);
  if (roles.includes("admin") || roles.includes("editor")) return true;
  if ((user as { collection?: string }).collection === "customers") {
    return { id: { equals: user.id } };
  }
  return false;
};

/** Server-side only: no one may create through the public REST/GraphQL API.
 *  Checkout and forms use the local API with overrideAccess. */
export const serverOnly: Access = () => false;

// --- Field-level ---

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  rolesOf(user).includes("admin");
