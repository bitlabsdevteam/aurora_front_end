'use client';

import React, { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Button, Spin, Alert, Typography, Empty, Radio, Tag, Tabs, Slider, Switch, Space } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Area, ReferenceLine, Cell, BarChart } from 'recharts';
import dayjs from 'dayjs';
import MasterLayout from '../components/layout/MasterLayout';
import { useLocale } from '../../context/LocaleContext';
import { request, GraphQLClient } from 'graphql-request';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// GraphQL endpoint
const GRAPHQL_ENDPOINT = 'http://localhost:3001/api/graphql';

// Utility function to get GraphQL client
const getGraphQLClient = () => {
  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

interface SkuIdResponse {
  skuId: string;
}

interface GraphQLSkuResponse {
  sales: SkuIdResponse[];
}

interface ForecastDataPoint {
  date: string;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
}

interface ForecastStats {
  totalDemand: number;
  bestSellingPeriod: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
}

// Custom hook for fetching SKUs
const useSKUs = () => {
  const [skus, setSkus] = useState<SkuIdResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSKUs = async () => {
      try {
        setLoading(true);
        
        // Using GraphQL to fetch SKU IDs with proper type
        const client = getGraphQLClient();
        
        // Query to get all available skuIds from Sales data
        const query = `
          query {
            sales {
              skuId
            }
          }
        `;
        
        const response = await client.request<GraphQLSkuResponse>(query);
        
        // Update skus state with the response data
        if (response && response.sales) {
          console.log('Fetched SKUs:', response.sales.length);
          
          // Remove duplicates if any exist
          const uniqueSkuIds = [...new Set(response.sales.map(item => item.skuId))];
          const uniqueSkus = uniqueSkuIds.map(skuId => ({ skuId }));
          
          setSkus(uniqueSkus);
        } else {
          throw new Error('Invalid response format from GraphQL API');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch SKUs');
        console.error('Error fetching SKUs via GraphQL:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSKUs();
  }, []);

  return { skus, loading, error };
};

const Forecast = () => {
  const { t } = useLocale();
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [forecastPeriod, setForecastPeriod] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const { skus, loading: skuLoading, error: skuError } = useSKUs();
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastStats, setForecastStats] = useState<ForecastStats | null>(null);
  const [activeTab, setActiveTab] = useState<string>("daily");
  
  // Forecast settings
  const [confidenceInterval, setConfidenceInterval] = useState<number>(95);
  const [useTrends, setUseTrends] = useState<boolean>(true);
  const [seasonalAdjustment, setSeasonalAdjustment] = useState<boolean>(true);
  const [forecastModel, setForecastModel] = useState<string>("arima");

  // Handle SKU selection
  const handleSKUChange = (value: string) => {
    setSelectedSKU(value);
  };

  // Handle date range selection
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setForecastPeriod([dates[0], dates[1]]);
    } else {
      setForecastPeriod(null);
    }
  };

  // Generate mock forecast data based on the input parameters
  const generateForecast = () => {
    if (!selectedSKU || !forecastPeriod) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // This is where you would normally call your GraphQL endpoint to get real forecast data
      // For now, we'll generate mock data
      
      const startDate = forecastPeriod[0];
      const endDate = forecastPeriod[1];
      const daysDiff = endDate.diff(startDate, 'day');
      
      const mockForecastData: ForecastDataPoint[] = [];
      let trendFactor = 1;
      
      // Determine the trend based on settings
      if (forecastModel === 'arima') {
        trendFactor = 1.02; // slight increase
      } else if (forecastModel === 'prophet') {
        trendFactor = 1.05; // stronger increase
      }
      
      // Base demand varies with seasonal adjustment
      const getBaseDemand = (day: number) => {
        const baseDemand = 100 + (useTrends ? day * (Math.random() * 2) : 0);
        
        if (seasonalAdjustment) {
          // Add a weekly seasonality pattern
          return baseDemand * (1 + 0.2 * Math.sin(2 * Math.PI * (day % 7) / 7));
        }
        
        return baseDemand;
      };
      
      // Confidence interval width based on the setting
      const confidenceWidth = (100 - confidenceInterval) / 10;
      
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = startDate.add(i, 'day');
        const baseDemand = getBaseDemand(i);
        const predictedDemand = Math.round(baseDemand * Math.pow(trendFactor, i/30));
        
        mockForecastData.push({
          date: currentDate.format('YYYY-MM-DD'),
          predictedDemand,
          lowerBound: Math.round(predictedDemand * (1 - confidenceWidth / 10)),
          upperBound: Math.round(predictedDemand * (1 + confidenceWidth / 10))
        });
      }
      
      // Find the best selling period (highest predicted demand)
      const bestSellingDay = mockForecastData.reduce((prev, current) => 
        (prev.predictedDemand > current.predictedDemand) ? prev : current
      );
      
      // Calculate trend by comparing first and last week
      const firstWeekAvg = mockForecastData.slice(0, 7).reduce((sum, dp) => sum + dp.predictedDemand, 0) / 7;
      const lastWeekAvg = mockForecastData.slice(-7).reduce((sum, dp) => sum + dp.predictedDemand, 0) / 7;
      
      let trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating' = 'stable';
      
      if (lastWeekAvg > firstWeekAvg * 1.1) {
        trend = 'increasing';
      } else if (lastWeekAvg < firstWeekAvg * 0.9) {
        trend = 'decreasing';
      } else {
        // Check for fluctuations
        const allValues = mockForecastData.map(dp => dp.predictedDemand);
        const avg = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
        const variance = allValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / allValues.length;
        
        if (variance > avg * 0.1) {
          trend = 'fluctuating';
        }
      }
      
      setForecastData(mockForecastData);
      setForecastStats({
        totalDemand: mockForecastData.reduce((sum, dp) => sum + dp.predictedDemand, 0),
        bestSellingPeriod: bestSellingDay.date,
        trend
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate forecast');
      console.error('Error generating forecast:', err);
      setForecastData([]);
      setForecastStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <Title level={2}>{t('forecast.title')}</Title>
        <Text className="text-gray-500 block mb-6">
          {t('forecast.description')}
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card title={t('forecast.selectSKU')} className="col-span-2">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forecast.selectSKU')}
                </label>
                <Select
                  placeholder={t('forecast.selectSKU')}
                  style={{ width: '100%' }}
                  onChange={handleSKUChange}
                  value={selectedSKU || undefined}
                  loading={skuLoading}
                  showSearch
                  optionFilterProp="children"
                >
                  {skus.map(sku => (
                    <Option key={sku.skuId} value={sku.skuId}>
                      {sku.skuId}
                    </Option>
                  ))}
                </Select>
                {skuError && (
                  <Alert 
                    message="Error loading SKUs" 
                    description={skuError} 
                    type="error" 
                    showIcon 
                    className="mt-2"
                  />
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forecast.dateRange')}
                </label>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={handleDateRangeChange}
                  value={forecastPeriod as any}
                  disabledDate={current => current && current < dayjs().startOf('day')}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="primary"
                  onClick={generateForecast}
                  disabled={!selectedSKU || !forecastPeriod}
                  className="bg-[#4745D0]"
                >
                  {t('forecast.generateForecast')}
                </Button>
              </div>
            </div>
          </Card>

          <Card title={t('forecast.forecastSettings')}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forecast.forecastModel')}
                </label>
                <Select 
                  style={{ width: '100%' }} 
                  value={forecastModel}
                  onChange={value => setForecastModel(value)}
                >
                  <Option value="arima">ARIMA</Option>
                  <Option value="prophet">Prophet</Option>
                  <Option value="deeplearning">Deep Learning</Option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forecast.confidenceInterval')} ({confidenceInterval}%)
                </label>
                <Slider
                  min={70}
                  max={99}
                  value={confidenceInterval}
                  onChange={value => setConfidenceInterval(value)}
                />
              </div>
              
              <div>
                <Space direction="vertical">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Switch 
                      checked={seasonalAdjustment} 
                      onChange={checked => setSeasonalAdjustment(checked)} 
                      className="mr-2"
                    />
                    {t('forecast.seasonalityAdjustment')}
                  </label>
                  
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Switch 
                      checked={useTrends} 
                      onChange={checked => setUseTrends(checked)} 
                      className="mr-2"
                    />
                    {t('forecast.includeTrends')}
                  </label>
                </Space>
              </div>
              
              <Button 
                type="default" 
                onClick={generateForecast} 
                disabled={!selectedSKU || !forecastPeriod}
                block
              >
                {t('forecast.apply')}
              </Button>
            </div>
          </Card>
        </div>

        <Card title={t('forecast.forecastResults')} className="mb-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message="Error" description={error} type="error" showIcon />
          ) : forecastData.length > 0 ? (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  {forecastPeriod && forecastPeriod[0] && forecastPeriod[1] ? (
                    <Tag color="blue">
                      {forecastPeriod[0].format('YYYY-MM-DD')} - {forecastPeriod[1].format('YYYY-MM-DD')}
                    </Tag>
                  ) : (
                    <Tag color="green">{t('analytics.allAvailableData')}</Tag>
                  )}
                </div>
                <Tabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  items={[
                    { key: 'daily', label: t('forecast.dailyView') },
                    { key: 'weekly', label: t('forecast.weeklyView') },
                    { key: 'monthly', label: t('forecast.monthlyView') }
                  ]}
                />
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={forecastData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 12}}
                      tickFormatter={(value) => {
                        if (activeTab === 'daily') {
                          return dayjs(value).format('MM-DD');
                        } else if (activeTab === 'weekly') {
                          return dayjs(value).format('MM-DD');
                        } else {
                          return dayjs(value).format('MMM YYYY');
                        }
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'lowerBound') return [value, t('forecast.confidenceLow')];
                        if (name === 'upperBound') return [value, t('forecast.confidenceHigh')];
                        return [value, t('forecast.predictedDemand')];
                      }}
                      labelFormatter={(value) => dayjs(value).format('YYYY-MM-DD')}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="transparent"
                      strokeWidth={0}
                      fill="#8884d8"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      stroke="transparent"
                      strokeWidth={0}
                      fill="#8884d8"
                      fillOpacity={0}
                    />
                    <Line
                      type="monotone"
                      dataKey="predictedDemand"
                      stroke="#4745D0"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 6 }}
                      name={t('forecast.predictedDemand')}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {forecastStats && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card size="small" title={t('forecast.totalPredicted')}>
                    <Text className="text-2xl font-bold">
                      {forecastStats.totalDemand.toLocaleString()}
                    </Text>
                  </Card>
                  <Card size="small" title={t('forecast.bestSellingPeriod')}>
                    <Text className="text-xl font-bold">
                      {dayjs(forecastStats.bestSellingPeriod).format('YYYY-MM-DD')}
                    </Text>
                  </Card>
                  <Card 
                    size="small" 
                    title={t('forecast.demandTrend')}
                    className={
                      forecastStats.trend === 'increasing' 
                        ? 'bg-green-50' 
                        : forecastStats.trend === 'decreasing'
                        ? 'bg-red-50'
                        : 'bg-blue-50'
                    }
                  >
                    <Text 
                      className={`text-xl font-bold ${
                        forecastStats.trend === 'increasing' 
                          ? 'text-green-600' 
                          : forecastStats.trend === 'decreasing'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {t(`forecast.${forecastStats.trend}`)}
                    </Text>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Empty
              description={
                selectedSKU && forecastPeriod
                  ? t('forecast.noData')
                  : t('forecast.selectCriteria')
              }
              className="py-12"
            />
          )}
        </Card>
      </div>
    </MasterLayout>
  );
};

export default Forecast; 