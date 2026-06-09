"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { INGREDIENT_TAXONOMY, FREQUENCY_OPTIONS } from "@/lib/ingredients";
import { addIngredient } from "@/lib/api";
import { useIngredientsStore } from "@/store";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  concentration: z.string().optional(),
  frequency: z.string().min(1, "Frequency is required"),
  started_at: z
    .string()
    .min(1, "Date started is required")
    .refine((date) => new Date(date) <= new Date(), {
      message: "Start date cannot be in the future",
    }),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

interface AddIngredientFormProps {
  onSuccess?: () => void;
}

export default function AddIngredientForm({ onSuccess }: AddIngredientFormProps) {
  const addStoreIngredient = useIngredientsStore(s => s.addIngredient);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>(INGREDIENT_TAXONOMY);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      concentration: "",
      frequency: FREQUENCY_OPTIONS[0],
      started_at: new Date().toISOString().split("T")[0],
    },
  });

  const nameValue = watch("name");

  // Filter dropdown based on input
  useEffect(() => {
    if (!nameValue) {
      setDropdownOptions(INGREDIENT_TAXONOMY);
    } else {
      const filtered = INGREDIENT_TAXONOMY.filter(item => 
        item.toLowerCase().includes(nameValue.toLowerCase())
      );
      setDropdownOptions(filtered);
    }
  }, [nameValue]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = async (data: IngredientFormValues) => {
    setIsSubmitting(true);
    try {
      const newIngredient = await addIngredient({
        name: data.name,
        concentration: data.concentration || null,
        frequency: data.frequency,
        started_at: new Date(data.started_at).toISOString(),
      });
      
      addStoreIngredient(newIngredient);
      toast.success("Ingredient added");
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add ingredient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name Field (Combobox) */}
      <div className="relative space-y-1.5" ref={dropdownRef}>
        <label htmlFor="name" className="text-sm font-medium text-text-primary">
          Ingredient Name <span className="text-severity-severe">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          onFocus={() => setShowDropdown(true)}
          placeholder="e.g. Salicylic Acid"
          className="w-full h-11 px-3 rounded-lg border border-border-default bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          autoComplete="off"
        />
        
        {showDropdown && dropdownOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white rounded-card shadow-lg border border-border-default py-1">
            {dropdownOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setValue("name", option);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-subtle focus:bg-bg-subtle outline-none transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {errors.name && <p className="text-xs text-severity-severe">{errors.name.message}</p>}
      </div>

      {/* Concentration Field */}
      <div className="space-y-1.5">
        <label htmlFor="concentration" className="text-sm font-medium text-text-primary">
          Concentration <span className="text-text-tertiary font-normal text-xs">(optional)</span>
        </label>
        <input
          id="concentration"
          type="text"
          {...register("concentration")}
          placeholder="e.g. 2%, 0.1%"
          className="w-full h-11 px-3 rounded-lg border border-border-default bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        />
      </div>

      {/* Frequency Field */}
      <div className="space-y-1.5">
        <label htmlFor="frequency" className="text-sm font-medium text-text-primary">
          Usage Frequency <span className="text-severity-severe">*</span>
        </label>
        <div className="relative">
          <select
            id="frequency"
            {...register("frequency")}
            className="w-full h-11 px-3 rounded-lg border border-border-default bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm appearance-none pr-10"
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-tertiary">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
            </svg>
          </div>
        </div>
        {errors.frequency && <p className="text-xs text-severity-severe">{errors.frequency.message}</p>}
      </div>

      {/* Date Started Field */}
      <div className="space-y-1.5">
        <label htmlFor="started_at" className="text-sm font-medium text-text-primary">
          Date started <span className="text-severity-severe">*</span>
        </label>
        <input
          id="started_at"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          {...register("started_at")}
          className="w-full h-11 px-3 rounded-lg border border-border-default bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        />
        {errors.started_at && <p className="text-xs text-severity-severe">{errors.started_at.message}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-brand text-text-inverse rounded-card text-sm font-medium flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors disabled:opacity-70"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Adding..." : "Add Ingredient"}
        </button>
      </div>

      <p className="text-xs text-center text-text-tertiary bg-bg-subtle/50 p-3 rounded-lg mt-4">
        Adding ingredients helps SkinWISE track their effect on your lesion counts over time.
      </p>
    </form>
  );
}
