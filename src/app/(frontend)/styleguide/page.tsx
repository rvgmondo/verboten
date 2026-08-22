import type { Metadata } from "next";

import { Crest } from "@/components/brand/crest";
import { Motto } from "@/components/brand/motto";
import { Price } from "@/components/brand/price";
import { SectionHeading } from "@/components/brand/section-heading";
import { StockBadge } from "@/components/brand/stock-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CrestDivider, Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Styleguide | Verboten Spirits",
  robots: { index: false, follow: false },
};

/** Internal design-system reference. Not linked anywhere; noindex. */
export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-4xl space-y-16 px-6 py-20">
      <header className="space-y-4">
        <p className="eyebrow">Internal reference</p>
        <h1 className="font-display text-6xl tracking-tight">Verboten design system</h1>
        <p className="max-w-xl text-parch">
          Tokens, type and primitives. If a section here looks wrong, every page
          is wrong; fix it at this level first.
        </p>
      </header>

      <section className="space-y-6">
        <SectionHeading eyebrow="Typography" title="The label voice" />
        <div className="space-y-3">
          <p className="font-display text-7xl leading-none">Verboten Premium Brandy</p>
          <p className="font-display text-4xl text-gold">
            Three years in oak. Finished in French casks.
          </p>
          <p className="max-w-xl text-base leading-relaxed text-parch">
            Body copy sits in Lato at a quiet size. It carries specification,
            provenance and instruction without raising its voice. Statements,
            not sales pleading.
          </p>
          <Motto />
          <Motto line="MEMORIES NOT REGRETS" />
        </div>
      </section>

      <CrestDivider />

      <section className="space-y-6">
        <SectionHeading eyebrow="Colour" title="Ink, bone, gold" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["ink", "bg-ink border border-line"],
            ["coal", "bg-coal"],
            ["smoke", "bg-smoke"],
            ["line", "bg-line"],
            ["bone", "bg-bone"],
            ["parch", "bg-parch"],
            ["gold", "bg-gold"],
            ["gold-bright", "bg-gold-bright"],
            ["gold-dim", "bg-gold-dim"],
            ["oxblood", "bg-oxblood"],
            ["danger", "bg-danger"],
          ].map(([name, cls]) => (
            <div key={name} className="space-y-2">
              <div className={`h-16 rounded-xs ${cls}`} />
              <p className="text-xs text-parch">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Actions" title="Buttons" />
        <div className="flex flex-wrap items-center gap-4">
          <Button>Add to cart</Button>
          <Button variant="outline">View the batch</Button>
          <Button variant="ghost">Continue browsing</Button>
          <Button variant="danger">Cancel order</Button>
          <Button disabled>Sold out</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md" variant="outline">
            Medium
          </Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="States" title="Badges and stock" />
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="gold">The flagship</Badge>
          <Badge variant="quiet">750ml</Badge>
          <Badge variant="low">6 left</Badge>
          <Badge variant="soldOut">Sold out</Badge>
          <StockBadge
            availability={{ available: 3, soldOut: false, lowStock: true }}
          />
          <Price cents={45000} />
          <Price cents={4500} className="text-sm" />
        </div>
      </section>

      <section className="max-w-md space-y-6">
        <SectionHeading eyebrow="Forms" title="Inputs" />
        <div className="space-y-2">
          <Label htmlFor="sg-email">Email</Label>
          <Input id="sg-email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sg-msg">Message</Label>
          <Textarea id="sg-msg" placeholder="What can we help with?" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sg-invalid">Invalid state</Label>
          <Input id="sg-invalid" aria-invalid="true" defaultValue="not-an-email" />
          <p className="text-xs text-danger">Enter a valid email address.</p>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Marks" title="The crest" />
        <div className="flex items-end gap-8">
          <Crest className="h-24 w-24 text-gold" />
          <Crest className="h-12 w-12 text-gold-dim" />
          <Crest className="h-7 w-7 text-parch" />
        </div>
        <Separator />
        <div className="flex gap-4">
          <Skeleton className="h-24 w-24" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </section>
    </main>
  );
}
