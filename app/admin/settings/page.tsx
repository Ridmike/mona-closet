// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSiteSettings, saveSiteSettings, SiteSettings } from "@/lib/db/content";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/shared/Toast";
import { Sliders, Save, RefreshCw, AlertCircle, Sparkles, Megaphone } from "lucide-react";
import { hasPermission } from "@/lib/rbac";

export default function AdminSettingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const canManageSettings = hasPermission(profile?.role, "manageSettings");
  const canViewSettings   = hasPermission(profile?.role, "viewSettings");

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const config = await getSiteSettings();
        setSettings(config);
      } catch (err) {
        console.error("Error loading site config settings:", err);
        toast("Failed to load settings from database.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  const handleSave = async () => {
    if (!settings) return;
    if (!canManageSettings) {
      toast("Access denied. Only Owners can save site settings.", "error");
      return;
    }

    setSaving(true);
    try {
      await saveSiteSettings(settings);
      toast("Site settings saved successfully!", "success");
    } catch (err) {
      console.error("Error saving site config settings:", err);
      toast("Error saving settings. Please check permissions.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
        <p className="text-zinc-500 font-body text-xs">Loading configuration settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-card flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold font-body">Could not initialize settings data. Please reload page.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-zinc-800">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-card border border-zinc-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-medium text-zinc-900">Web Site Settings</h1>
          <p className="text-sm font-body text-zinc-500 mt-1">
            Toggle visibility and control promotion elements across the storefront.
          </p>
        </div>
        {canManageSettings && (
          <Button
            onClick={handleSave}
            loading={saving}
            className="bg-brand-mauve hover:bg-brand-plum flex items-center gap-1.5 py-2.5 px-4 rounded-card text-white font-semibold text-sm transition-all shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        )}
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm overflow-hidden divide-y divide-zinc-100">
        
        <div className="p-6">
          <h3 className="font-display font-medium text-lg text-zinc-900 mb-4 flex items-center gap-2">
            <Sliders className="w-4.5 h-4.5 text-brand-mauve" /> Storefront Announcement & Banners
          </h3>
          <p className="text-xs text-zinc-500 font-body mb-6">
            Configure visibility parameters for promotional layouts on the storefront landing page. Changes apply instantly to all active customers.
          </p>

          <div className="space-y-6">
            {/* Setting 1: Promo Ticker */}
            <div className="flex items-start justify-between gap-6 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="flex gap-3">
                <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 shrink-0 h-fit">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">Promo Ticker Bar (Top of Page)</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-body leading-relaxed max-w-md">
                    Display an infinite horizontal scrolling announcement bar at the absolute top of the page. Highlights new seasons, islandwide delivery, and discount announcements.
                  </p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  disabled={!canManageSettings}
                  checked={settings.showPromoTicker}
                  onChange={(e) => setSettings({ ...settings, showPromoTicker: e.target.checked })}
                  className="sr-only peer"
                  id="promo-ticker-toggle"
                />
                <label
                  htmlFor="promo-ticker-toggle"
                  className="w-11 h-6 bg-zinc-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-blush peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-mauve cursor-pointer"
                />
              </div>
            </div>

            {/* Setting 2: Sale Promo Banner */}
            <div className="flex items-start justify-between gap-6 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="flex gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0 h-fit">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">Sale Promo Banner (Under Hero Ticker)</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-body leading-relaxed max-w-md">
                    Display a colorful lifestyle sale banner with rich background visuals, discount text ("Up to 50% Off"), and a button directing users directly to shop sales.
                  </p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  disabled={!canManageSettings}
                  checked={settings.showSaleBanner}
                  onChange={(e) => setSettings({ ...settings, showSaleBanner: e.target.checked })}
                  className="sr-only peer"
                  id="sale-banner-toggle"
                />
                <label
                  htmlFor="sale-banner-toggle"
                  className="w-11 h-6 bg-zinc-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-blush peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-mauve cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Permissions warning banner */}
        {!canManageSettings && (
          <div className="p-4 bg-amber-50 text-amber-800 text-xs font-body flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>You are logged in with a <strong>{profile?.role}</strong> role. Only Owners can change site-wide visibility rules.</span>
          </div>
        )}

      </div>
    </div>
  );
}
