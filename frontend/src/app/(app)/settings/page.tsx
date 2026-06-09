"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Shield, AlertTriangle, Download, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { exportUserData, deleteAccount } from "@/lib/api";
import { logoutAction } from "@/app/actions/auth";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type TabKey = "account" | "privacy" | "danger";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("account");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "account" || tabParam === "privacy" || tabParam === "danger") {
      setActiveTab(tabParam as TabKey);
    }
  }, [searchParams]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 py-4">
      {/* Sidebar Tabs */}
      <aside className="w-full md:w-64 shrink-0">
        <h1 className="font-display text-3xl text-text-primary mb-6 px-1">Settings</h1>
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          <TabButton 
            label="Account" 
            icon={User} 
            active={activeTab === "account"} 
            onClick={() => setActiveTab("account")} 
          />
          <TabButton 
            label="Privacy & Data" 
            icon={Shield} 
            active={activeTab === "privacy"} 
            onClick={() => setActiveTab("privacy")} 
          />
          <TabButton 
            label="Danger Zone" 
            icon={AlertTriangle} 
            active={activeTab === "danger"} 
            onClick={() => setActiveTab("danger")} 
            danger
          />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="glass-panel p-6 md:p-8 min-h-[400px]">
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "privacy" && <PrivacySettings />}
          {activeTab === "danger" && <DangerSettings />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, icon: Icon, active, onClick, danger }: { label: string; icon: React.ElementType; active: boolean; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
        active 
          ? danger 
            ? "bg-severity-severe/10 text-severity-severe" 
            : "bg-accent/15 text-accent"
          : danger
            ? "text-text-tertiary hover:text-severity-severe hover:bg-severity-severe/5"
            : "text-text-tertiary hover:text-text-primary hover:bg-bg-subtle"
      )}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function AccountSettings() {
  const user = useAuthStore(s => s.user);
  const [storeImages, setStoreImages] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-xl font-display text-text-primary">Account Preferences</h2>
      
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Email Address</label>
          <input 
            type="email" 
            value={user?.email || ""} 
            disabled 
            className="w-full h-11 px-3 rounded-lg border border-border-default bg-bg-subtle/50 text-text-tertiary text-sm cursor-not-allowed"
          />
        </div>

        <div className="pt-4 border-t border-border-default space-y-6">
          {/* Storage Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Thumbnail storage</p>
              <p className="text-xs text-text-tertiary mt-1 max-w-sm">Opt-in to securely store your annotated check-in photos for your personal history. If disabled, images are only processed in memory.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={storeImages}
                onChange={(e) => {
                  setStoreImages(e.target.checked);
                  toast.success("Preference saved");
                }}
              />
              <div className="w-11 h-6 bg-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          {/* Reminders Toggle */}
          <div className="flex items-start justify-between gap-4 opacity-60">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary">Check-in reminders</p>
                <span className="text-[9px] font-semibold tracking-wider uppercase bg-bg-subtle px-1.5 py-0.5 rounded text-text-tertiary">Phase 2</span>
              </div>
              <p className="text-xs text-text-tertiary mt-1 max-w-sm">Receive email reminders to log your skin progress.</p>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed shrink-0 mt-1">
              <input type="checkbox" className="sr-only peer" disabled />
              <div className="w-11 h-6 bg-bg-subtle border border-border-default rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-default after:border after:rounded-full after:h-5 after:w-5"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacySettings() {
  const handleDownload = async () => {
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
      toast.success("Data downloaded", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Download failed", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-xl font-display text-text-primary">Privacy & Data</h2>
      
      <div className="space-y-6">
        <p className="text-sm text-text-tertiary">
          We believe your health data belongs to you. Here is exactly what we store and how we use it.
        </p>

        <ul className="space-y-4 text-sm">
          <li className="flex gap-3">
            <Shield size={16} className="text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Email address:</span> <span className="text-text-tertiary">Required for account creation and login.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <Shield size={16} className="text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Check-in results:</span> <span className="text-text-tertiary">Lesion counts, severity, and skin type are stored indefinitely to build your trend history.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <Shield size={16} className="text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Environmental data:</span> <span className="text-text-tertiary">Linked to check-in capture time to identify triggers.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <Shield size={16} className="text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Annotated photos:</span> <span className="text-text-tertiary">Stored only if you explicitly opt in via Account Settings.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <Shield size={16} className="text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Raw uploaded photos:</span> <span className="text-text-tertiary">Never stored. Processed in memory only.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <Shield size={16} className="text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Raw GPS coordinates:</span> <span className="text-text-tertiary">Never stored. Rounded to ±1.1km before any use for environmental fetching.</span>
            </div>
          </li>
        </ul>

        <div className="bg-bg-subtle/50 border border-border-default rounded-xl p-5 mt-6">
          <h3 className="text-sm font-medium text-text-primary mb-2">Your rights under GDPR</h3>
          <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
            You have the right to <strong>Access</strong> (download your data below), <strong>Rectification</strong> (edit your skin type via Profile), <strong>Erasure</strong> (delete your account in Danger Zone), and <strong>Portability</strong>.
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-border-default text-text-primary text-sm font-medium hover:bg-bg-subtle transition-colors shadow-sm"
          >
            <Download size={16} />
            Download my data
          </button>
        </div>
      </div>
    </div>
  );
}

function DangerSettings() {
  const router = useRouter();
  const logout = useAuthStore(s => s.logout);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      await logoutAction();
      logout();
      router.push("/goodbye");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-xl font-display text-severity-severe">Danger Zone</h2>
      
      <div className="border border-severity-severe/20 rounded-xl overflow-hidden">
        <div className="bg-severity-severe/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-severity-severe shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-1">Delete Account</h3>
              <p className="text-xs text-text-tertiary max-w-lg mb-4">
                This will permanently delete your account, skin profile, and all check-in history. This action is irreversible.
              </p>
              
              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  className="h-10 px-4 rounded-lg bg-severity-severe text-text-primary text-sm font-medium hover:bg-severity-severe/90 transition-colors shadow-sm"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-white border border-severity-severe/20 rounded-lg p-4 shadow-sm animate-fade-in">
                  <p className="text-xs font-medium text-text-primary mb-3">
                    Type <span className="font-bold text-severity-severe select-all">DELETE</span> to confirm
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full h-10 px-3 rounded-md border border-border-default mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-skin-rose/50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setStep(1);
                        setConfirmText("");
                      }}
                      className="h-9 px-3 rounded-md border border-border-default bg-white text-text-primary text-xs font-medium hover:bg-bg-subtle transition-colors"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={confirmText !== "DELETE" || isDeleting}
                      className="flex items-center gap-2 h-9 px-4 rounded-md bg-severity-severe text-text-primary text-xs font-medium hover:bg-severity-severe/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting && <Loader2 size={14} className="animate-spin" />}
                      Permanently Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
