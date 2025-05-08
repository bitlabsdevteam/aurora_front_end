'use client';

import { Card, Tooltip, Tag } from 'antd';
import { Grid } from 'lucide-react';

const PatternTrendGraph = () => {
  const patternTrends = [
    { 
      name: 'Abstract Geo', 
      growth: 'high', 
      categories: ['Tops', 'Dresses', 'Accessories'],
      examples: 'Geometric shapes, abstract puzzles, digital-inspired patterns'
    },
    { 
      name: 'Micro Florals', 
      growth: 'high', 
      categories: ['Dresses', 'Tops', 'Bottoms'],
      examples: 'Small-scale floral prints, ditsy patterns, vintage-inspired'
    },
    { 
      name: 'Organic Stripes', 
      growth: 'medium', 
      categories: ['Outerwear', 'Tops', 'Accessories'],
      examples: 'Wave-like stripes, undulating lines, natural flowing patterns'
    },
    { 
      name: 'Digital Checks', 
      growth: 'medium', 
      categories: ['Outerwear', 'Bottoms'],
      examples: 'Glitched plaids, pixelated checks, tech-inspired grids'
    },
    { 
      name: 'Eco Textures', 
      growth: 'low', 
      categories: ['Dresses', 'Tops'],
      examples: 'Nature-inspired textures, organic formations, sustainable motifs'
    },
  ];

  const getGrowthColor = (growth: string) => {
    switch (growth) {
      case 'high': return '#52c41a';
      case 'medium': return '#faad14';
      case 'low': return '#d9d9d9';
      default: return '#d9d9d9';
    }
  };

  const getGrowthLabel = (growth: string) => {
    switch (growth) {
      case 'high': return 'High Growth';
      case 'medium': return 'Medium Growth';
      case 'low': return 'Low Growth';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Pattern Trends</h3>
        <Grid className="w-5 h-5 text-indigo-500" />
      </div>

      <div className="space-y-4">
        {patternTrends.map((item, index) => (
          <div key={index} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Tooltip title={item.examples}>
                <h4 className="font-medium cursor-help">{item.name}</h4>
              </Tooltip>
              <Tag color={getGrowthColor(item.growth)} className="rounded-full">
                {getGrowthLabel(item.growth)}
              </Tag>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {item.categories.map((category, catIndex) => (
                <Tag key={catIndex} className="rounded-full bg-gray-100 border-0 text-gray-800">
                  {category}
                </Tag>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 text-xs text-gray-500">
          <p>Based on analysis of 5,200+ runway and retail patterns</p>
        </div>
      </div>
    </Card>
  );
};

export default PatternTrendGraph; 