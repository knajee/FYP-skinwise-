import Link from "next/link";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-content mx-auto px-6 text-center">
        <h2 className="font-display text-4xl leading-tight text-text-primary mb-6 text-balance">
          Your skin deserves data,
          <br />
          not guesswork.
        </h2>
        <Link href="/auth?mode=register">
          <Button variant="primary" size="lg">Start tracking</Button>
        </Link>
        <p className="text-xs text-text-tertiary mt-4">
          Free to use · No credit card required
        </p>
      </div>
    </section>
  );
}
