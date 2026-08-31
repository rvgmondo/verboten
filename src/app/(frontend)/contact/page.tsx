import type { Metadata } from "next";

import { PageMasthead } from "@/components/brand/page-masthead";
import { ContactForm } from "@/components/contact-form";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about an order, stocking Verboten at your venue, or anything else. Pretoria based, replies within one business day.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { contact } = settings;

  return (
    <main>
      <PageMasthead
        eyebrow="Contact"
        title="Talk to"
        titleAccent="the house."
        lead="Order questions, stockist enquiries, events, or anything else worth asking. We reply within one business day, and it is a person replying."
      />

      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:grid-cols-[1fr_1.2fr] lg:py-20">
        <div className="space-y-10">
          <dl className="space-y-6 text-sm">
            {contact?.email && (
              <div>
                <dt className="eyebrow mb-2">Email</dt>
                <dd>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-bone underline underline-offset-4 hover:text-gold-bright"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            )}
            {contact?.phone && (
              <div>
                <dt className="eyebrow mb-2">Phone and WhatsApp</dt>
                <dd>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="text-bone underline underline-offset-4 hover:text-gold-bright"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
            )}
            {contact?.address && (
              <div>
                <dt className="eyebrow mb-2">The house</dt>
                <dd className="text-parch">{contact.address}</dd>
              </div>
            )}
            {contact?.supportHours && (
              <div>
                <dt className="eyebrow mb-2">Hours</dt>
                <dd className="text-parch">{contact.supportHours}</dd>
              </div>
            )}
          </dl>
          <div className="border border-line bg-coal p-6">
            <p className="text-sm leading-relaxed text-parch">
              Want Verboten on your back bar or shelf? Say so in the message and
              include the venue. Trade pricing exists.
            </p>
          </div>
        </div>
        <div>
          <h2 className="sr-only">Contact form</h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
