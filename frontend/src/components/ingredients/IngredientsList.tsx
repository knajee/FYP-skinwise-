"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, FlaskConical } from "lucide-react";
import toast from "react-hot-toast";

import { useIngredientsStore, useAuthStore } from "@/store";
import { getIngredients, deleteIngredient, discontinueIngredient } from "@/lib/api";
import IngredientCard from "./IngredientCard";
import SkeletonIngredientCard from "@/components/ui/skeletons/SkeletonIngredientCard";
import EmptyState from "@/components/ui/EmptyState";
import InlineError from "@/components/ui/InlineError";

interface IngredientsListProps {
  onAddFirst?: () => void;
}

export default function IngredientsList({ onAddFirst }: IngredientsListProps) {
  const user = useAuthStore(s => s.user);
  const { ingredients, setIngredients, removeIngredient, updateIngredient } = useIngredientsStore();
  const [showDiscontinued, setShowDiscontinued] = useState(false);

  const { isLoading, isError } = useQuery({
    queryKey: ["ingredients", user?.id],
    queryFn: async () => {
      const data = await getIngredients();
      setIngredients(data);
      return data;
    },
    enabled: !!user?.id,
  });

  const handleDiscontinue = async (id: string) => {
    try {
      const updated = await discontinueIngredient(id);
      updateIngredient(id, updated);
      toast.success("Ingredient discontinued");
    } catch (error) {
      console.error(error);
      toast.error("Failed to discontinue ingredient");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIngredient(id);
      removeIngredient(id);
      toast.success("Ingredient deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete ingredient");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <SkeletonIngredientCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return <InlineError message="Failed to load ingredients. Please try again." />;
  }

  if (ingredients.length === 0) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No ingredients tracked yet"
        description="Add the skincare products you're currently using to track their effect on your skin."
        action={onAddFirst ? { label: "Add First Ingredient", onClick: onAddFirst } : undefined}
        className="glass-panel mt-10"
      />
    );
  }

  const active_ingredients = ingredients.filter(i => !i.discontinued_at).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  const discontinuedIngredients = ingredients.filter(i => i.discontinued_at).sort((a, b) => new Date(b.discontinued_at!).getTime() - new Date(a.discontinued_at!).getTime());

  return (
    <div className="space-y-8">
      {/* Active Section */}
      <section>
        <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4 px-1">
          Active ({active_ingredients.length})
        </h2>
        
        {active_ingredients.length === 0 ? (
          <p className="text-sm text-text-tertiary italic p-4 bg-bg-surface border border-border-default rounded-xl">
            You don&apos;t have any active ingredients.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active_ingredients.map(ing => (
              <IngredientCard 
                key={ing.id} 
                ingredient={ing} 
                onDiscontinue={() => handleDiscontinue(ing.id)}
                onDelete={() => handleDelete(ing.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Discontinued Section */}
      {discontinuedIngredients.length > 0 && (
        <section>
          <button
            onClick={() => setShowDiscontinued(!showDiscontinued)}
            className="flex items-center gap-2 text-sm font-medium text-text-primary hover:bg-bg-subtle px-3 py-2 rounded-lg transition-colors -ml-3 mb-2"
          >
            {showDiscontinued ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Discontinued ({discontinuedIngredients.length})
          </button>
          
          {showDiscontinued && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {discontinuedIngredients.map(ing => (
                <IngredientCard 
                  key={ing.id} 
                  ingredient={ing} 
                  onDiscontinue={() => {}} // Already discontinued
                  onDelete={() => handleDelete(ing.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
