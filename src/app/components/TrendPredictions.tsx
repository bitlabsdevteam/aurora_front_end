'use client';

import React from 'react';
import { Card, Tag, Progress, Tabs } from 'antd';
import { ClockCircleOutlined, TrendingUpOutlined, InstagramOutlined, GlobalOutlined } from '@ant-design/icons';

interface TrendItem {
  id: string;
  name: string;
  category: string;
  image: string;
  confidence: number;
  timeToMainstream: number;
  season: string;
  socialEngagement: number;
}

const mockTrendItems: TrendItem[] = [
  // Dresses
  {
    id: 'd1',
    name: 'Cut-out Maxi Dresses',
    category: 'dresses',
    image: '/images/cutout-dress.jpg',
    confidence: 89,
    timeToMainstream: 2,
    season: 'Spring/Summer 2025',
    socialEngagement: 28500
  },
  {
    id: 'd2',
    name: 'Puff Sleeve Mini Dresses',
    category: 'dresses',
    image: '/images/puff-dress.jpg',
    confidence: 92,
    timeToMainstream: 1,
    season: 'Spring/Summer 2025',
    socialEngagement: 35200
  },
  {
    id: 'd3',
    name: 'Sustainable Linen Dresses',
    category: 'dresses',
    image: '/images/linen-dress.jpg',
    confidence: 86,
    timeToMainstream: 3,
    season: 'Spring/Summer 2025',
    socialEngagement: 24100
  },
  // Tops
  {
    id: 't1',
    name: 'Asymmetric Necklines',
    category: 'tops',
    image: '/images/asymmetric-top.jpg',
    confidence: 79,
    timeToMainstream: 4,
    season: 'Fall/Winter 2025',
    socialEngagement: 19800
  },
  {
    id: 't2',
    name: 'Statement Collar Blouses',
    category: 'tops',
    image: '/images/collar-top.jpg',
    confidence: 88,
    timeToMainstream: 2,
    season: 'Fall/Winter 2025',
    socialEngagement: 27300
  },
  {
    id: 't3',
    name: 'Crochet Crop Tops',
    category: 'tops',
    image: '/images/crochet-top.jpg',
    confidence: 93,
    timeToMainstream: 1,
    season: 'Spring/Summer 2025',
    socialEngagement: 38700
  },
  // Outerwear
  {
    id: 'o1',
    name: 'Oversized Bomber Jackets',
    category: 'outerwear',
    image: '/images/bomber-jacket.jpg',
    confidence: 91,
    timeToMainstream: 2,
    season: 'Fall/Winter 2025',
    socialEngagement: 31500
  },
  {
    id: 'o2',
    name: 'Quilted Lightweight Coats',
    category: 'outerwear',
    image: '/images/quilted-coat.jpg',
    confidence: 84,
    timeToMainstream: 3,
    season: 'Fall/Winter 2025',
    socialEngagement: 22400
  },
  {
    id: 'o3',
    name: 'Colorblock Windbreakers',
    category: 'outerwear',
    image: '/images/windbreaker.jpg',
    confidence: 78,
    timeToMainstream: 4,
    season: 'Spring/Summer 2025',
    socialEngagement: 18600
  }
];

const TrendPredictions: React.FC = () => {
  const categories = ['dresses', 'tops', 'outerwear'];
  
  // Color code for confidence level
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'green';
    if (confidence >= 80) return 'blue'; 
    if (confidence >= 70) return 'orange';
    return 'red';
  };

  const getTimeframeText = (months: number) => {
    if (months === 1) return '1 month';
    return `${months} months`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Trend Predictions</h2>
        <div className="text-sm text-gray-500">
          <span className="flex items-center"><ClockCircleOutlined className="mr-1" /> Updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'By Category',
            children: (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Card
                    key={category}
                    title={<span className="capitalize">{category} Trend Forecast</span>}
                    className="shadow-md"
                  >
                    <div className="space-y-6">
                      {mockTrendItems
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <div key={item.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium text-base">{item.name}</h3>
                              <Tag color={getConfidenceColor(item.confidence)}>
                                {item.confidence}% Confidence
                              </Tag>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Confidence Level</span>
                                  <span>{item.confidence}%</span>
                                </div>
                                <Progress 
                                  percent={item.confidence} 
                                  strokeColor={{
                                    '0%': '#4745D0',
                                    '100%': '#7DADF0',
                                  }}
                                  showInfo={false}
                                  size="small"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Tag icon={<ClockCircleOutlined />}>
                                  {getTimeframeText(item.timeToMainstream)}
                                </Tag>
                                <Tag icon={<GlobalOutlined />}>{item.season}</Tag>
                                <Tag icon={<InstagramOutlined />}>
                                  {(item.socialEngagement / 1000).toFixed(1)}K
                                </Tag>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: '2',
            label: 'By Confidence',
            children: (
              <div className="grid grid-cols-1 gap-4">
                {mockTrendItems
                  .sort((a, b) => b.confidence - a.confidence)
                  .slice(0, 5)
                  .map((item) => (
                    <Card key={item.id} className="shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{item.category} • {item.season}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#4745D0]">{item.confidence}%</div>
                          <p className="text-xs text-gray-500">Confidence</p>
                        </div>
                      </div>
                      <Progress 
                        percent={item.confidence} 
                        strokeColor="#4745D0"
                        size="small"
                        className="mt-2"
                      />
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-500">
                          <TrendingUpOutlined className="mr-1" />
                          Mainstream in {getTimeframeText(item.timeToMainstream)}
                        </span>
                        <span className="text-[#4745D0]">
                          <InstagramOutlined className="mr-1" />
                          {(item.socialEngagement / 1000).toFixed(1)}K
                        </span>
                      </div>
                    </Card>
                  ))}
              </div>
            ),
          },
          {
            key: '3',
            label: 'By Season',
            children: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Spring/Summer 2025" className="shadow-md">
                  <div className="space-y-4">
                    {mockTrendItems
                      .filter(item => item.season === 'Spring/Summer 2025')
                      .sort((a, b) => b.confidence - a.confidence)
                      .map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 border-b">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{item.category}</div>
                          </div>
                          <Tag color={getConfidenceColor(item.confidence)}>
                            {item.confidence}%
                          </Tag>
                        </div>
                      ))}
                  </div>
                </Card>
                <Card title="Fall/Winter 2025" className="shadow-md">
                  <div className="space-y-4">
                    {mockTrendItems
                      .filter(item => item.season === 'Fall/Winter 2025')
                      .sort((a, b) => b.confidence - a.confidence)
                      .map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 border-b">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{item.category}</div>
                          </div>
                          <Tag color={getConfidenceColor(item.confidence)}>
                            {item.confidence}%
                          </Tag>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default TrendPredictions; 