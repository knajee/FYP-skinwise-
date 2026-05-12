export const INGREDIENT_TAXONOMY: string[] = [
  'Salicylic Acid', 'Benzoyl Peroxide', 'Niacinamide', 'Retinol', 'Adapalene', 
  'Azelaic Acid', 'Clindamycin', 'Glycolic Acid', 'Hyaluronic Acid', 'Ceramides', 
  'Zinc', 'Sulfur', 'Tea Tree Oil', 'Kojic Acid', 'Tranexamic Acid', 
  'Lactic Acid', 'Mandelic Acid', 'Centella Asiatica', 'Panthenol', 'Retinoids (Other)'
];

export const FREQUENCY_OPTIONS: string[] = [
  'Once daily (AM)', 'Once daily (PM)', 'Twice daily', 
  'Every other day', 'Weekly', 'As needed'
];

export type IngredientCategory = 'exfoliant' | 'retinoid' | 'antibacterial' | 'hydrating' | 'brightening' | 'barrier' | 'other';

export function getIngredientCategory(name: string): IngredientCategory {
  const n = name.toLowerCase();
  
  if (n.includes('salicylic') || n.includes('glycolic') || n.includes('lactic') || n.includes('mandelic') || n.includes('acid') && !n.includes('hyaluronic') && !n.includes('azelaic') && !n.includes('kojic') && !n.includes('tranexamic')) {
    return 'exfoliant';
  }
  
  if (n.includes('retinol') || n.includes('adapalene') || n.includes('retinoid') || n.includes('tretinoin')) {
    return 'retinoid';
  }
  
  if (n.includes('benzoyl') || n.includes('clindamycin') || n.includes('tea tree') || n.includes('zinc') || n.includes('sulfur')) {
    return 'antibacterial';
  }
  
  if (n.includes('hyaluronic') || n.includes('ceramide') || n.includes('panthenol') || n.includes('centella') || n.includes('glycerin')) {
    return 'hydrating';
  }
  
  if (n.includes('kojic') || n.includes('tranexamic') || n.includes('niacinamide') || n.includes('azelaic') || n.includes('vitamin c') || n.includes('ascorbic')) {
    return 'brightening';
  }
  
  if (n.includes('barrier') || n.includes('peptide')) {
    return 'barrier';
  }
  
  return 'other';
}

export const CATEGORY_COLORS: Record<IngredientCategory, { bg: string, text: string }> = {
  exfoliant:    { bg: '#FFF4E0', text: '#A0621A' },
  retinoid:     { bg: '#FCE4EC', text: '#9B2335' },
  antibacterial:{ bg: '#E8F5E9', text: '#2D6A4F' },
  hydrating:    { bg: '#E3F2FD', text: '#1565C0' },
  brightening:  { bg: '#F3E5F5', text: '#6A1B9A' },
  barrier:      { bg: '#FFF8E1', text: '#F57F17' },
  other:        { bg: '#ECEFF1', text: '#37474F' },
};
