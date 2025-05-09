'use client';

import { Card, Tooltip, Tag } from 'antd';
import { Grid } from 'lucide-react';
import { useLocale } from '../../../context/LocaleContext';

const PatternTrendGraph = () => {
  const { t } = useLocale();

  const patternTrends = [
    { 
      name: t('widgets.abstractGeo'), 
      growth: 'high', 
      categories: [t('widgets.tops'), t('widgets.dresses'), t('widgets.accessories')],
      examples: 'Geometric shapes, abstract puzzles, digital-inspired patterns'
    },
    { 
      name: t('widgets.microFlorals'), 
      growth: 'high', 
      categories: [t('widgets.dresses'), t('widgets.tops'), t('widgets.bottoms')],
      examples: 'Small-scale floral prints, ditsy patterns, vintage-inspired'
    },
    { 
      name: t('widgets.organicStripes'), 
      growth: 'medium', 
      categories: [t('widgets.outerwear'), t('widgets.tops'), t('widgets.accessories')],
      examples: 'Wave-like stripes, undulating lines, natural flowing patterns'
    },
    { 
      name: t('widgets.digitalChecks'), 
      growth: 'medium', 
      categories: [t('widgets.outerwear'), t('widgets.bottoms')],
      examples: 'Glitched plaids, pixelated checks, tech-inspired grids'
    },
    { 
      name: t('widgets.ecoTextures'), 
      growth: 'low', 
      categories: [t('widgets.dresses'), t('widgets.tops')],
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
      case 'high': return t('widgets.highGrowth');
      case 'medium': return t('widgets.mediumGrowth');
      case 'low': return t('widgets.lowGrowth');
      default: return 'Unknown';
    }
  };

  return (
    <Card className="shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{t('widgets.patternTrend')}</h3>
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
          <p>{t('widgets.basedOn')} {t('widgets.analysis')} 5,200+ {t('widgets.runway')} {t('widgets.retail')} {t('widgets.patterns')}</p>
        </div>
      </div>
    </Card>
  );
};

export default PatternTrendGraph; 