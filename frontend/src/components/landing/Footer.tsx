import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Use", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Disclaimer", href: "#" },
    ],
  },
  {
    title: "Research",
    links: [
      { label: "Methodology", href: "#methodology" },
      { label: "IGA Scale", href: "#" },
      { label: "Model Architecture", href: "#" },
      { label: "Validation", href: "#" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Support", href: "#" },
      { label: "Feedback", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Twitter", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border-default py-16 bg-bg-surface">
      <div className="max-w-container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-sans font-semibold text-text-primary text-base mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.9375rem] text-text-secondary hover:text-text-primary transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border-default">
          <span className="font-display text-lg text-text-primary">SkinWISE</span>
          <p className="text-xs text-text-tertiary">
            © 2026 SkinWISE. Wellness tracking only — not a medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
