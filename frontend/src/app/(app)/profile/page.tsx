"use client";

import Link from "next/link";
import { User, Key, Download, Trash2, ChevronRight, CheckCircle2, LogOut } from "lucide-react";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/lib/routes";
import { exportUserData } from "@/lib/api";
import { logoutAction } from "@/app/actions/auth";
import { toast } from "@/lib/toast";
import SkinTypeResultCard from "@/components/skintype/SkinTypeResultCard";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logoutAction();
    logout();
    window.location.href = ROUTES.LOGIN;
  };

  const email = user?.email || "";
  const initial = email ? email.charAt(0).toUpperCase() : "U";
  
  // A mock date since we don't have created_at in the user store currently
  const memberSince = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Dummy result for the card to use if no checkin history is available here
  const mockResult = {
    predicted_label: user?.skinTypePredicted || "Balanced",
    confidence: user?.skinTypeConfidence || 0.8,
    low_confidence: false,
    signal_source: user?.skinTypeSource || "unknown",
    fused_vector: { p_dry: 0.33, p_balanced: 0.34, p_oily: 0.33 },
    cnn_vector: null,
    ques_vector: null,
  };

  const handleExport = async () => {
    const loadingToast = toast.loading("Preparing your data...");
    try {
      const blob = await exportUserData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skinwise_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Data exported successfully", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data", { id: loadingToast });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col items-center text-center space-y-4 py-6">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand text-text-inverse flex items-center justify-center text-3xl font-display">
          {initial}
        </div>
        <div>
          <h1 className="font-display text-2xl text-text-primary">{email}</h1>
          <p className="text-sm text-text-tertiary">Member since {memberSince}</p>
        </div>
      </div>

      {/* Skin Type Section */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider">Your Skin Profile</h2>
          <Link href="/profile/skin-type" className="text-sm text-accent hover:underline">
            Edit
          </Link>
        </div>
        <SkinTypeResultCard 
          result={mockResult} 
          confirmedLabel={user?.skinTypeConfirmed || null} 
        />
      </section>

      {/* Account Section */}
      <section>
        <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4 px-1">Account & Security</h2>
        <div className="glass-panel overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-border-default gap-2">
            <div className="flex items-center gap-3">
              <User size={18} className="text-text-tertiary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Email Address</p>
                <p className="text-xs text-text-tertiary">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-semibold tracking-wide uppercase">
              <CheckCircle2 size={12} /> Google Verified
            </div>
          </div>
          
          <div className="p-4 sm:p-5 flex items-center justify-between group cursor-not-allowed">
            <div className="flex items-center gap-3 opacity-60">
              <Key size={18} className="text-text-tertiary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Change Password</p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider bg-bg-subtle px-2 py-0.5 rounded">Coming soon</span>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section>
        <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4 px-1">Data & Privacy</h2>
        <div className="glass-panel overflow-hidden divide-y divide-skin-border">
          <Link href="/profile/skin-type" className="flex items-center justify-between p-4 sm:p-5 hover:bg-bg-subtle/50 transition-colors group">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-text-primary">Skin type history</p>
            </div>
            <ChevronRight size={18} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
          </Link>
          
          <Link href={ROUTES.QUESTIONNAIRE} className="flex items-center justify-between p-4 sm:p-5 hover:bg-bg-subtle/50 transition-colors group">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-text-primary">Retake questionnaire</p>
            </div>
            <ChevronRight size={18} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
          </Link>
          
          <button onClick={handleExport} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-bg-subtle/50 transition-colors group text-left border-b border-border-default">
            <div className="flex items-center gap-3">
              <Download size={18} className="text-text-primary group-hover:text-accent transition-colors" />
              <p className="text-sm font-medium text-text-primary">Export my data (GDPR)</p>
            </div>
          </button>
          
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-bg-subtle/50 transition-colors group text-left border-b border-border-default">
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-text-primary group-hover:text-accent transition-colors" />
              <p className="text-sm font-medium text-text-primary">Log out</p>
            </div>
          </button>
          
          <Link href="/settings?tab=danger" className="flex items-center justify-between p-4 sm:p-5 hover:bg-severity-severe/5 transition-colors group">
            <div className="flex items-center gap-3">
              <Trash2 size={18} className="text-severity-severe opacity-80 group-hover:opacity-100 transition-opacity" />
              <p className="text-sm font-medium text-severity-severe">Delete account</p>
            </div>
            <ChevronRight size={18} className="text-severity-severe/50 group-hover:text-severity-severe transition-colors" />
          </Link>
        </div>
      </section>
    </div>
  );
}
