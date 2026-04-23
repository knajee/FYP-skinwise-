import type {
  LesionClass,
  SeverityGrade,
  IngredientFrequency,
  Question,
} from "@/types";

// ─── Lesion class metadata ───
export const LESION_CLASSES: Record<
  number,
  { key: LesionClass; label: string; abbr: string; color: string }
> = {
  0: { key: "comedone", label: "Comedone", abbr: "C", color: "#CBD5E1" },
  1: { key: "papule", label: "Papule", abbr: "Pa", color: "#FBBF24" },
  2: { key: "pustule", label: "Pustule", abbr: "Pu", color: "#F97316" },
  3: { key: "nodule", label: "Nodule", abbr: "N", color: "#F43F5E" },
};

// ─── Severity thresholds ───
export const SEVERITY_CONFIG: Record<
  SeverityGrade,
  { label: string; minLesions: number; badgeClass: string }
> = {
  clear: { label: "CLEAR", minLesions: 0, badgeClass: "badge-clear" },
  mild: { label: "MILD", minLesions: 1, badgeClass: "badge-mild" },
  moderate: { label: "MODERATE", minLesions: 10, badgeClass: "badge-moderate" },
  severe: { label: "SEVERE", minLesions: 25, badgeClass: "badge-severe" },
};

// ─── Ingredient frequency labels ───
export const FREQUENCY_LABELS: Record<IngredientFrequency, string> = {
  daily: "Daily",
  twice_daily: "Twice daily",
  every_other_day: "Every other day",
  weekly: "Weekly",
};

// ─── Curated ingredient taxonomy ───
export const INGREDIENT_TAXONOMY = [
  "Salicylic Acid",
  "Niacinamide",
  "Retinol",
  "Benzoyl Peroxide",
  "Adapalene",
  "Hyaluronic Acid",
  "Vitamin C",
  "Azelaic Acid",
  "Glycolic Acid",
  "Lactic Acid",
  "Tea Tree Oil",
  "Zinc",
  "Centella Asiatica",
  "Ceramides",
  "Panthenol",
  "Clindamycin",
  "Tretinoin",
  "Sulfur",
  "Kojic Acid",
  "Alpha Arbutin",
] as const;

// ─── Questionnaire ───
export const SKIN_QUESTIONS: Question[] = [
  {
    id: "q1",
    category: "SKIN FEEL",
    text: "How does your skin feel by midday without any products?",
    options: [
      { label: "Tight and dry", value: "dry" },
      { label: "Comfortable and balanced", value: "balanced" },
      { label: "Oily, especially in the T-zone", value: "oily" },
      { label: "Dry in some areas, oily in others", value: "balanced" },
    ],
  },
  {
    id: "q2",
    category: "PORE VISIBILITY",
    text: "How would you describe your pores?",
    options: [
      { label: "Very small, almost invisible", value: "dry" },
      { label: "Small to medium, mostly around the nose", value: "balanced" },
      { label: "Large and visible, especially on cheeks", value: "oily" },
      { label: "Varies across different areas", value: "balanced" },
    ],
  },
  {
    id: "q3",
    category: "PRODUCT ABSORPTION",
    text: "When you apply moisturizer, how does your skin respond?",
    options: [
      { label: "Absorbs quickly, wants more", value: "dry" },
      { label: "Absorbs well, feels hydrated", value: "balanced" },
      { label: "Feels heavy or greasy quickly", value: "oily" },
      { label: "Some areas absorb, others resist", value: "balanced" },
    ],
  },
  {
    id: "q4",
    category: "BREAKOUT FREQUENCY",
    text: "How often do you experience breakouts?",
    options: [
      { label: "Rarely or never", value: "dry" },
      { label: "Occasionally, around my period or stress", value: "balanced" },
      { label: "Frequently, especially in oily areas", value: "oily" },
      { label: "Unpredictably in different areas", value: "balanced" },
    ],
  },
  {
    id: "q5",
    category: "AFTER CLEANSING",
    text: "How does your skin feel after washing your face?",
    options: [
      { label: "Tight and stripped", value: "dry" },
      { label: "Clean and comfortable", value: "balanced" },
      { label: "Clean but oily again within an hour", value: "oily" },
      { label: "Tight in some spots, fine in others", value: "balanced" },
    ],
  },
  {
    id: "q6",
    category: "SKIN TEXTURE",
    text: "How would you describe your skin texture?",
    options: [
      { label: "Rough, flaky patches", value: "dry" },
      { label: "Smooth and even", value: "balanced" },
      { label: "Bumpy or textured in oily zones", value: "oily" },
      { label: "Mix of smooth and rough areas", value: "balanced" },
    ],
  },
  {
    id: "q7",
    category: "SEASONAL CHANGES",
    text: "Does your skin change noticeably with seasons?",
    options: [
      { label: "Gets much drier in winter", value: "dry" },
      { label: "Slight changes but mostly stable", value: "balanced" },
      { label: "Gets oilier in summer", value: "oily" },
      { label: "Dramatic swings between dry and oily", value: "balanced" },
    ],
  },
];

// ─── API config ───
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
