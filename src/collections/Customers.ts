import type { CollectionConfig } from "payload";

import { anyone, isAdmin, isStaffField, staffOrSelfCustomer } from "../access/access";
import { accountResetEmail, accountVerifyEmail } from "../lib/emails";
import { SA_PROVINCES } from "./Orders";

/**
 * Shopper accounts for the lightweight account area (order history, saved
 * address). Entirely optional: guest checkout never creates one. A separate
 * auth collection from staff Users; customers can never reach the admin panel
 * (access.admin is false and they carry no roles).
 */
const siteUrl = () =>
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === "production" ? "https://verboten.co.za" : "http://localhost:3001");

export const Customers: CollectionConfig = {
  slug: "customers",
  /**
   * Email ownership must be proven before the account is usable.
   *
   * The account page shows guest orders matched on email address, so an
   * unverified signup would hand anyone the purchase history, delivery address
   * and date of birth of whoever owns that address. Verification is what makes
   * "your email is your account" safe to say.
   */
  auth: {
    /**
     * Payload's default reset link points at /admin/reset, which is the staff
     * panel. Customers have no access to it, so every "forgot your password"
     * ended at a login screen they could never get past. Send them to the
     * shop's own page instead.
     */
    forgotPassword: {
      generateEmailSubject: () => accountResetEmail("").subject,
      generateEmailHTML: ({ token } = {}) =>
        accountResetEmail(
          `${siteUrl()}/account/reset?token=${encodeURIComponent(String(token))}`,
        ).html,
    },
    verify: {
      generateEmailSubject: () => accountVerifyEmail("").subject,
      generateEmailHTML: ({ token }) =>
        accountVerifyEmail(
          `${siteUrl()}/account/verify?token=${encodeURIComponent(String(token))}`,
        ).html,
    },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "createdAt"],
    group: "Orders",
  },
  access: {
    admin: () => false,
    read: staffOrSelfCustomer,
    create: anyone,
    update: staffOrSelfCustomer,
    delete: isAdmin,
  },
  fields: [
    {
      /**
       * Declared purely to lock it down.
       *
       * Requiring a confirmed address closed one route to a stranger's order
       * history, and left another wide open: verify your own address, then
       * change it to somebody else's. `_verified` stays true through an
       * update, so the account page would then match on the new address and
       * show their guest orders, delivery address and date of birth.
       *
       * A shop this size does not need self-service address changes. Staff can
       * make the change, and the customer keeps their history. That is a
       * smaller cost than the alternative, which is a working way to read
       * somebody else's purchases.
       */
      name: "email",
      type: "email",
      access: { update: isStaffField },
    },
    {
      name: "name",
      type: "text",
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "defaultAddress",
      type: "group",
      fields: [
        { name: "line1", type: "text" },
        { name: "line2", type: "text" },
        { name: "suburb", type: "text" },
        { name: "city", type: "text" },
        {
          name: "province",
          type: "select",
          options: SA_PROVINCES.map((p) => ({ label: p, value: p })),
        },
        { name: "postalCode", type: "text" },
        { name: "country", type: "text", defaultValue: "ZA" },
      ],
    },
    {
      name: "marketingOptIn",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "POPIA: explicit opt-in only, never pre-ticked." },
    },
  ],
};
