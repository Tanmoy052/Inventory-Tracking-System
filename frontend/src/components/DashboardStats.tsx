
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Location, Item, StockWithDetails } from '../types';
import { MapPin, Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  locations: Location[];
  items: Item[];
  stock: StockWithDetails[];
}

const DashboardStats: React.FC<Props> = ({ locations, items, stock }) => {
  const lowStockCount = stock.filter(s => s.isLowStock).length;
  const totalQuantity = stock.reduce((acc, curr) => acc + curr.currentQuantity, 0);

  const stats = [
    { label: 'Total Locations', value: locations.length, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Items', value: items.length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Inventory', value: totalQuantity, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  // Prepare chart data: Top 5 Stocked Items across all locations
  const itemAggregation = stock.reduce((acc: any, curr) => {
    acc[curr.itemName] = (acc[curr.itemName] || 0) + curr.currentQuantity;
    return acc;
  }, {});

  const chartData = Object.entries(itemAggregation)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`${stat.bg} p-3 rounded-lg`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Inventory Volume Distribution</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
