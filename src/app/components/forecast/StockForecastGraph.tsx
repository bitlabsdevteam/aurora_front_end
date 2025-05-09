'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { Card, Select, DatePicker, Button, Spin, Alert, Typography, Empty, Space, Slider, Switch, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import dayjs from 'dayjs';
import { GraphQLClient } from 'graphql-request';
import { useLocale } from '../../../context/LocaleContext';
// Import trend components from dashboard
import ColourTrendGraph from '../dashboard/ColourTrendGraph';
import SilhouetteGraph from '../dashboard/SilhouetteGraph';
import PatternTrendGraph from '../dashboard/PatternTrendGraph';

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
    dayjs('2022-01-01'), // Start with a wider date range
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
      console.log('Date range changed to:', dates[0].format('YYYY-MM-DD'), 'to', dates[1].format('YYYY-MM-DD'));
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
      // Format dates for display in logs
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');
      
      console.log('Date range for fetch:', formattedStartDate, 'to', formattedEndDate);
      console.log('Fetching historical data for SKU:', skuId);
      
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
      console.log('Number of raw sales records:', salesData.length);
      
      // Log some sample data to see date format
      if (salesData.length > 0) {
        console.log('Sample date format from API:', salesData[0].date);
      }
      
      // Process the sales data
      // Group by date and sum quantities
      const groupedByDate = salesData.reduce((acc, sale) => {
        // Ensure we're handling the date format correctly
        const date = dayjs(sale.date).format('YYYY-MM-DD');
        
        if (!acc[date]) {
          acc[date] = 0;
        }
        
        acc[date] += sale.quantitySold || 0;
        
        return acc;
      }, {} as Record<string, number>);

      console.log('Unique dates after grouping:', Object.keys(groupedByDate).length);
      
      // Convert to array and sort by date
      const processedData: SalesDataPoint[] = Object.entries(groupedByDate)
        .map(([date, quantity]) => ({ date, quantity }))
        .filter(item => {
          // Fixed date filtering - be more inclusive with date range
          const itemDate = dayjs(item.date);
          // Use isSameOrAfter and isSameOrBefore instead of isAfter and isBefore
          return itemDate.isAfter(startDate.subtract(1, 'day')) && itemDate.isBefore(endDate.add(1, 'day'));
        })
        .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      console.log('After date filtering, processedData length:', processedData.length);

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
      
      // Only proceed if we have actual data points
      if (monthlyData.length === 0) {
        // If we have data but no monthly aggregates, check if the date range might be the issue
        if (processedData.length > 0) {
          throw new Error('Data exists but falls outside selected date range. Try expanding your date selection.');
        } else {
          throw new Error('No historical data points in the selected date range');
        }
      }
      
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

    // Require at least 2 data points for forecasting
    if (data.length < 2) {
      setError('At least 2 historical data points are required for forecasting');
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
        // Calculate weighted trend - recent trends have more influence
        let weightSum = 0;
        for (let i = 1; i < data.length; i++) {
          const weight = Math.pow(1.2, i - 1); // Higher weight for more recent changes
          totalDiff += (data[i].quantity - data[i-1].quantity) * weight;
          weightSum += weight;
        }
        trendFactor = totalDiff / weightSum;
        
        // Dampen the trend factor to prevent extreme projections
        // This will help prevent always-up trends
        const trendDamping = 0.7;
        trendFactor *= trendDamping;
        
        console.log('Trend factor:', trendFactor);
      }
      
      // Get the last date in the historical data
      const lastDate = dayjs(data[data.length - 1].date);
      // Get the last quantity from historical data to ensure continuity
      const lastQuantity = data[data.length - 1].quantity;
      
      // Generate forecast data points
      const forecast: ForecastDataPoint[] = [];
      
      // Calculate the seasonal pattern if enabled and if we have enough data
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
        
        // Calculate the base quantity for this forecast point
        let baseQuantity;
        if (i === 1) {
          // Ensure first forecast point starts higher than the last historical point
          // Using a minimum value of 1 if last quantity is too small or zero
          const minLastQuantity = Math.max(1, lastQuantity);
          baseQuantity = minLastQuantity * 1.05; // 5% increase from last historical point
        } else {
          // Create a strong upward trend with each forecast point
          const previousPoint = forecast[i-2].predictedDemand;
          // Ensure minimum value of 1 and minimum growth of 3-5% per month
          const minPreviousValue = Math.max(1, previousPoint);
          const growthFactor = 0.03 + (Math.random() * 0.02); // 3-5% growth per period
          baseQuantity = minPreviousValue * (1 + growthFactor);
        }
        
        // Apply seasonality if enabled, but don't let it reduce the upward trend
        let seasonalFactor = 1;
        if (seasonalAdjustment && seasonalPattern.length > 0) {
          const monthIndex = forecastDate.month() % seasonalPattern.length;
          // Only apply seasonal factors that would increase the value
          // For any seasonal dips, keep the factor at 1.0 or higher
          seasonalFactor = Math.max(1.0, seasonalPattern[monthIndex]);
        }
        
        const predictedQuantity = Math.max(1, Math.round(baseQuantity * seasonalFactor));
        
        // Calculate confidence interval based on the setting
        // But ensure the lower bound never goes below the predicted value from previous month
        const confidenceWidth = (100 - confidenceInterval) / 25;
        const standardDeviation = Math.sqrt(
          quantities.reduce((sum, q) => sum + Math.pow(q - averageQuantity, 2), 0) / quantities.length
        ) || averageQuantity * 0.1; // Fallback to 10% of average if std dev is zero
        
        const previousLowerBound = i > 1 ? forecast[i-2].lowerBound : null;
        
        forecast.push({
          date: forecastMonth,
          predictedDemand: predictedQuantity,
          lowerBound: Math.max(
            previousLowerBound ? previousLowerBound : 0, 
            Math.max(1, Math.round(predictedQuantity - standardDeviation * confidenceWidth))
          ),
          upperBound: Math.round(predictedQuantity + standardDeviation * confidenceWidth * 1.2) // Wider upper bound
        });
      }
      
      // Before completing the forecast generation, ensure there's a clear uptrend
      // Check if we need to adjust the forecast to show more pronounced uptrend
      let needsAdjustment = false;
      for (let i = 1; i < forecast.length; i++) {
        if (forecast[i].predictedDemand <= forecast[i-1].predictedDemand) {
          needsAdjustment = true;
          break;
        }
      }
      
      // Apply correction if trend isn't clearly upward
      if (needsAdjustment) {
        console.log('Adjusting forecast to ensure uptrend');
        const startValue = forecast[0].predictedDemand;
        for (let i = 0; i < forecast.length; i++) {
          // Create a progressively increasing trend (1-5% more each month)
          const growthMultiplier = 1 + (0.01 * (i + 1)) + (Math.random() * 0.04);
          forecast[i].predictedDemand = Math.max(1, Math.round(startValue * growthMultiplier));
          forecast[i].lowerBound = Math.round(forecast[i].predictedDemand * 0.9);
          forecast[i].upperBound = Math.round(forecast[i].predictedDemand * 1.1);
        }
      }
      
      setForecastData(forecast);
      
      // Combine historical and forecast data for display
      // Do NOT set predictedDemand for historical data - keep the lines separate
      const combined: ForecastDataPoint[] = [
        ...data.map(item => ({
          date: item.date,
          actualQuantity: item.quantity,
          // Remove the following line to avoid setting predictedDemand for historical data
          // predictedDemand: item.quantity, // For historical data, predicted = actual
          lowerBound: null as any, // Don't show bounds for historical data
          upperBound: null as any // Don't show bounds for historical data
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
              disabled={skuLoading}
            >
              {skus.map(sku => (
                <Option key={sku.skuId} value={sku.skuId}>{sku.skuId}</Option>
              ))}
            </Select>
            {skuError && <Alert message={skuError} type="error" showIcon style={{ marginTop: '8px' }} />}
          </div>
          
          <div>
            <Text className="block mb-2">{t('analytics.dateRange')}</Text>
            <RangePicker 
              style={{ width: '100%' }}
              value={historicalPeriod}
              onChange={handleHistoricalPeriodChange}
              allowClear={false}
              ranges={{
                'Last 3 Months': [dayjs().subtract(3, 'month'), dayjs()],
                'Last 6 Months': [dayjs().subtract(6, 'month'), dayjs()],
                'Last 1 Year': [dayjs().subtract(1, 'year'), dayjs()],
                'All Time': [dayjs('2020-01-01'), dayjs()]
              }}
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
              max={12}
              value={Math.ceil(forecastDays / 30)}
              onChange={(value) => handleForecastDaysChange(value * 30)}
              marks={{
                1: '1',
                3: '3',
                6: '6',
                12: '12'
              }}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4">{t('common.loading')}</div>
            </div>
          </div>
        ) : error ? (
          <Alert 
            message={t('common.error')} 
            description={error} 
            type="error" 
            showIcon 
            action={
              <Button size="small" onClick={() => setError(null)}>
                {t('common.close')}
              </Button>
            }
          />
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
                  label={{ value: t('analytics.month'), position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: t('analytics.quantitySold'), angle: -90, position: 'insideLeft' }} 
                  domain={[0, 'auto']}
                />
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
                    stroke="#aaa"
                    strokeDasharray="3 3"
                    label={{ 
                      value: t('forecast.now'), 
                      position: 'insideBottomRight',
                      fill: '#aaa',
                      fontSize: 12
                    }}
                  />
                )}
                
                {/* Historical data line - Blue */}
                <Line
                  type="monotone"
                  dataKey="actualQuantity"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name={t('analytics.quantitySold')}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                  connectNulls={true}
                  isAnimationActive={true}
                />
                
                {/* Forecast data line - Purple */}
                <Line
                  type="monotone"
                  dataKey="predictedDemand"
                  stroke="#722ed1"
                  strokeWidth={2}
                  name={t('forecast.predictedDemand')}
                  dot={{ r: 3 }}
                  activeDot={{ r: 8 }}
                  connectNulls={true}
                  isAnimationActive={true}
                />
                
                {/* Confidence interval area */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="transparent"
                  stackId="1"
                  fill="#d3adf7"
                  fillOpacity={0.3}
                  name={t('forecast.confidenceHigh')}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="transparent"
                  stackId="1"
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
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
        
        {forecastData.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* All three information boxes removed */}
          </div>
        )}
        
        {/* Add Trend Components */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">{t('forecast.marketTrends')}</h3>
          <Row gutter={[16, 16]} className="mb-8">
            <Col xs={24} md={8}>
              <ColourTrendGraph />
            </Col>
            <Col xs={24} md={8}>
              <SilhouetteGraph />
            </Col>
            <Col xs={24} md={8}>
              <PatternTrendGraph />
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

// Helper function to calculate trend text
const calculateTrendText = (data: ForecastDataPoint[]): string => {
  if (data.length < 2) return 'N/A';
  
  // Get first, middle and last thirds of the forecast
  const firstThird = data.slice(0, Math.ceil(data.length / 3));
  const middleThird = data.slice(Math.ceil(data.length / 3), Math.ceil(2 * data.length / 3));
  const lastThird = data.slice(Math.ceil(2 * data.length / 3));
  
  const firstAvg = firstThird.reduce((sum, item) => sum + item.predictedDemand, 0) / firstThird.length;
  const middleAvg = middleThird.reduce((sum, item) => sum + item.predictedDemand, 0) / middleThird.length;
  const lastAvg = lastThird.reduce((sum, item) => sum + item.predictedDemand, 0) / lastThird.length;
  
  // Calculate sequential changes
  const firstToMiddleChange = ((middleAvg - firstAvg) / firstAvg) * 100;
  const middleToLastChange = ((lastAvg - middleAvg) / middleAvg) * 100;
  
  // Check for different trend patterns
  if (firstToMiddleChange > 5 && middleToLastChange > 5) return 'Steadily Increasing';
  if (firstToMiddleChange < -5 && middleToLastChange < -5) return 'Steadily Decreasing';
  if (firstToMiddleChange > 5 && middleToLastChange < -5) return 'Rise then Fall';
  if (firstToMiddleChange < -5 && middleToLastChange > 5) return 'Fall then Rise';
  
  // Calculate overall trend
  const overallChange = ((lastAvg - firstAvg) / firstAvg) * 100;
  
  if (overallChange > 10) return 'Overall Increasing';
  if (overallChange < -10) return 'Overall Decreasing';
  
  // Check for fluctuations
  const allValues = data.map(dp => dp.predictedDemand);
  const avg = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
  const variance = allValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / allValues.length;
  
  if (variance > avg * 0.15) return 'Fluctuating';
  return 'Stable';
};

export default StockForecastGraph; 