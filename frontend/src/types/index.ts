
export interface Location {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface Item {
  id: string;
  name: string;
  itemCode: string;
  description: string;
  minQuantity: number;
  createdAt: number;
}

export interface Stock {
  locationId: string;
  itemId: string;
  currentQuantity: number;
}

export interface StockWithDetails extends Stock {
  locationName: string;
  itemName: string;
  itemCode: string;
  minQuantity: number;
  isLowStock: boolean;
}

export interface SystemSettings {
  alertEmail: string;
  organizationName: string;
  adminEmail: string;
  adminPasswordHash: string;
}

export type ViewType = 'dashboard' | 'locations' | 'items' | 'stock' | 'settings';
