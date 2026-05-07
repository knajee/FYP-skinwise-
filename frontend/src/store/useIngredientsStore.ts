import { create } from 'zustand';
import type { Ingredient } from './types';

interface IngredientsState {
  ingredients: Ingredient[];
  isLoading: boolean;
}

interface IngredientsActions {
  setIngredients: (ingredients: Ingredient[]) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

type IngredientsStore = IngredientsState & IngredientsActions;

export const useIngredientsStore = create<IngredientsStore>((set) => ({
  ingredients: [],
  isLoading: false,

  setIngredients: (ingredients) => set({ ingredients }),
  
  addIngredient: (ingredient) =>
    set((state) => ({
      ingredients: [...state.ingredients, ingredient],
    })),
    
  updateIngredient: (id, updates) =>
    set((state) => ({
      ingredients: state.ingredients.map((ing) =>
        ing.id === id ? { ...ing, ...updates } : ing
      ),
    })),
    
  removeIngredient: (id) =>
    set((state) => ({
      ingredients: state.ingredients.filter((ing) => ing.id !== id),
    })),
    
  setLoading: (loading) => set({ isLoading: loading }),
}));
