
import React from 'react';
import { Plus, Minus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Location, Item, StockWithDetails } from '../types';

export const LocationTable: React.FC<{ locations: Location[], onDelete: (id: string) => void, canEdit?: boolean }> = ({ locations, onDelete, canEdit = true }) => (
  <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {locations.map((loc) => (
          <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-medium text-gray-900">{loc.name}</td>
            <td className="px-6 py-4 text-gray-600">{loc.description}</td>
            <td className="px-6 py-4 text-right">
              <button 
                onClick={() => onDelete(loc.id)}
                disabled={!canEdit}
                className={`p-2 rounded-lg transition-all ${canEdit ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
                title="Delete Location"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        ))}
        {locations.length === 0 && (
          <tr>
            <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">
              No locations registered.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export const ItemTable: React.FC<{ items: Item[], onDelete: (id: string) => void, canEdit?: boolean }> = ({ items, onDelete, canEdit = true }) => (
  <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Details</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU Code</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Min. Required</th>
          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-500">{item.description}</div>
            </td>
            <td className="px-6 py-4 font-mono text-sm text-blue-600">{item.itemCode}</td>
            <td className="px-6 py-4 text-center font-bold text-gray-700">{item.minQuantity}</td>
            <td className="px-6 py-4 text-right">
              <button 
                onClick={() => onDelete(item.id)}
                disabled={!canEdit}
                className={`p-2 rounded-lg transition-all ${canEdit ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
                title="Delete Item"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr>
            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
              No items in catalog.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

interface StockTableProps {
  stock: StockWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onUpdate: (locId: string, itemId: string, delta: number) => void;
  canEdit?: boolean;
}

export const StockTable: React.FC<StockTableProps> = ({ stock, total, page, pageSize, onPageChange, onUpdate, canEdit = true }) => {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Current Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Min Req.</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stock.map((s) => (
              <tr key={`${s.locationId}-${s.itemId}`} className={`hover:bg-gray-50 transition-colors ${s.isLowStock ? 'bg-red-50/50' : ''}`}>
                <td className="px-6 py-4 font-medium text-gray-700">{s.locationName}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{s.itemName}</div>
                  <div className="text-xs text-gray-400 font-mono">{s.itemCode}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    s.isLowStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {s.currentQuantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-gray-400 font-medium">{s.minQuantity}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => onUpdate(s.locationId, s.itemId, -1)}
                      disabled={s.currentQuantity <= 0 || !canEdit}
                      className={`p-2 rounded-lg border transition-all ${canEdit ? 'hover:bg-red-50 hover:text-red-600' : 'opacity-40 cursor-not-allowed'}`}
                    >
                      <Minus size={16} />
                    </button>
                    <button 
                      onClick={() => onUpdate(s.locationId, s.itemId, 1)}
                      disabled={!canEdit}
                      className={`p-2 rounded-lg border transition-all ${canEdit ? 'hover:bg-blue-50 hover:text-blue-600' : 'opacity-40 cursor-not-allowed'}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {stock.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                  No inventory records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{Math.min(total, (page - 1) * pageSize + 1)}</span> to{' '}
          <span className="font-medium">{Math.min(total, page * pageSize)}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </p>
        <div className="flex items-center space-x-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 py-2 border rounded-lg bg-white text-sm font-medium">
            Page {page} of {totalPages || 1}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
