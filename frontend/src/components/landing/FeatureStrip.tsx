import { Scan, Fingerprint, CloudSun, FlaskConical } from "lucide-react";

const features = [
  {
    icon: Scan,
    label: "Lesion Detection",
    description: "YOLOv8-powered subtype classification with bounding box overlay",
  },
  {
    icon: Fingerprint,
    label: "Skin Type Fusion",
    description: "Image analysis + questionnaire for hybrid skin type estimation",
  },
  {
    icon: CloudSun,
    label: "Environmental Context",
    description: "UV, humidity, and air quality correlation at point of capture",
  },
  {
    icon: FlaskConical,
    label: "Ingredient Efficacy",
    description: "Track active ingredients against skin condition over time",
  },
];

export default function FeatureStrip() {
  return (
    <section id="features" className="bg-surface-1 border-y border-white/[0.06]">
      <div className="max-w-container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {features.map((f, i) => (
            <div
              key={f.label}
              className={`flex flex-col items-center text-center px-6 py-6 lg:py-0 ${
                i < features.length - 1
                  ? "lg:border-r border-b lg:border-b-0 border-white/[0.06]"
                  : ""
              }`}
            >
              <f.icon className="w-6 h-6 text-accent mb-3" strokeWidth={1.5} />
              <h3 className="text-body font-medium text-white mb-1">{f.label}</h3>
              <p className="text-micro text-slate-400 max-w-[200px]">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
