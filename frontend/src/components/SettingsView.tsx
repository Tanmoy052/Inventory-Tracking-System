import React, { useState } from "react";
import { Mail, Building, Save, CheckCircle2 } from "lucide-react";
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
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
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
              className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="flex justify-end items-center pt-4">
            {saved && (
              <div className="mr-auto flex items-center space-x-2 text-emerald-600 text-sm">
                <CheckCircle2 size={18} />
                <span>Settings updated</span>
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold"
            >
              {saving ? "Saving..." : <Save size={20} />}
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
