'use client';

import { Card, Progress, Tag } from 'antd';
import { TrendingUp } from 'lucide-react';

const ColourTrendGraph = () => {
  const colourTrends = [
    { color: 'Sage Green', percentage: 78, hex: '#9CAF88', change: '+12%' },
    { color: 'Digital Lavender', percentage: 65, hex: '#E6E6FA', change: '+8%' },
    { color: 'Terracotta', percentage: 59, hex: '#E2725B', change: '+5%' },
    { color: 'Butter Yellow', percentage: 52, hex: '#F3E5AB', change: '+4%' },
    { color: 'Digital Blue', percentage: 47, hex: '#0096FF', change: '-2%' },
  ];

  return (
    <Card className="shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Colour Trend</h3>
        <TrendingUp className="w-5 h-5 text-indigo-500" />
      </div>

      <div className="space-y-4">
        {colourTrends.map((item, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.hex }}
                />
                <span className="font-medium">{item.color}</span>
              </div>
              <Tag 
                color={item.change.startsWith('+') ? 'success' : 'error'} 
                className="rounded-full text-xs"
              >
                {item.change}
              </Tag>
            </div>
            <Progress 
              percent={item.percentage} 
              showInfo={false}
              strokeColor={item.hex}
              trailColor="#f0f0f0"
              size="small"
            />
            <div className="flex justify-end text-xs text-gray-500 mt-1">
              <span>{item.percentage}% popularity</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ColourTrendGraph; 