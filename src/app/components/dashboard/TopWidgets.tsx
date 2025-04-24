'use client';

import React from 'react';
import { Progress } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Star, AlertTriangle } from 'lucide-react';

// Mock data for the revenue chart
const revenueData = [
  { name: 'Jan', forecast: 4000, actual: 4200 },
  { name: 'Feb', forecast: 4500, actual: 4300 },
  { name: 'Mar', forecast: 4700, actual: 5000 },
  { name: 'Apr', forecast: 5000, actual: 4800 },
  { name: 'May', forecast: 5200, actual: 5500 },
];

// Mock data for trending products
const trendingProducts = [
  {
    id: 1,
    name: 'Premium Denim Jacket',
    uplift: 45,
    trendScore: 4.5,
    trendFactor: 'seasonal',
    thumbnail: '👕'
  },
  {
    id: 2,
    name: 'Wireless Earbuds Pro',
    uplift: 38,
    trendScore: 4.0,
    trendFactor: 'social',
    thumbnail: '🎧'
  },
  {
    id: 3,
    name: 'Smart Water Bottle',
    uplift: 32,
    trendScore: 3.8,
    trendFactor: 'social',
    thumbnail: '🍶'
  },
];

const TopWidgets = () => {
  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= score ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {/* Stock-Outs Widget */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Predicted Stock-Outs</h3>
          <AlertCircle className="text-red-500 w-5 h-5" />
        </div>
        <div className="space-y-4">
          <Progress
            percent={15}
            status="exception"
            showInfo={false}
            className="mb-2"
          />
          <p className="text-sm text-gray-600">15% SKUs at critical level</p>
          <div className="flex items-center text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>5 items with {'<'}7 days of stock</span>
          </div>
        </div>
      </div>

      {/* Trending Products Widget */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Trending Products</h3>
        <div className="space-y-4">
          {trendingProducts.map((product) => (
            <div key={product.id} className="flex items-center space-x-3">
              <span className="text-2xl">{product.thumbnail}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex">{renderStars(product.trendScore)}</div>
                  <span className="text-green-500 text-sm">+{product.uplift}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Forecast Widget */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast vs. Actual</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#8884d8"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">RMSE: 245.3 units</p>
      </div>

      {/* Workflow Status Widget */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Automation Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completed Tasks</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">24</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pending Tasks</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">8</span>
          </div>
          <button
            onClick={() => alert('Opening reports modal...')}
            className="w-full mt-4 px-4 py-2 bg-[#4745D0] text-white rounded-lg hover:bg-[#3d3bb7] transition-colors"
          >
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopWidgets; 