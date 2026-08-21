"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <Image
        src="/brand/crest.png"
        alt=""
        width={64}
        height={64}
        aria-hidden="true"
        className="h-16 w-16 object-contain"
      />
      <div className="space-y-3">
        <p className="eyebrow">Something broke</p>
        <h1 className="font-display text-4xl tracking-tight text-bone">
          That was not supposed to happen
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-parch">
          Try again; if it keeps happening, tell us and we will fix it properly.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
