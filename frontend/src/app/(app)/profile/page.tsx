"use client";

import { useState } from "react";
import Link from "next/link";
import type { SkinType } from "@/types";

export default function ProfilePage() {
  const [skinOverride, setSkinOverride] = useState<SkinType>("balanced");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const skinTypes: { value: SkinType; label: string }[] = [
    { value: "dry", label: "Dry" },
    { value: "balanced", label: "Balanced" },
    { value: "oily", label: "Oily" },
  ];

  return (
    <div className="max-w-container mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-section text-white">Profile & Settings</h1>
        <p className="text-xs-body text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left nav */}
        <div className="space-y-1">
          {["Skin Profile", "Account", "Privacy", "Notifications"].map((label, i) => (
            <button
              key={label}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                i === 0 ? "bg-accent/10 text-accent" : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
              } ${i === 3 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={i === 3}
            >
              {label}
              {i === 3 && <span className="text-micro font-mono ml-2 text-slate-600">Phase 2</span>}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Skin Profile */}
          <div className="card-surface-1 p-6">
            <h2 className="text-card-header font-display text-white mb-4">Skin Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <span className="badge-skin-type px-4 py-2 rounded-lg text-sm font-medium">
                Balanced · 72% confidence
              </span>
            </div>
            <div className="mb-4">
              <p className="text-xs-body text-slate-400 mb-2">Manual override</p>
              <div className="flex gap-2">
                {skinTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setSkinOverride(t.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      skinOverride === t.value
                        ? "bg-accent/10 text-accent border border-accent/30"
                        : "bg-surface-2 text-slate-400 border border-transparent hover:border-white/10"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/onboarding" className="text-xs-body text-accent hover:underline">
              Retake questionnaire →
            </Link>
          </div>

          {/* Account */}
          <div className="card-surface-1 p-6">
            <h2 className="text-card-header font-display text-white mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs-body font-medium text-slate-300 mb-1.5">Email</label>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg h-11 px-4 flex items-center text-sm text-slate-400">
                  user@example.com
                </div>
              </div>
              <div>
                <label className="block text-xs-body font-medium text-slate-300 mb-1.5">Connected accounts</label>
                <div className="flex items-center gap-3 bg-surface-2 rounded-lg px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-micro">G</div>
                  <span className="text-sm text-white">Google connected</span>
                </div>
              </div>
              <button className="border border-white/10 text-white font-medium text-sm h-11 px-5 rounded-lg hover:bg-white/5 transition-colors">
                Change password
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="card-surface-1 p-6">
            <h2 className="text-card-header font-display text-white mb-4">Privacy</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-white">Store annotated thumbnails</p>
                  <p className="text-xs-body text-slate-500">Save annotated versions of your check-in images</p>
                </div>
                <div className="relative w-9 h-5 rounded-full bg-accent cursor-pointer">
                  <span className="absolute top-0.5 left-[18px] w-4 h-4 rounded-full bg-white" />
                </div>
              </label>

              <button className="border border-white/10 text-white font-medium text-sm h-11 px-5 rounded-lg hover:bg-white/5 transition-colors w-full sm:w-auto">
                Export all data (JSON)
              </button>

              <div className="pt-4 border-t border-white/[0.06]">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border border-rose-500/50 text-rose-400 font-medium text-sm h-11 px-5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    Delete account
                  </button>
                ) : (
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
                    <p className="text-sm text-rose-400 mb-3">
                      This will permanently delete your account and all data. This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button className="bg-rose-500 text-white font-medium text-sm h-9 px-4 rounded-lg hover:bg-rose-600 transition-colors">
                        Confirm deletion
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-sm text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
