"use client";

import { useState } from "react";
import { Calendar, XCircle, Trash2, Pencil } from "lucide-react";
import type { Ingredient } from "@/store/types";
import { getIngredientCategory, CATEGORY_COLORS } from "@/lib/ingredients";

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit?: () => void;
  onDiscontinue: () => void;
  onDelete: () => void;
}

export default function IngredientCard({ ingredient, onEdit, onDiscontinue, onDelete }: IngredientCardProps) {
  const [showDiscontinueConfirm, setShowDiscontinueConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const category = getIngredientCategory(ingredient.name);
  const categoryStyle = CATEGORY_COLORS[category];
  
  const isActive = !ingredient.discontinued_at;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          {/* Category Pill */}
          <span 
            className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
            style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
          >
            {category}
          </span>
          
          {/* Name & Chips */}
          <div>
            <h3 className="font-display text-lg text-text-primary mb-2">{ingredient.name}</h3>
            <div className="flex flex-wrap gap-2">
              {ingredient.concentration && (
                <span className="inline-flex px-2.5 py-1 rounded-full bg-bg-subtle text-xs text-text-secondary">
                  {ingredient.concentration}
                </span>
              )}
              <span className="inline-flex px-2.5 py-1 rounded-full bg-bg-subtle text-xs text-text-secondary">
                {ingredient.frequency}
              </span>
            </div>
          </div>
          
          {/* Dates & Status */}
          <div className="pt-2 flex flex-col gap-1.5 text-xs text-text-tertiary">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>Started: {formatDate(ingredient.started_at)}</span>
            </div>
            
            {isActive ? (
              <span className="inline-flex items-center text-feedback-success font-medium bg-feedback-success-bg rounded-full px-2.5 py-1 text-xs">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center text-text-tertiary font-medium bg-bg-muted rounded-full px-2.5 py-1 text-xs">
                Discontinued {formatDate(ingredient.discontinued_at!)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-full transition-colors"
              title="Edit ingredient"
              aria-label="Edit ingredient"
            >
              <Pencil size={16} />
            </button>
          )}
          
          {isActive && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowDiscontinueConfirm(true);
                  setShowDeleteConfirm(false);
                }}
                className="p-1.5 text-text-tertiary hover:text-severity-moderate hover:bg-bg-subtle rounded-full transition-colors"
                title="Discontinue ingredient"
                aria-label="Discontinue ingredient"
              >
                <XCircle size={16} />
              </button>
              
              {showDiscontinueConfirm && (
                <div className="absolute right-0 top-10 w-48 bg-white shadow-lg border border-border-default rounded-xl p-3 z-10 animate-in fade-in zoom-in-95">
                  <p className="text-xs font-medium text-text-primary mb-2">Discontinue this ingredient?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowDiscontinueConfirm(false)} className="px-2 py-1 text-xs hover:bg-bg-subtle rounded">No</button>
                    <button 
                      onClick={() => {
                        onDiscontinue();
                        setShowDiscontinueConfirm(false);
                      }} 
                      className="px-2 py-1 text-xs bg-severity-moderate text-text-primary rounded hover:bg-severity-moderate/90"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="relative">
            <button 
              onClick={() => {
                setShowDeleteConfirm(true);
                setShowDiscontinueConfirm(false);
              }}
              className="p-1.5 text-text-tertiary hover:text-severity-severe hover:bg-bg-subtle rounded-full transition-colors"
              title="Delete permanently"
              aria-label="Delete ingredient"
            >
              <Trash2 size={16} />
            </button>
            
            {showDeleteConfirm && (
              <div className="absolute right-0 top-10 w-64 bg-white shadow-lg border border-severity-severe/20 rounded-xl p-3 z-10 animate-in fade-in zoom-in-95">
                <p className="text-xs font-medium text-text-primary mb-1">Delete ingredient?</p>
                <p className="text-[10px] text-text-tertiary mb-3">This will permanently remove this ingredient and its history.</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-2 py-1 text-xs hover:bg-bg-subtle rounded">Cancel</button>
                  <button 
                    onClick={() => {
                      onDelete();
                      setShowDeleteConfirm(false);
                    }} 
                    className="px-2 py-1 text-xs bg-severity-severe text-text-primary rounded hover:bg-severity-severe/90"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
