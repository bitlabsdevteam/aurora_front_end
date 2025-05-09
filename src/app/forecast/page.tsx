'use client';

import React from 'react';
import { Typography } from 'antd';
import MasterLayout from '../components/layout/MasterLayout';
import { useLocale } from '../../context/LocaleContext';
import StockForecastGraph from '../components/forecast/StockForecastGraph';

const { Title, Text } = Typography;

const Forecast = () => {
  const { t } = useLocale();

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <Title level={2}>{t('forecast.title')}</Title>
        <Text className="text-gray-500 block mb-6">
          {t('forecast.description')}
        </Text>

        {/* Stock Demand Forecasting Graph */}
        <StockForecastGraph />
      </div>
    </MasterLayout>
  );
};

export default Forecast; 