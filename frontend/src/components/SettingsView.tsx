import React, { useState } from "react";
import {
  Mail,
  Building,
  Save,
  CheckCircle2,
  Server,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { SystemSettings } from "../types";

interface Props {
  settings: SystemSettings;
  onUpdate: (newSettings: SystemSettings) => Promise<void>;
}

const SettingsView: React.FC<Props> = ({ settings, onUpdate }) => {
  const [email, setEmail] = useState(settings.alertEmail);
  const [org, setOrg] = useState(settings.organizationName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdate({
      alertEmail: email,
      organizationName: org,
      adminEmail: settings.adminEmail,
      adminPasswordHash: settings.adminPasswordHash,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50 border-b">
            <h3 className="text-lg font-bold text-gray-800">
              System Configuration
            </h3>
            <p className="text-sm text-gray-500">
              Define global parameters for alerts and organization details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 flex items-center space-x-2">
                <Mail size={16} className="text-blue-500" />
                <span>Alert Recipient Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
                placeholder="alerts@example.com"
                required
              />
              <p className="text-xs text-gray-400">
                The email that will receive stock notifications.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 flex items-center space-x-2">
                <Building size={16} className="text-blue-500" />
                <span>Organization Name</span>
              </label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enterprise Logistics Corp"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>

            <div className="pt-4 flex items-center justify-between">
              {saved && (
                <div className="flex items-center space-x-2 text-emerald-600 font-medium text-sm animate-in fade-in duration-300">
                  <CheckCircle2 size={18} />
                  <span>Settings updated successfully</span>
                </div>
              )}
              <div className="flex-1"></div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 active:scale-95"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                ) : (
                  <Save size={20} />
                )}
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border p-8 space-y-4">
          <div className="flex items-center space-x-3 text-blue-600 mb-2">
            <ShieldCheck size={24} />
            <h4 className="text-lg font-bold text-gray-800">
              Operational Integrity
            </h4>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your data is stored securely in the local browser database. Changes
            to these settings persist across sessions. For enterprise-scale
            multi-user support, connect this frontend to a centralized MongoDB
            cluster.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6 sticky top-24">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <Server className="text-blue-400" size={24} />
            <h4 className="text-xl font-bold">Production Path</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Current Status
              </p>
              <p className="text-sm text-slate-300">
                Frontend Prototype (Simulation Mode)
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                How to get real emails?
              </p>
              <ul className="text-xs space-y-3 text-slate-400">
                <li className="flex items-start space-x-2">
                  <div className="h-1 w-1 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>1. Connect to an Express.js Backend.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="h-1 w-1 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>
                    2. Integrate <strong>SendGrid</strong> or{" "}
                    <strong>EmailJS</strong> API.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="h-1 w-1 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>
                    3. Backend will trigger SMTP to your Gmail inbox
                    automatically.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 mb-2">
                  DEVELOPER CONSOLE STATUS
                </p>
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>SMTP Mock Listening...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
          <div className="flex items-center space-x-2 text-blue-700 font-bold mb-2">
            <Globe size={18} />
            <span>Deployment Info</span>
          </div>
          <p className="text-xs text-blue-600 leading-relaxed">
            In this demo, clicking "Send to my Inbox Now" in the alert modal
            opens your local mail client as a functional bridge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
