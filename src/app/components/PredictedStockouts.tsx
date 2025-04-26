'use client';

import React from 'react';
import { Card, Tag } from 'antd';
import { ClockCircleOutlined, InboxOutlined } from '@ant-design/icons';

interface StockoutItem {
  id: string;
  name: string;
  category: string;
  image: string;
  daysUntilStockout: number;
  currentStock: number;
}

const mockStockoutItems: StockoutItem[] = [
  // Dresses
  {
    id: 'd1',
    name: 'Floral Summer Dress',
    category: 'dress',
    image: '/images/floral-dress.jpg',
    daysUntilStockout: 5,
    currentStock: 8
  },
  {
    id: 'd2',
    name: 'Evening Cocktail Dress',
    category: 'dress',
    image: '/images/cocktail-dress.jpg',
    daysUntilStockout: 3,
    currentStock: 4
  },
  {
    id: 'd3',
    name: 'Casual Maxi Dress',
    category: 'dress',
    image: '/images/maxi-dress.jpg',
    daysUntilStockout: 7,
    currentStock: 6
  },
  // T-shirts
  {
    id: 't1',
    name: 'Basic White Tee',
    category: 't-shirt',
    image: '/images/white-tee.jpg',
    daysUntilStockout: 4,
    currentStock: 10
  },
  {
    id: 't2',
    name: 'Graphic Print T-shirt',
    category: 't-shirt',
    image: '/images/graphic-tee.jpg',
    daysUntilStockout: 6,
    currentStock: 7
  },
  {
    id: 't3',
    name: 'Striped Cotton T-shirt',
    category: 't-shirt',
    image: '/images/striped-tee.jpg',
    daysUntilStockout: 2,
    currentStock: 5
  },
  // Jeans
  {
    id: 'j1',
    name: 'Classic Blue Jeans',
    category: 'jeans',
    image: '/images/blue-jeans.jpg',
    daysUntilStockout: 8,
    currentStock: 12
  },
  {
    id: 'j2',
    name: 'Black Skinny Jeans',
    category: 'jeans',
    image: '/images/black-jeans.jpg',
    daysUntilStockout: 4,
    currentStock: 6
  },
  {
    id: 'j3',
    name: 'Distressed Denim Jeans',
    category: 'jeans',
    image: '/images/distressed-jeans.jpg',
    daysUntilStockout: 5,
    currentStock: 8
  }
];

const PredictedStockouts: React.FC = () => {
  const categories = ['dress', 't-shirt', 'jeans'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Predicted Stock-outs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category}
            title={<span className="capitalize">{category} Stock-outs</span>}
            className="shadow-md"
          >
            <div className="space-y-4">
              {mockStockoutItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-2 border rounded-lg">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-md">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <InboxOutlined style={{ fontSize: '24px', color: '#999' }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Tag color={item.daysUntilStockout <= 3 ? "error" : "warning"}>
                          <ClockCircleOutlined /> {item.daysUntilStockout} days
                        </Tag>
                        <span className="text-sm text-gray-500">
                          Stock: {item.currentStock}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PredictedStockouts; 