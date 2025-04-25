"use client";

import { Card, Progress, Badge, Button } from "antd";
import { AlertTriangle, TrendingUp, DollarSign, Zap } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const TopWidgets = () => {
  // Mock data for revenue forecast
  const data = [
    { date: "2024-01", value: 3 },
    { date: "2024-02", value: 4 },
    { date: "2024-03", value: 3.5 },
    { date: "2024-04", value: 5 },
    { date: "2024-05", value: 4.9 },
    { date: "2024-06", value: 6 },
  ];

  // Mock data for trending products
  const trendingProducts = [
    { name: "Product A", uplift: "+24%", score: 98 },
    { name: "Product B", uplift: "+18%", score: 92 },
    { name: "Product C", uplift: "+15%", score: 88 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Predicted Stock-outs */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Predicted Stock-outs</h3>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div className="text-2xl font-semibold mb-2">12</div>
        <Progress percent={75} status="exception" />
        <p className="text-sm text-gray-500 mt-2">
          3 items require immediate attention
        </p>
      </Card>

      {/* Trending Products */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Trending Products</h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="space-y-3">
          {trendingProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{product.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-sm">{product.uplift}</span>
                <Badge count={product.score} style={{ backgroundColor: '#4745D0' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue Forecast */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Revenue Forecast</h3>
          <DollarSign className="w-5 h-5 text-blue-500" />
        </div>
        <div style={{ width: '100%', height: 100 }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4745D0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4745D0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4745D0"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Projected: $6.2M (+12%)
        </div>
      </Card>

      {/* Workflow Automation */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Workflow Automation</h3>
          <Zap className="w-5 h-5 text-purple-500" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Active Workflows</span>
            <Badge count={8} style={{ backgroundColor: '#4745D0' }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Tasks Completed</span>
            <Badge count="89%" style={{ backgroundColor: '#4745D0' }} />
          </div>
        </div>
        <Button type="link" className="p-0 text-[#4745D0]">
          View Reports
        </Button>
      </Card>
    </div>
  );
};

export default TopWidgets; 