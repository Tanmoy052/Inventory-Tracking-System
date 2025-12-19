import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login";
import DashboardStats from "./components/DashboardStats";
import SettingsView from "./components/SettingsView";
import {
  LocationTable,
  ItemTable,
  StockTable,
} from "./components/InventoryTables";
import {
  LocationModal,
  ItemModal,
  LowStockAlertModal,
} from "./components/Modals";
import { api } from "./services/api";
import { analyzeLowStock } from "./services/ai";
import {
  ViewType,
  Location,
  Item,
  StockWithDetails,
  SystemSettings,
} from "./types";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Package,
} from "lucide-react";

const PAGE_SIZE = 10;

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [authed, setAuthed] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [stock, setStock] = useState<StockWithDetails[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [totalStock, setTotalStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Modals state
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // UI filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchBaseData = useCallback(async () => {
    const [l, i, s] = await Promise.all([
      api.getLocations(),
      api.getItems(),
      api.getSettings(),
    ]);
    setLocations(l);
    setItems(i);
    setSettings(s);
  }, []);

  const fetchStockData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total } = await api.getFullStock({
        page,
        pageSize: PAGE_SIZE,
        locationId: locationFilter || undefined,
        itemId: itemFilter || undefined,
        search: searchTerm || undefined,
      });
      setStock(data);
      setTotalStock(total);
    } catch (error) {
      console.error("Failed to load stock", error);
    } finally {
      setLoading(false);
    }
  }, [page, locationFilter, itemFilter, searchTerm]);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  useEffect(() => {
    const authFlag = localStorage.getItem("inv_admin_auth");
    setAuthed(authFlag === "1");
  }, []);

  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    await api.updateSettings(newSettings);
    setSettings(newSettings);
  };

  const handleAddLocation = async (data: any) => {
    await api.addLocation(data);
    setIsLocModalOpen(false);
    fetchBaseData();
    fetchStockData();
  };

  const handleDeleteLocation = async (id: string) => {
    if (
      window.confirm(
        "Are you sure? This will delete the location and all its associated stock records."
      )
    ) {
      await api.deleteLocation(id);
      fetchBaseData();
      fetchStockData();
    }
  };

  const handleAddItem = async (data: any) => {
    const newItem = await api.addItem(data);
    const currentLocations = await api.getLocations();
    await Promise.all(
      currentLocations.map((loc) =>
        api.initializeStockRecord(loc.id, newItem.id)
      )
    );
    setIsItemModalOpen(false);
    fetchBaseData();
    fetchStockData();
  };

  const handleDeleteItem = async (id: string) => {
    if (
      window.confirm(
        "Are you sure? This will remove the item from the catalog and all warehouse stock records."
      )
    ) {
      await api.deleteItem(id);
      fetchBaseData();
      fetchStockData();
    }
  };

  const handleUpdateStock = async (
    locId: string,
    itemId: string,
    delta: number
  ) => {
    try {
      await api.updateStock(locId, itemId, delta);
      fetchStockData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckLowStock = async () => {
    setIsAlertModalOpen(true);
    setIsAnalyzing(true);

    const { data: allStock } = await api.getFullStock({
      page: 1,
      pageSize: 9999,
    });
    const lowStockItems = allStock.filter((s) => s.isLowStock);

    try {
      if (lowStockItems.length > 0) {
        await api.sendLowStockEmailAlert(lowStockItems);
      }
      const analysis = await analyzeLowStock(lowStockItems);
      setAiAnalysis(analysis || "");
    } catch (err) {
      setAiAnalysis("Analysis could not be generated.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openLogin = () => {
    window.history.pushState({}, "", "/admin/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const closeLogin = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const renderContent = () => {
    if (loading && stock.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-medium">
            Loading Enterprise Data...
          </p>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <DashboardStats locations={locations} items={items} stock={stock} />
        );

      case "settings":
        return settings ? (
          <SettingsView settings={settings} onUpdate={handleUpdateSettings} />
        ) : null;

      case "locations":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Locations Directory
                </h3>
                <p className="text-gray-500">
                  Manage your warehouse and store locations
                </p>
              </div>
              <button
                onClick={() => setIsLocModalOpen(true)}
                disabled={!authed}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                  authed
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Plus size={20} />
                <span>Add Location</span>
              </button>
            </div>
            <LocationTable
              locations={locations}
              onDelete={handleDeleteLocation}
              canEdit={authed}
            />
          </div>
        );

      case "items":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Inventory Catalog
                </h3>
                <p className="text-gray-500">
                  Standardize your item definitions
                </p>
              </div>
              <button
                onClick={() => setIsItemModalOpen(true)}
                disabled={!authed}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                  authed
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Plus size={20} />
                <span>Register New Item</span>
              </button>
            </div>
            <ItemTable
              items={items}
              onDelete={handleDeleteItem}
              canEdit={authed}
            />
          </div>
        );

      case "stock":
        return (
          <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Live Stock Monitoring
                </h3>
                <p className="text-gray-500">
                  Real-time quantity updates with negative-stock prevention
                </p>
              </div>
              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by name/code..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    value={locationFilter}
                    onChange={(e) => {
                      setLocationFilter(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 pr-10 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer min-w-[160px]"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Package
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    value={itemFilter}
                    onChange={(e) => {
                      setItemFilter(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 pr-10 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer min-w-[160px]"
                  >
                    <option value="">All Items</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={fetchStockData}
                  className="p-2.5 bg-white border rounded-xl hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
                  title="Refresh Stock"
                >
                  <RefreshCw
                    size={20}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>
            <StockTable
              stock={stock}
              total={totalStock}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              onUpdate={handleUpdateStock}
              canEdit={authed}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const AppShell = () => (
    <Layout
      activeView={activeView}
      setActiveView={setActiveView}
      onCheckLowStock={handleCheckLowStock}
      onLogout={() => {
        localStorage.removeItem("inv_admin_auth");
        localStorage.removeItem("inv_admin_token");
        setAuthed(false);
      }}
      onLogin={openLogin}
      authed={authed}
    >
      {renderContent()}

      <LocationModal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        onSubmit={handleAddLocation}
      />
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSubmit={handleAddItem}
      />
      <LowStockAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        lowItems={stock.filter((s) => s.isLowStock)}
        aiAnalysis={aiAnalysis}
        loading={isAnalyzing}
        settings={settings || undefined}
      />
      {showLogin && <div />}
    </Layout>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/admin/login"
          element={
            <Login
              onSuccess={() => {
                setAuthed(true);
                closeLogin();
              }}
            />
          }
        />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </Router>
  );
};

export default App;
