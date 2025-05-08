'use client';

import { Card, Progress, Tag } from 'antd';
import { TrendingUp, Clock } from 'lucide-react';

interface TrendItem {
  name: string;
  confidence: number;
  season: string;
  socialEngagement: number;
}

const TrendPredictions = () => {
  const formatNumber = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString();
  };

  const getConfidenceTagColor = (confidence: number) => {
    if (confidence >= 90) return 'success';
    if (confidence >= 85) return 'processing';
    if (confidence >= 80) return 'warning';
    return 'default';
  };

  const trendData: TrendItem[] = [
    {
      name: 'Puff Sleeve Mini Dresses',
      confidence: 92,
      season: 'Spring/Summer 2025',
      socialEngagement: 35200,
    },
    {
      name: 'Crochet Crop Tops',
      confidence: 93,
      season: 'Spring/Summer 2025',
      socialEngagement: 38700,
    },
    {
      name: 'Oversized Bomber Jackets',
      confidence: 91,
      season: 'Fall/Winter 2025',
      socialEngagement: 31500,
    },
    {
      name: 'Cut-out Maxi Dresses',
      confidence: 89,
      season: 'Spring/Summer 2025',
      socialEngagement: 28500,
    },
  ];

  return (
    <Card className="shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Top Trend Predictions</h3>
        <TrendingUp className="w-5 h-5 text-indigo-500" />
      </div>

      <div className="space-y-4">
        {trendData.map((item, index) => (
          <div key={index} className="border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{item.name}</h4>
              <Tag color={getConfidenceTagColor(item.confidence)}>
                {item.confidence}% Confidence
              </Tag>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Confidence Level</span>
                <span>{item.confidence}%</span>
              </div>
              <Progress 
                percent={item.confidence} 
                strokeColor="#4745D0"
                showInfo={false}
              />
            </div>
            <div className="flex items-center text-xs gap-3 text-gray-500">
              <span>{item.season}</span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" /> {formatNumber(item.socialEngagement)} engagements
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TrendPredictions; 