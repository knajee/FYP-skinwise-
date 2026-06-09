"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

import IngredientsList from "@/components/ingredients/IngredientsList";
import AddIngredientForm from "@/components/ingredients/AddIngredientForm";

export default function IngredientsPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Read banner state from localStorage on mount
  useEffect(() => {
    const hidden = localStorage.getItem("skinwise_hide_ingredients_banner");
    if (hidden === "true") {
      setShowBanner(false);
    }
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("skinwise_hide_ingredients_banner", "true");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Banner */}
      {showBanner && (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-3 relative">
          <div className="max-w-7xl mx-auto flex items-start gap-4 pr-6 text-sm text-accent font-medium">
            <p>
              Each check-in automatically links to your active ingredients at that date. Phase 2 will show efficacy trends.
            </p>
          </div>
          <button 
            onClick={dismissBanner}
            className="absolute right-4 top-3 text-accent/70 hover:text-accent p-0.5 rounded-full hover:bg-accent/10 transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-text-primary">My Ingredients</h1>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-card bg-brand text-text-inverse text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Ingredient
        </button>
        
        {/* Mobile FAB */}
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="sm:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-brand text-text-inverse flex items-center justify-center shadow-xl hover:bg-brand/90 transition-transform active:scale-95"
          aria-label="Add Ingredient"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <IngredientsList onAddFirst={() => setIsPanelOpen(true)} />
      </div>

      {/* Slide-over / Bottom Sheet */}
      {isPanelOpen && (
        <IngredientPanel onClose={() => setIsPanelOpen(false)} />
      )}
    </div>
  );
}

function IngredientPanel({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      
      if (e.key === "Tab" && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    
    setTimeout(() => {
      if (panelRef.current) {
        const firstElement = panelRef.current.querySelector('input') as HTMLElement || panelRef.current.querySelector('button') as HTMLElement;
        firstElement?.focus();
      }
    }, 100);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-ingredient-title"
        className={cn(
          "relative bg-bg-base w-full sm:w-[400px] h-[85vh] sm:h-full flex flex-col rounded-t-2xl sm:rounded-none shadow-2xl overflow-hidden animate-in duration-300",
          "slide-in-from-bottom sm:slide-in-from-right"
        )}
      >
        {/* Drag Handle (Mobile) */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-border-default rounded-full" />
        </div>
        
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-default">
          <h2 id="add-ingredient-title" className="font-display text-xl text-text-primary">Add Ingredient</h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-full transition-colors"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AddIngredientForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
