"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Droplet, Droplets, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkinTypeOverrideModalProps {
  currentLabel: string;
  onConfirm: (newLabel: string) => void;
  onClose: () => void;
}

const CARDS = [
  {
    id: "Dry",
    icon: Droplet,
    label: "Dry",
    description: "Feels tight, prone to flaking",
  },
  {
    id: "Balanced",
    icon: Scale, // Balanced scale approximation
    label: "Balanced",
    description: "Generally comfortable, minimal issues",
  },
  {
    id: "Oily",
    icon: Droplets,
    label: "Oily",
    description: "Shiny, large pores, prone to congestion",
  },
];

export default function SkinTypeOverrideModal({
  currentLabel,
  onConfirm,
  onClose,
}: SkinTypeOverrideModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>(currentLabel);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    
    // Focus trap & Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
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
    
    // Auto focus first element
    setTimeout(() => {
      if (modalRef.current) {
        const firstElement = modalRef.current.querySelector('button') as HTMLElement;
        firstElement?.focus();
      }
    }, 100);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  const hasChanged = selectedLabel !== currentLabel;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Dialog */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="override-modal-title"
        aria-describedby="override-modal-desc"
        className="relative w-full max-w-2xl bg-bg-base rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default">
          <div>
            <h2 id="override-modal-title" className="font-display text-2xl text-text-primary">
              Set your skin type
            </h2>
            <p id="override-modal-desc" className="text-sm text-text-tertiary mt-1">
              Override the model prediction with your own assessment.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CARDS.map((card) => {
              const isSelected = selectedLabel === card.id;
              const Icon = card.icon;
              
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedLabel(card.id)}
                  className={cn(
                    "flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                    isSelected
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border-default bg-bg-surface hover:border-accent/30 hover:bg-bg-subtle/50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
                    isSelected ? "bg-accent text-text-inverse" : "bg-bg-subtle text-text-primary"
                  )}>
                    <Icon size={24} />
                  </div>
                  <span className="font-display text-lg text-text-primary mb-2">{card.label}</span>
                  <span className="text-xs text-text-tertiary leading-relaxed">{card.description}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-text-tertiary text-center mt-6 bg-bg-surface p-3 rounded-lg border border-border-default">
            Your override is saved and used for all future recommendations. You can change this anytime from Profile Settings.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-default bg-bg-surface flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 h-10 rounded-card font-medium text-sm text-text-primary hover:bg-bg-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedLabel)}
            disabled={!hasChanged}
            className="px-6 h-10 rounded-card font-medium text-sm bg-brand text-text-inverse hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
