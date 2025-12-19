import React from "react";
import { ViewType } from "../types";
import {
  LayoutDashboard,
  MapPin,
  Package,
  Boxes,
  Bell,
  Settings,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  onCheckLowStock: () => void;
  onLogout?: () => void;
  onLogin?: () => void;
  authed?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  setActiveView,
  onCheckLowStock,
  onLogout,
  onLogin,
  authed = false,
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "items", label: "Items Management", icon: Package },
    { id: "stock", label: "Stock Levels", icon: Boxes },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">
            Enterprise Aerial View-6
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
            Inventory
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeView === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onCheckLowStock}
            className="w-full flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            <Bell size={18} />
            <span>Check Low Stock</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b h-24 shrink-0 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {activeView}
          </h2>
          <div className="flex items-center space-x-5">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {authed ? "AD" : "G"}
            </div>
            <span className="text-sm font-medium text-gray-600">
              {authed ? "Admin User" : "Guest"}
            </span>
            {authed && onLogout && (
              <button
                onClick={onLogout}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg font-semibold"
              >
                Logout
              </button>
            )}
            {!authed && (
              <div className="flex items-center space-x-2">
                {onLogin && (
                  <button
                    onClick={onLogin}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="p-8 pb-16">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
