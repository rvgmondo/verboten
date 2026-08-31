import type { CollectionConfig } from "payload";

import { anyone, isAdmin, staffOrSelfCustomer } from "../access/access";
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
      generateEmailSubject: () => "Reset your Verboten password",
      generateEmailHTML: ({ token } = {}) => {
        const link = `${siteUrl()}/account/reset?token=${encodeURIComponent(String(token))}`;
        return [
          "<p>Someone asked to reset the password on this account.</p>",
          "<p>If that was you, choose a new one here. The link is single use.</p>",
          `<p><a href="${link}">${link}</a></p>`,
          "<p>If it was not you, ignore this email. Nothing changes unless the",
          "link above is used.</p>",
          "<p>Verboten Spirits, Pretoria<br>",
          "Drink responsibly. Not for sale to persons under 18.</p>",
        ].join("\n");
      },
    },
    verify: {
      generateEmailSubject: () => "Confirm your Verboten account",
      generateEmailHTML: ({ token }) => {
        const link = `${siteUrl()}/account/verify?token=${encodeURIComponent(String(token))}`;
        return [
          "<p>One step left.</p>",
          "<p>Confirm this address and your account is open. Every order you have",
          "placed with it, guest orders included, appears under your name.</p>",
          `<p><a href="${link}">${link}</a></p>`,
          "<p>If you did not create this account, ignore this email. Nothing is",
          "opened and nothing is shared until the link above is used.</p>",
          "<p>Verboten Spirits, Pretoria<br>",
          "Drink responsibly. Not for sale to persons under 18.</p>",
        ].join("\n");
      },
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
