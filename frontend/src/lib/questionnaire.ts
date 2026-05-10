/**
 * SkinWISE 2.0 — Skin Profile Questionnaire Scoring Logic
 *
 * Deterministic rubric that maps 7 multiple-choice responses to
 * a normalised probability vector { p_dry, p_balanced, p_oily }.
 * This vector is fused with the CNN prediction in the backend's
 * hybrid skin-typing layer.
 */

/* ─── Types ─── */
export type QuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7';

export interface Question {
  id: QuestionId;
  question: string;
  clinicalSignal: string;
  options: string[];
}

export interface SkinVector {
  p_dry: number;
  p_balanced: number;
  p_oily: number;
}

export type SkinTypeLabel = 'Dry' | 'Balanced' | 'Oily';

/* ─── Questions ─── */
export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'How does your skin feel about 2 hours after washing (no products applied)?',
    clinicalSignal: 'Sebum recovery rate',
    options: [
      'Very tight and uncomfortable',
      'Comfortable and balanced',
      'Slightly oily in T-zone only',
      'Oily all over my face',
    ],
  },
  {
    id: 'q2',
    question: 'How does your T-zone (forehead, nose, chin) look by midday on a typical day?',
    clinicalSignal: 'T-zone sebum production',
    options: [
      'Matte or slightly flaky',
      'Normal — no visible shine',
      'Slightly shiny',
      'Visibly greasy',
    ],
  },
  {
    id: 'q3',
    question: 'How often do you notice flaking or dry patches on your cheeks?',
    clinicalSignal: 'Cheek hydration level',
    options: [
      'Very often — a persistent issue',
      'Sometimes, especially in winter',
      'Rarely',
      'Never — my skin feels well-hydrated',
    ],
  },
  {
    id: 'q4',
    question: 'How does your skin react when you introduce a new skincare product?',
    clinicalSignal: 'Barrier sensitivity',
    options: [
      'Frequently reacts — redness or irritation',
      'Occasionally sensitive',
      'Rarely reacts',
      'Almost never reacts',
    ],
  },
  {
    id: 'q5',
    question: 'How would you describe your pore visibility across your face?',
    clinicalSignal: 'Pore distension index',
    options: [
      'Pores are barely visible',
      'Pores are normal — visible but not prominent',
      'Pores are visible, mainly in T-zone',
      'Pores are large and visible across my face',
    ],
  },
  {
    id: 'q6',
    question: 'How long does sunscreen or makeup last before looking greasy or breaking down?',
    clinicalSignal: 'Surface oil persistence',
    options: [
      'Lasts all day without touch-ups',
      'Lasts most of the day',
      'Starts sliding off T-zone within a few hours',
      'Breaks down within 1–2 hours',
    ],
  },
  {
    id: 'q7',
    question: 'Which phrase best describes your skin on most days?',
    clinicalSignal: 'Self-reported skin type',
    options: [
      'Dry — tight, sometimes flaky',
      'Balanced — rarely problematic',
      'Combination/Oily — shiny T-zone, normal cheeks',
      'Very oily — shiny all over',
    ],
  },
];

/* ─── Scoring Rubric ─── */
// Each array: [dry_score, balanced_score, oily_score] per option index
const RUBRIC: Record<QuestionId, [number, number, number][]> = {
  q1: [[3, 0, 0], [0, 3, 0], [0, 1, 2], [0, 0, 3]],
  q2: [[1, 2, 0], [0, 2, 1], [0, 1, 2], [0, 0, 3]],
  q3: [[3, 0, 0], [1, 2, 0], [0, 2, 1], [0, 1, 2]],
  q4: [[2, 0, 1], [1, 1, 1], [0, 2, 0], [0, 3, 0]],
  q5: [[0, 3, 0], [0, 2, 1], [0, 1, 2], [0, 0, 3]],
  q6: [[0, 3, 0], [0, 2, 1], [0, 1, 2], [0, 0, 3]],
  q7: [[3, 0, 0], [0, 3, 0], [0, 1, 2], [0, 0, 3]],
};

/* ─── Scoring Function ─── */
/**
 * Scores a set of questionnaire responses into a normalised
 * probability vector { p_dry, p_balanced, p_oily }.
 *
 * @param responses — Map of question ID to selected option index (0–3).
 * @returns Normalised probabilities summing to 1.
 */
export function scoreQuestionnaire(
  responses: Record<string, number>
): SkinVector {
  let dryTotal = 0;
  let balancedTotal = 0;
  let oilyTotal = 0;

  for (const question of QUESTIONS) {
    const optionIndex = responses[question.id];
    if (optionIndex === undefined || optionIndex < 0 || optionIndex > 3) {
      continue;
    }
    const [dry, balanced, oily] = RUBRIC[question.id][optionIndex];
    dryTotal += dry;
    balancedTotal += balanced;
    oilyTotal += oily;
  }

  const total = dryTotal + balancedTotal + oilyTotal;

  if (total === 0) {
    return { p_dry: 0.333, p_balanced: 0.333, p_oily: 0.333 };
  }

  return {
    p_dry: Math.round((dryTotal / total) * 1000) / 1000,
    p_balanced: Math.round((balancedTotal / total) * 1000) / 1000,
    p_oily: Math.round((oilyTotal / total) * 1000) / 1000,
  };
}

/* ─── Label Helper ─── */
/**
 * Returns the argmax skin type label from a probability vector.
 */
export function getSkinTypeLabelFromVector(vector: SkinVector): SkinTypeLabel {
  if (vector.p_dry >= vector.p_balanced && vector.p_dry >= vector.p_oily) {
    return 'Dry';
  }
  if (vector.p_balanced >= vector.p_dry && vector.p_balanced >= vector.p_oily) {
    return 'Balanced';
  }
  return 'Oily';
}
