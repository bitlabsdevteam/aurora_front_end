'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { Card, Select, DatePicker, Button, Spin, Alert, Typography, Empty, Space, Slider, Switch } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import dayjs from 'dayjs';
import { GraphQLClient } from 'graphql-request';
import { useLocale } from '../../../context/LocaleContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Define interfaces for custom components
interface CardComponentProps {
  children: ReactNode;
}

// Define CardHeader and CardTitle components since they're missing
const CardHeader = ({ children }: CardComponentProps) => <div className="px-4 py-2 border-b">{children}</div>;
const CardTitle = ({ children }: CardComponentProps) => <h3 className="text-lg font-medium">{children}</h3>;
const CardContent = ({ children }: CardComponentProps) => <div className="p-4">{children}</div>;

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

interface SalesDataPoint {
  date: string;
  quantity: number;
}

interface ForecastDataPoint {
  date: string;
  actualQuantity?: number; // Historical data
  predictedDemand: number; // Forecast data
  lowerBound: number;      // Lower confidence interval
  upperBound: number;      // Upper confidence interval
}

interface GraphQLSalesBySkuResponse {
  salesBySku: {
    transactionId: string;
    id: string;
    date: string;
    skuId: string;
    storeId: string;
    quantitySold?: number;
    soldCost?: number;
  }[];
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

const StockForecastGraph: React.FC = () => {
  const { t } = useLocale();
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [historicalPeriod, setHistoricalPeriod] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(90, 'day'), // Last 90 days
    dayjs()
  ]);
  const [forecastDays, setForecastDays] = useState<number>(60); // 60 days forecast by default
  const { skus, loading: skuLoading, error: skuError } = useSKUs();
  const [historicalData, setHistoricalData] = useState<SalesDataPoint[]>([]);
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [combinedData, setCombinedData] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Forecast settings
  const [confidenceInterval, setConfidenceInterval] = useState<number>(80);
  const [seasonalAdjustment, setSeasonalAdjustment] = useState<boolean>(true);

  // Handle SKU selection
  const handleSKUChange = (value: string) => {
    setSelectedSKU(value);
    
    if (value) {
      fetchHistoricalData(value);
    } else {
      setHistoricalData([]);
      setForecastData([]);
      setCombinedData([]);
    }
  };

  // Handle historical period selection
  const handleHistoricalPeriodChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setHistoricalPeriod([dates[0], dates[1]]);
      
      if (selectedSKU) {
        fetchHistoricalData(selectedSKU, dates[0], dates[1]);
      }
    }
  };

  // Handle forecast days change
  const handleForecastDaysChange = (value: number) => {
    setForecastDays(value);
    generateForecast(historicalData, value);
  };

  // Fetch historical sales data from GraphQL
  const fetchHistoricalData = async (skuId: string, startDate = historicalPeriod[0], endDate = historicalPeriod[1]) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching historical data for SKU:', skuId, 'from', startDate.format('YYYY-MM-DD'), 'to', endDate.format('YYYY-MM-DD'));
      
      // Create the GraphQL client
      const client = getGraphQLClient();
      
      // Define the GraphQL query
      const salesBySkuQuery = `
        query SalesBySku($skuId: String!) {
          salesBySku(skuId: $skuId) {
            transactionId
            id
            date
            skuId
            storeId
            quantitySold
            soldCost
          }
        }
      `;
      
      // Execute the sales by SKU query with variables
      const salesResponse = await client.request<GraphQLSalesBySkuResponse>(salesBySkuQuery, {
        skuId: skuId
      });
      
      // Check if we have a valid sales response
      if (!salesResponse || !salesResponse.salesBySku || salesResponse.salesBySku.length === 0) {
        throw new Error('No sales data found for this SKU');
      }
      
      const salesData = salesResponse.salesBySku;
      console.log('GraphQL API sales data response:', salesData);
      
      // Process the sales data
      // Group by date and sum quantities
      const groupedByDate = salesData.reduce((acc, sale) => {
        const date = dayjs(sale.date).format('YYYY-MM-DD');
        
        if (!acc[date]) {
          acc[date] = 0;
        }
        
        acc[date] += sale.quantitySold || 0;
        
        return acc;
      }, {} as Record<string, number>);

      // Convert to array and sort by date
      const processedData: SalesDataPoint[] = Object.entries(groupedByDate)
        .map(([date, quantity]) => ({ date, quantity }))
        .filter(item => {
          const itemDate = dayjs(item.date);
          return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
        })
        .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      // Group data by month for display
      const groupedByMonth: Record<string, number> = processedData.reduce((acc, item) => {
        const month = dayjs(item.date).format('YYYY-MM');
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += item.quantity;
        return acc;
      }, {} as Record<string, number>);

      const monthlyData: SalesDataPoint[] = Object.entries(groupedByMonth)
        .map(([month, quantity]) => ({ date: month, quantity }))
        .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      console.log('Processed historical data:', processedData);
      console.log('Monthly historical data:', monthlyData);
      setHistoricalData(monthlyData);
      
      // Generate forecast based on historical data
      generateForecast(monthlyData, forecastDays);
      
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch historical sales data');
      setHistoricalData([]);
      setForecastData([]);
      setCombinedData([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate forecast based on historical data
  const generateForecast = (data: SalesDataPoint[], days: number) => {
    if (!data || data.length === 0) {
      setForecastData([]);
      setCombinedData([]);
      return;
    }

    try {
      console.log('Generating forecast for', days, 'days based on', data.length, 'historical data points');
      
      // Calculate average and trend from historical data
      const quantities = data.map(d => d.quantity);
      const averageQuantity = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
      
      // Calculate simple trend as the average difference between consecutive periods
      let trendFactor = 0;
      if (data.length > 1) {
        let totalDiff = 0;
        for (let i = 1; i < data.length; i++) {
          totalDiff += (data[i].quantity - data[i-1].quantity);
        }
        trendFactor = totalDiff / (data.length - 1);
      }
      
      // Get the last date in the historical data
      const lastDate = dayjs(data[data.length - 1].date);
      
      // Generate forecast data points
      const forecast: ForecastDataPoint[] = [];
      
      // Calculate the seasonal pattern if enabled
      const seasonalPattern: number[] = [];
      if (seasonalAdjustment && data.length >= 6) {
        // Simple seasonal calculation for monthly data
        for (let i = 0; i < Math.min(6, data.length); i++) {
          const seasonIndex = i % 12; // Map to month (0-11)
          let total = 0;
          let count = 0;
          
          for (let j = seasonIndex; j < data.length; j += 12) {
            if (j < data.length) {
              total += data[j].quantity;
              count++;
            }
          }
          
          seasonalPattern.push(count > 0 ? total / count / averageQuantity : 1);
        }
      }
      
      // Generate forecast for specified number of months
      const forecastMonths = Math.ceil(days / 30);
      for (let i = 1; i <= forecastMonths; i++) {
        const forecastDate = lastDate.add(i, 'month');
        const forecastMonth = forecastDate.format('YYYY-MM');
        const baseQuantity = averageQuantity + (trendFactor * i);
        
        // Apply seasonality if enabled
        let seasonalFactor = 1;
        if (seasonalAdjustment && seasonalPattern.length > 0) {
          const monthIndex = forecastDate.month() % seasonalPattern.length;
          seasonalFactor = seasonalPattern[monthIndex];
        }
        
        const predictedQuantity = Math.max(0, Math.round(baseQuantity * seasonalFactor));
        
        // Calculate confidence interval based on the setting
        const confidenceWidth = (100 - confidenceInterval) / 25;
        const standardDeviation = Math.sqrt(
          quantities.reduce((sum, q) => sum + Math.pow(q - averageQuantity, 2), 0) / quantities.length
        );
        
        forecast.push({
          date: forecastMonth,
          predictedDemand: predictedQuantity,
          lowerBound: Math.max(0, Math.round(predictedQuantity - standardDeviation * confidenceWidth)),
          upperBound: Math.round(predictedQuantity + standardDeviation * confidenceWidth)
        });
      }
      
      setForecastData(forecast);
      
      // Combine historical and forecast data for display
      const combined: ForecastDataPoint[] = [
        ...data.map(item => ({
          date: item.date,
          actualQuantity: item.quantity,
          predictedDemand: item.quantity, // For historical data, predicted = actual
          lowerBound: item.quantity,
          upperBound: item.quantity
        })),
        ...forecast
      ];
      
      setCombinedData(combined);
      
    } catch (err) {
      console.error('Error generating forecast:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate forecast');
      setForecastData([]);
      setCombinedData([]);
    }
  };

  // Handle confidence interval change
  const handleConfidenceIntervalChange = (value: number) => {
    setConfidenceInterval(value);
    generateForecast(historicalData, forecastDays);
  };

  // Handle seasonal adjustment toggle
  const handleSeasonalAdjustmentChange = (checked: boolean) => {
    setSeasonalAdjustment(checked);
    generateForecast(historicalData, forecastDays);
  };

  return (
    <Card title={t('forecast.title')} className="mb-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <Text className="block mb-2">{t('forecast.selectSKU')}</Text>
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
                <Option key={sku.skuId} value={sku.skuId}>{sku.skuId}</Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text className="block mb-2">{t('analytics.dateRange')}</Text>
            <RangePicker 
              style={{ width: '100%' }}
              value={historicalPeriod}
              onChange={handleHistoricalPeriodChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Text className="block mb-2">{t('forecast.forecastModel')}</Text>
            <div className="flex items-center justify-between">
              <span>{t('forecast.seasonalityAdjustment')}</span>
              <Switch checked={seasonalAdjustment} onChange={handleSeasonalAdjustmentChange} />
            </div>
          </div>
          
          <div>
            <Text className="block mb-2">{t('forecast.confidenceInterval')}</Text>
            <Slider
              min={50}
              max={99}
              value={confidenceInterval}
              onChange={handleConfidenceIntervalChange}
              marks={{
                50: '50%',
                80: '80%',
                95: '95%',
                99: '99%'
              }}
            />
          </div>
          
          <div>
            <Text className="block mb-2">Forecast Length (Months)</Text>
            <Slider
              min={1}
              max={36}
              value={Math.ceil(forecastDays / 30)}
              onChange={(value) => handleForecastDaysChange(value * 30)}
              marks={{
                1: '1',
                6: '6',
                12: '12',
                24: '24',
                36: '36'
              }}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message="Error" description={error} type="error" showIcon />
        ) : combinedData.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tickFormatter={(value) => {
                    // Format the date to show month name and year
                    return dayjs(value).format('MMM YYYY');
                  }}
                />
                <YAxis label={{ value: t('analytics.quantitySold'), angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === t('analytics.quantitySold')) 
                      return [value, t('forecast.actual')];
                    if (name === t('forecast.predictedDemand')) 
                      return [value, t('forecast.predicted')]; 
                    return [value, name];
                  }}
                  labelFormatter={(label) => dayjs(label).format('MMMM YYYY')}
                />
                <Legend />
                
                {/* Vertical line separating historical and forecast data */}
                {historicalData.length > 0 && forecastData.length > 0 && (
                  <ReferenceLine
                    x={historicalData[historicalData.length - 1].date}
                    stroke="gray"
                    strokeDasharray="3 3"
                    label={{ value: 'Now', position: 'insideTopRight' }}
                  />
                )}
                
                {/* Historical data line */}
                <Line
                  type="monotone"
                  dataKey="actualQuantity"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name={t('analytics.quantitySold')}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
                
                {/* Forecast data line */}
                <Line
                  type="monotone"
                  dataKey="predictedDemand"
                  stroke="#722ed1"
                  strokeWidth={2}
                  name={t('forecast.predictedDemand')}
                  dot={{ r: 1 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
                
                {/* Confidence interval area */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="transparent"
                  fill="#d3adf7"
                  fillOpacity={0.3}
                  name={t('forecast.confidenceHigh')}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="transparent"
                  fill="#d3adf7"
                  fillOpacity={0.3}
                  name={t('forecast.confidenceLow')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty
            description={
              selectedSKU
                ? t('forecast.noData')
                : t('forecast.selectCriteria')
            }
            className="py-12"
          />
        )}
        
        {forecastData.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow rounded">
              <CardHeader>
                <CardTitle>{t('forecast.averageDemand')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(forecastData.reduce((sum, item) => sum + item.predictedDemand, 0) / forecastData.length)}
                </div>
                <p className="text-sm text-muted-foreground text-gray-500">
                  {t('forecast.perMonth')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow rounded">
              <CardHeader>
                <CardTitle>{t('forecast.peakDemand')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.max(...forecastData.map(item => item.predictedDemand))}
                </div>
                <p className="text-sm text-muted-foreground text-gray-500">
                  {dayjs(forecastData.reduce((max, item) => 
                    item.predictedDemand > max.predictedDemand ? item : max, 
                    forecastData[0]
                  ).date).format('MMMM YYYY')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow rounded">
              <CardHeader>
                <CardTitle>{t('forecast.trend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculateTrendText(forecastData)}
                </div>
                <p className="text-sm text-muted-foreground text-gray-500">
                  {t('forecast.monthsAnalyzed').replace('{{count}}', forecastData.length.toString())}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
};

// Helper function to calculate trend text
const calculateTrendText = (data: ForecastDataPoint[]): string => {
  if (data.length < 2) return 'N/A';
  
  // Compare first and last quarter of the forecast
  const firstQuarter = data.slice(0, Math.ceil(data.length / 4));
  const lastQuarter = data.slice(data.length - Math.ceil(data.length / 4));
  
  const firstAvg = firstQuarter.reduce((sum, item) => sum + item.predictedDemand, 0) / firstQuarter.length;
  const lastAvg = lastQuarter.reduce((sum, item) => sum + item.predictedDemand, 0) / lastQuarter.length;
  
  const percentChange = ((lastAvg - firstAvg) / firstAvg) * 100;
  
  if (percentChange > 10) return 'Increasing';
  if (percentChange < -10) return 'Decreasing';
  
  // If percent change is small, check for fluctuations
  const allValues = data.map(dp => dp.predictedDemand);
  const avg = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
  const variance = allValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / allValues.length;
  
  if (variance > avg * 0.2) return 'Fluctuating';
  return 'Stable';
};

export default StockForecastGraph; 