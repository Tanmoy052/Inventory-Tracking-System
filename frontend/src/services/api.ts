import {
  Location,
  Item,
  Stock,
  StockWithDetails,
  SystemSettings,
} from "../types";

const STORAGE_KEYS = {
  LOCATIONS: "inv_locations",
  ITEMS: "inv_items",
  STOCK: "inv_stock",
  SETTINGS: "inv_settings",
};

const DEFAULT_SETTINGS: SystemSettings = {
  alertEmail: "procurement@enterprise-inventory.com",
  organizationName: "Location & Item Inventory Tracking System",
  adminEmail: "admin@enterprise-inventory.com",
  adminPasswordHash: "sha256:admin123",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class InventoryBackend {
  private getData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setData<T>(key: string, data: T[] | object): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private generateNextItemCode(items: Item[]): string {
    const prefix = "ITEM-";
    let maxNum = 0;
    items.forEach((item) => {
      if (item.itemCode && item.itemCode.startsWith(prefix)) {
        const numPart = item.itemCode.substring(prefix.length);
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `${prefix}${(maxNum + 1).toString().padStart(5, "0")}`;
  }

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  async updateSettings(settings: SystemSettings): Promise<void> {
    await delay(300);
    this.setData(STORAGE_KEYS.SETTINGS, settings);
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    await delay(200);
    return this.getData<Location>(STORAGE_KEYS.LOCATIONS);
  }

  async addLocation(
    location: Omit<Location, "id" | "createdAt">
  ): Promise<Location> {
    await delay(300);
    const locations = this.getData<Location>(STORAGE_KEYS.LOCATIONS);
    const newLocation = {
      ...location,
      id: `loc_${Date.now()}`,
      createdAt: Date.now(),
    };
    this.setData(STORAGE_KEYS.LOCATIONS, [...locations, newLocation]);
    return newLocation;
  }

  async deleteLocation(id: string): Promise<void> {
    await delay(300);
    // Remove location
    const locations = this.getData<Location>(STORAGE_KEYS.LOCATIONS);
    this.setData(
      STORAGE_KEYS.LOCATIONS,
      locations.filter((l) => l.id !== id)
    );

    // Cleanup associated stock
    const stocks = this.getData<Stock>(STORAGE_KEYS.STOCK);
    this.setData(
      STORAGE_KEYS.STOCK,
      stocks.filter((s) => s.locationId !== id)
    );
  }

  // Items
  async getItems(): Promise<Item[]> {
    await delay(200);
    return this.getData<Item>(STORAGE_KEYS.ITEMS);
  }

  async addItem(
    item: Omit<Item, "id" | "createdAt" | "itemCode">
  ): Promise<Item> {
    await delay(300);
    const items = this.getData<Item>(STORAGE_KEYS.ITEMS);
    const newItem = {
      ...item,
      itemCode: this.generateNextItemCode(items),
      id: `itm_${Date.now()}`,
      createdAt: Date.now(),
    };
    this.setData(STORAGE_KEYS.ITEMS, [...items, newItem]);
    return newItem;
  }

  async deleteItem(id: string): Promise<void> {
    await delay(300);
    // Remove item
    const items = this.getData<Item>(STORAGE_KEYS.ITEMS);
    this.setData(
      STORAGE_KEYS.ITEMS,
      items.filter((i) => i.id !== id)
    );

    // Cleanup associated stock
    const stocks = this.getData<Stock>(STORAGE_KEYS.STOCK);
    this.setData(
      STORAGE_KEYS.STOCK,
      stocks.filter((s) => s.itemId !== id)
    );
  }

  async getFullStock(params: {
    page: number;
    pageSize: number;
    locationId?: string;
    itemId?: string;
    search?: string;
  }): Promise<{ data: StockWithDetails[]; total: number }> {
    await delay(400);
    const stocks = this.getData<Stock>(STORAGE_KEYS.STOCK);
    const locations = this.getData<Location>(STORAGE_KEYS.LOCATIONS);
    const items = this.getData<Item>(STORAGE_KEYS.ITEMS);

    let filtered = stocks.map((s) => {
      const loc = locations.find((l) => l.id === s.locationId);
      const item = items.find((i) => i.id === s.itemId);
      return {
        ...s,
        locationName: loc?.name || "Unknown",
        itemName: item?.name || "Unknown",
        itemCode: item?.itemCode || "N/A",
        minQuantity: item?.minQuantity || 0,
        isLowStock: s.currentQuantity < (item?.minQuantity || 0),
      };
    });

    // Clean up "orphaned" stock entries (where location or item no longer exists)
    filtered = filtered.filter(
      (s) => s.locationName !== "Unknown" && s.itemName !== "Unknown"
    );

    if (params.locationId)
      filtered = filtered.filter((s) => s.locationId === params.locationId);
    if (params.itemId)
      filtered = filtered.filter((s) => s.itemId === params.itemId);
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.itemName.toLowerCase().includes(search) ||
          s.itemCode.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const start = (params.page - 1) * params.pageSize;
    const data = filtered.slice(start, start + params.pageSize);

    return { data, total };
  }

  async updateStock(
    locationId: string,
    itemId: string,
    delta: number
  ): Promise<Stock> {
    await delay(100);
    const stocks = this.getData<Stock>(STORAGE_KEYS.STOCK);
    const stockIndex = stocks.findIndex(
      (s) => s.locationId === locationId && s.itemId === itemId
    );
    if (stockIndex === -1) {
      if (delta < 0) throw new Error("Stock cannot be negative");
      const newStock = { locationId, itemId, currentQuantity: delta };
      this.setData(STORAGE_KEYS.STOCK, [...stocks, newStock]);
      return newStock;
    }
    const newQuantity = stocks[stockIndex].currentQuantity + delta;
    if (newQuantity < 0) throw new Error("Stock quantity cannot be negative");
    stocks[stockIndex].currentQuantity = newQuantity;
    this.setData(STORAGE_KEYS.STOCK, stocks);
    return stocks[stockIndex];
  }

  async initializeStockRecord(
    locationId: string,
    itemId: string
  ): Promise<Stock> {
    const stocks = this.getData<Stock>(STORAGE_KEYS.STOCK);
    const exists = stocks.find(
      (s) => s.locationId === locationId && s.itemId === itemId
    );
    if (!exists) {
      const newStock = { locationId, itemId, currentQuantity: 0 };
      this.setData(STORAGE_KEYS.STOCK, [...stocks, newStock]);
      return newStock;
    }
    return exists;
  }

  async sendLowStockEmailAlert(
    lowStockItems: StockWithDetails[]
  ): Promise<void> {
    const settings = await this.getSettings();
    await delay(1000);
    const targetEmail = settings.alertEmail || settings.adminEmail;
    console.log(
      `REAL-TIME ALERT: Email sent to ${targetEmail}`,
      lowStockItems.map((i) => ({
        location: i.locationName,
        item: i.itemName,
        current: i.currentQuantity,
        min: i.minQuantity,
      }))
    );
  }
}

export const api = new InventoryBackend();
