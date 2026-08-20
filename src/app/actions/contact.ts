"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";

import { clientKey, rateLimit } from "@/lib/rate-limit";

import config from "../../payload.config";

const schema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Give us a little more to work with.").max(4000),
  /** Honeypot: humans never see or fill this field. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
};

/** Stores the enquiry and alerts staff by email (console in dev). */
export async function submitContact(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  if (!rateLimit(clientKey(await headers(), "contact"), { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return { ok: false, message: "Too many messages in a short time. Try again in a few minutes." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      // Honeypot tripped: pretend success, learn nothing.
      return { ok: true, message: "Thank you. We reply within one business day." };
    }
    const fieldErrors: ContactResult["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<ContactResult["fieldErrors"]>;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { ok: false, message: "Check the highlighted fields.", fieldErrors };
  }

  const payload = await getPayload({ config });
  const { name, email, phone, message } = parsed.data;

  await payload.create({
    collection: "enquiries",
    data: { name, email, phone: phone || undefined, message, status: "new" },
    overrideAccess: true,
  });

  const staffEmail = process.env.ADMIN_NOTIFICATIONS_EMAIL;
  if (staffEmail) {
    try {
      await payload.sendEmail({
        to: staffEmail,
        subject: `New enquiry from ${name}`,
        text: `From: ${name} <${email}>${phone ? `\nPhone: ${phone}` : ""}\n\n${message}`,
      });
    } catch (err) {
      // The enquiry is stored either way; email failure must not lose it.
      payload.logger.error({ err }, "Enquiry alert email failed");
    }
  }

  return { ok: true, message: "Thank you. We reply within one business day." };
}
