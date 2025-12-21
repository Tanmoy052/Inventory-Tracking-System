
export interface Location {
  id: string;
  name: string;
  description: string;
  createdAt: number;  //timestamp 
}

export interface Item {
  id: string;
  name: string;
  itemCode: string; //unique code
  description: string;
  minQuantity: number; //minimum required stock
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
