export default function SocialProof() {
  const citations = [
    {
      title: "Investigator's Global Assessment Scale",
      source: "FDA Guidance Document, 2005",
      detail: "Standard 5-point severity grading for acne vulgaris",
    },
    {
      title: "FairFace: Face Attribute Dataset",
      source: "Kärkkäinen & Joo, WACV 2021",
      detail: "Balanced demographic representation in facial analysis",
    },
    {
      title: "YOLOv8 Architecture",
      source: "Ultralytics, 2023",
      detail: "State-of-the-art real-time object detection framework",
    },
  ];

  return (
    <section id="methodology" className="bg-bg-surface border-y border-border-default py-20">
      <div className="max-w-container mx-auto px-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-text-tertiary text-center mb-10">
          Built on peer-reviewed methodology
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {citations.map((c) => (
            <div key={c.title} className="bg-bg-subtle rounded-lg p-5 border border-border-default shadow-sm">
              <h3 className="font-sans font-semibold text-text-primary text-base mb-1">{c.title}</h3>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-2">{c.source}</p>
              <p className="text-[0.9375rem] text-text-secondary">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
