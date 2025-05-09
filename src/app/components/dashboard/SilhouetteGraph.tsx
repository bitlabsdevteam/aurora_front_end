'use client';

import { Card, Progress, Tooltip } from 'antd';
import { Scissors } from 'lucide-react';
import { useLocale } from '../../../context/LocaleContext';

const SilhouetteGraph = () => {
  const { t } = useLocale();
  const silhouetteTrends = [
    { name: t('widgets.oversized'), percentage: 72, description: 'Voluminous, relaxed fits across categories' },
    { name: t('widgets.fittedWaist'), percentage: 65, description: 'Cinched waist with structured or voluminous shoulders/hips' },
    { name: t('widgets.column'), percentage: 58, description: 'Straight, elongated silhouette from shoulder to hem' },
    { name: t('widgets.asymmetric'), percentage: 43, description: 'Uneven hemlines and asymmetrical design details' },
    { name: t('widgets.hourglass'), percentage: 37, description: 'Defined bust, cinched waist, full hip design' },
  ];

  return (
    <Card className="shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{t('widgets.silhouetteTrend')}</h3>
        <Scissors className="w-5 h-5 text-indigo-500" />
      </div>

      <div className="space-y-6">
        {silhouetteTrends.map((item, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <Tooltip title={item.description}>
                <span className="font-medium cursor-help">{item.name}</span>
              </Tooltip>
              <span className="text-xs text-gray-500">{item.percentage}%</span>
            </div>
            <Progress 
              percent={item.percentage} 
              showInfo={false}
              strokeColor={{
                '0%': '#4745D0',
                '100%': '#A5A4F3',
              }}
              trailColor="#f0f0f0"
            />
            <div className="relative mt-1">
              <div 
                className="absolute top-1 h-4 border-l border-dotted border-gray-300" 
                style={{ left: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}

        <div className="mt-4 text-xs text-gray-500 flex justify-between">
          <span>{t('widgets.basedOn')} 2,145 {t('widgets.runwaySamples')}</span>
          <span>{t('widgets.updated')} May 2025</span>
        </div>
      </div>
    </Card>
  );
};

export default SilhouetteGraph; 