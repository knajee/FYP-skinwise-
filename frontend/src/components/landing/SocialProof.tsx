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
    <section id="methodology" className="bg-surface-1 border-y border-white/[0.06] py-20">
      <div className="max-w-container mx-auto px-6">
        <p className="text-xs-body font-mono text-slate-500 uppercase tracking-wider text-center mb-10">
          Built on peer-reviewed methodology
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {citations.map((c) => (
            <div key={c.title} className="card-surface-2 p-5">
              <h3 className="text-body font-medium text-white mb-1">{c.title}</h3>
              <p className="text-micro font-mono text-slate-500 mb-2">{c.source}</p>
              <p className="text-xs-body text-slate-400">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
