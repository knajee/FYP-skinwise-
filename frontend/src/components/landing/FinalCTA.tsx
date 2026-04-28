import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-content mx-auto px-6 text-center">
        <h2 className="font-display text-[40px] leading-[48px] text-white mb-6 text-balance">
          Your skin deserves data,
          <br />
          not guesswork.
        </h2>
        <Link
          href="/auth?mode=register"
          className="inline-flex items-center bg-accent text-black font-medium text-sm h-11 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-150"
        >
          Start tracking
        </Link>
        <p className="text-micro font-mono text-slate-500 mt-4">
          Free to use · No credit card required
        </p>
      </div>
    </section>
  );
}
