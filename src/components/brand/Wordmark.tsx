import Link from "next/link";
import { Droplet } from "lucide-react";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={
        "group inline-flex items-center gap-2 text-foreground transition-opacity hover:opacity-90 " +
        className
      }
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
        <Droplet className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <span className="font-heading text-base font-semibold tracking-tight">
        Pavlicevits
      </span>
    </Link>
  );
}
