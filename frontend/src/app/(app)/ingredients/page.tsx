"use client";

import { useState } from "react";
import { Plus, Pencil, X, Search } from "lucide-react";
import { INGREDIENT_TAXONOMY, FREQUENCY_LABELS } from "@/lib/constants";
import type { IngredientFrequency } from "@/types";

interface IngredientItem {
  id: string;
  name: string;
  concentration: string;
  frequency: IngredientFrequency;
  startDate: string;
  active: boolean;
}

const mockIngredients: IngredientItem[] = [
  { id: "1", name: "Niacinamide", concentration: "10%", frequency: "daily", startDate: "2026-01-15", active: true },
  { id: "2", name: "Retinol", concentration: "0.5%", frequency: "every_other_day", startDate: "2026-02-01", active: true },
  { id: "3", name: "Salicylic Acid", concentration: "2%", frequency: "daily", startDate: "2026-01-20", active: true },
  { id: "4", name: "Benzoyl Peroxide", concentration: "5%", frequency: "twice_daily", startDate: "2025-11-10", active: false },
];

export default function IngredientsPage() {
  const [tab, setTab] = useState<"active" | "discontinued">("active");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = mockIngredients.filter(
    (i) => (tab === "active" ? i.active : !i.active)
  );

  const taxonomyFiltered = INGREDIENT_TAXONOMY.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-section text-white">Ingredients</h1>
          <p className="text-xs-body text-slate-400 mt-1">Track your active skincare ingredients</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-accent text-black font-medium text-sm h-9 px-4 rounded-lg hover:bg-accent-hover transition-colors flex items-center gap-2 lg:hidden"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("active")}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                tab === "active" ? "bg-accent/10 text-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              Active <span className="text-micro font-mono ml-1">({mockIngredients.filter((i) => i.active).length})</span>
            </button>
            <button
              onClick={() => setTab("discontinued")}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                tab === "discontinued" ? "bg-accent/10 text-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              Discontinued
            </button>
          </div>

          {/* Ingredient cards */}
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="card-surface-1 p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.active ? "bg-emerald-400" : "bg-slate-600"}`} />
                  <div>
                    <p className="text-body text-white">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-micro font-mono text-slate-500">{item.concentration}</span>
                      <span className="text-micro text-slate-600">·</span>
                      <span className="text-micro text-slate-500">{FREQUENCY_LABELS[item.frequency]}</span>
                      <span className="text-micro text-slate-600">·</span>
                      <span className="text-micro font-mono text-slate-500">Since {new Date(item.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-slate-400 hover:text-white" aria-label="Edit"><Pencil size={14} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-rose-400" aria-label="Remove"><X size={14} /></button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="font-display text-xl text-white mb-2">No ingredients</p>
                <p className="text-sm text-slate-400">{tab === "active" ? "Add your first ingredient to start tracking." : "No discontinued ingredients."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Add panel */}
        <div className={`card-surface-1 p-6 h-fit ${showAdd ? "block" : "hidden lg:block"}`}>
          <h3 className="text-card-header font-display text-white mb-4">Add Ingredient</h3>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label htmlFor="ingredient-name" className="block text-xs-body font-medium text-slate-300 mb-1.5">Name</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="ingredient-name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ingredients..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg h-11 pl-9 pr-4 text-white text-sm placeholder:text-slate-500 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
              {search && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {taxonomyFiltered.slice(0, 8).map((name) => (
                    <button
                      key={name}
                      onClick={() => setSearch(name)}
                      className="text-micro bg-surface-2 text-slate-300 px-2.5 py-1 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="concentration" className="block text-xs-body font-medium text-slate-300 mb-1.5">Concentration (optional)</label>
              <input id="concentration" placeholder="e.g. 10%" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg h-11 px-4 text-white text-sm placeholder:text-slate-500 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all" />
            </div>
            <div>
              <label htmlFor="frequency" className="block text-xs-body font-medium text-slate-300 mb-1.5">Frequency</label>
              <select id="frequency" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg h-11 px-4 text-white text-sm focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all appearance-none">
                {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-surface-1">{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="start-date" className="block text-xs-body font-medium text-slate-300 mb-1.5">Start date</label>
              <input id="start-date" type="date" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg h-11 px-4 text-white text-sm focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full bg-accent text-black font-medium text-sm h-11 rounded-lg hover:bg-accent-hover transition-colors">
              Add to stack
            </button>
          </form>

          {/* Taxonomy chips */}
          <div className="mt-4">
            <p className="text-micro text-slate-500 mb-2">Popular ingredients</p>
            <div className="flex flex-wrap gap-1.5">
              {INGREDIENT_TAXONOMY.slice(0, 10).map((name) => (
                <button
                  key={name}
                  onClick={() => setSearch(name)}
                  className="text-micro bg-surface-2 text-slate-400 px-2 py-1 rounded hover:text-accent transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
