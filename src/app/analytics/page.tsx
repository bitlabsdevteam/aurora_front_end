'use client';

import React, { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Button, Spin, Alert, Typography, Empty, Radio, Tag, Tabs, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Area, ReferenceLine, Cell, BarChart, LabelList } from 'recharts';
import dayjs from 'dayjs';
import MasterLayout from '../components/layout/MasterLayout';
import { useLocale } from '../../context/LocaleContext';
import { request, GraphQLClient } from 'graphql-request';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

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

interface SalesRecord {
  _id: string;
  Transaction_ID: string;
  Date: string;
  SKU_ID: string;
  Store_ID: string;
  Store_Name: string;
  Quantity_Sold: number;
  Original_Cost: number;
  Sold_Cost: number;
}

interface SkuIdResponse {
  skuId: string;
}

interface ProductSchema {
  _id: string;
  sku_id: string;
  product_name: string;
  price: number;
  stock_quantity: number;
  category: string;
  brand: string;
}

interface ChartDataPoint {
  date: string;
  quantity: number;
  revenue: number;
  avgQuantity?: number;
  avgRevenue?: number;
  isPeak?: boolean;
}

interface MonthlyDataPoint {
  month: string;
  quantity: number;
  revenue: number;
}

// Define GraphQL response type
interface GraphQLSkuResponse {
  sales: SkuIdResponse[];
}

interface GraphQLSalesResponse {
  sales: {
    _id: string;
    Transaction_ID: string;
    Date: string;
    SKU_ID: string;
    Store_ID: string;
    Store_Name: string;
    Teller_ID: string;
    Teller_Name: string;
    Original_Cost: string;
    Sold_Cost: string;
    Quantity_Sold: string;
    Payment_Method: string;
  }[];
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

// Add a new interface for the SKU details display
interface SkuDisplayDetails {
  _id: string;
  Transaction_ID: string;
  Date: string;
  SKU_ID: string;
  Store_ID: string;
  Store_Name: string;
  Teller_ID: string;
  Teller_Name: string;
  Original_Cost: string;
  Sold_Cost: string;
  Quantity_Sold: string;
  Payment_Method: string;
  // Additional display fields
  productName?: string;
  category?: string;
  price?: number;
  stock?: number;
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

const Analytics = () => {
  const { t } = useLocale();
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const { skus, loading: skuLoading, error: skuError } = useSKUs();
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'composed' | 'line' | 'bar'>('composed');
  const [growthStats, setGrowthStats] = useState<{
    quantityGrowth: number;
    revenueGrowth: number;
  } | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [activeTab, setActiveTab] = useState<string>("monthly");
  const [skuDetails, setSkuDetails] = useState<SkuDisplayDetails | null>(null);

  // Formatter for currency display
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  // Handle SKU selection
  const handleSKUChange = (value: string) => {
    // Clear previous errors and reset data when changing SKUs
    setError(null);
    setSelectedSKU(value);
    
    // Auto-fetch data when SKU is selected
    if (value) {
      // Use a small timeout to allow the state to update
      setTimeout(() => {
        fetchSalesData();
      }, 100);
    } else {
      // Clear data if no SKU is selected
      setSalesData([]);
      setChartData([]);
      setMonthlyData([]);
      setGrowthStats(null);
      setSkuDetails(null);
    }
  };

  // Handle date range selection
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0], dates[1]]);
      
      // If we already have a SKU selected, refetch with the new date range
      if (selectedSKU) {
        // Use a small timeout to allow the state to update
        setTimeout(() => {
          fetchSalesData();
        }, 100);
      }
    } else {
      setDateRange(null);
    }
  };

  // Process sales data for chart display
  const processDataForChart = (data: SalesRecord[]): ChartDataPoint[] => {
    // Group the data by date
    const groupedByDate = data.reduce((acc, record) => {
      const date = dayjs(record.Date).format('YYYY-MM-DD');
      
      if (!acc[date]) {
        acc[date] = {
          quantity: 0,
          revenue: 0
        };
      }
      
      acc[date].quantity += record.Quantity_Sold;
      acc[date].revenue += record.Sold_Cost;
      
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    // Convert to array and sort by date
    const sortedData = Object.entries(groupedByDate)
      .map(([date, values]) => ({
        date,
        quantity: values.quantity,
        revenue: values.revenue
      }))
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    // Calculate moving averages (7-day)
    const windowSize = 7;
    const processedData = sortedData.map((item, index, array) => {
      // Calculate moving averages if we have enough data points
      if (index >= windowSize - 1) {
        const windowData = array.slice(index - windowSize + 1, index + 1);
        const avgQuantity = windowData.reduce((sum, point) => sum + point.quantity, 0) / windowSize;
        const avgRevenue = windowData.reduce((sum, point) => sum + point.revenue, 0) / windowSize;
        return {
          ...item,
          avgQuantity,
          avgRevenue
        };
      }
      return item;
    });

    // Detect peaks (days with significantly higher sales than surrounding days)
    const peakDetectionWindow = 5;
    const peakThreshold = 1.5; // 50% higher than the average

    return processedData.map((item, index, array) => {
      if (index < peakDetectionWindow || index >= array.length - peakDetectionWindow) {
        return item; // Skip edges where we can't compute properly
      }

      const surroundingWindow = [
        ...array.slice(index - peakDetectionWindow, index),
        ...array.slice(index + 1, index + peakDetectionWindow + 1)
      ];
      
      const avgSurroundingQuantity = surroundingWindow.reduce((sum, point) => sum + point.quantity, 0) / surroundingWindow.length;
      
      return {
        ...item,
        isPeak: item.quantity > avgSurroundingQuantity * peakThreshold
      };
    });
  };

  // Calculate growth compared to previous periods
  const calculateGrowth = (data: ChartDataPoint[]) => {
    if (data.length < 14) {
      setGrowthStats(null);
      return;
    }

    // Compare last 7 days with previous 7 days
    const lastWeekData = data.slice(-7);
    const previousWeekData = data.slice(-14, -7);

    const lastWeekQuantity = lastWeekData.reduce((sum, item) => sum + item.quantity, 0);
    const previousWeekQuantity = previousWeekData.reduce((sum, item) => sum + item.quantity, 0);
    
    const lastWeekRevenue = lastWeekData.reduce((sum, item) => sum + item.revenue, 0);
    const previousWeekRevenue = previousWeekData.reduce((sum, item) => sum + item.revenue, 0);

    const quantityGrowth = previousWeekQuantity === 0 
      ? 100 // If previous was zero, consider it 100% growth
      : ((lastWeekQuantity - previousWeekQuantity) / previousWeekQuantity) * 100;
      
    const revenueGrowth = previousWeekRevenue === 0
      ? 100
      : ((lastWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;

    setGrowthStats({
      quantityGrowth,
      revenueGrowth
    });
  };

  // Process sales data for monthly chart - emphasize month on x-axis and quantity sold on y-axis
  const processDataForMonthlyChart = (data: SalesRecord[]): MonthlyDataPoint[] => {
    // Group by month
    const groupedByMonth = data.reduce<Record<string, { monthKey: string, monthDisplay: string, quantity: number; revenue: number }>>((acc, record) => {
      const date = dayjs(record.Date);
      const monthKey = date.format('YYYY-MM'); // Format as YYYY-MM for sorting
      const monthDisplay = date.format('MMM YYYY'); // Format as MMM YYYY for display
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          monthKey,
          monthDisplay,
          quantity: 0,
          revenue: 0
        };
      }
      
      acc[monthKey].quantity += record.Quantity_Sold;
      acc[monthKey].revenue += record.Sold_Cost;
      
      return acc;
    }, {});

    // Convert to array and sort by month chronologically
    const monthlyData = Object.values(groupedByMonth)
      .map(({ monthKey, monthDisplay, quantity, revenue }) => ({
        month: monthDisplay,
        sortKey: monthKey,
        quantity,
        revenue
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    console.log('Sorted monthly data by date:', monthlyData);
    return monthlyData;
  };

  // Fetch sales data and generate chart
  const fetchSalesData = async () => {
    // Clear previous errors when starting a new fetch
    setError(null);
    
    if (!selectedSKU) {
      setError(t('analytics.selectSKUFirst'));
      return;
    }

    setLoading(true);

    try {
      console.log('Fetching data for SKU:', selectedSKU);
      
      // Create the GraphQL client
      const client = getGraphQLClient();
      
      // Define the GraphQL query using salesBySku as shown in the image
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
      
      // Execute the sales by SKU query with variables for better safety
      const salesResponse = await client.request<GraphQLSalesBySkuResponse>(salesBySkuQuery, {
        skuId: selectedSKU
      });
      
      // Check if we have a valid sales response
      if (!salesResponse || !salesResponse.salesBySku || salesResponse.salesBySku.length === 0) {
        throw new Error('No sales data found for this SKU');
      }
      
      const salesData = salesResponse.salesBySku;
      console.log('GraphQL API sales data response:', salesData);
      
      // Create enhanced SKU details from the response data
      const enhancedSkuDetails: SkuDisplayDetails = {
        _id: salesData[0].id || '',
        Transaction_ID: salesData[0].transactionId || '',
        Date: salesData[0].date || '',
        SKU_ID: salesData[0].skuId || '',
        Store_ID: salesData[0].storeId || '',
        Store_Name: 'Store ' + (salesData[0].storeId || ''),
        Teller_ID: '',
        Teller_Name: '',
        Original_Cost: '0',
        Sold_Cost: '0',
        Quantity_Sold: '1', // Default quantity
        Payment_Method: '',
        // Additional display fields
        productName: `Product ${selectedSKU}`,
        category: 'Apparel',
        price: 0,
        stock: 0
      };
      
      // Convert GraphQL sales data to SalesRecord format
      const formattedSalesData: SalesRecord[] = salesData.map(sale => ({
        _id: sale.id || '',
        Transaction_ID: sale.transactionId || '',
        Date: sale.date || '',
        SKU_ID: sale.skuId || '',
        Store_ID: sale.storeId || '',
        Store_Name: 'Store ' + (sale.storeId || ''),
        Quantity_Sold: sale.quantitySold || 1,  // Default to 1 if not provided
        Original_Cost: 0,
        Sold_Cost: sale.soldCost || 0
      }));
      
      // Filter by date range if provided
      const filteredData = dateRange && dateRange[0] && dateRange[1]
        ? formattedSalesData.filter(record => {
            const recordDate = dayjs(record.Date);
            return recordDate.isAfter(dateRange[0]) && recordDate.isBefore(dateRange[1]);
          })
        : formattedSalesData;

      console.log('Filtered sales data:', filteredData);
      setSalesData(filteredData);

      // Process data for charts
      const processedData = processDataForChart(filteredData);
      console.log('Processed chart data:', processedData);
      setChartData(processedData);
      
      // Process monthly data
      const processedMonthlyData = processDataForMonthlyChart(filteredData);
      console.log('Processed monthly data:', processedMonthlyData);
      setMonthlyData(processedMonthlyData);
      
      // Calculate growth trends
      calculateGrowth(processedData);

      // Update skuDetails state
      setSkuDetails(enhancedSkuDetails);
      
      // Set the active tab to monthly view by default
      setActiveTab('monthly');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setSalesData([]);
      setChartData([]);
      setMonthlyData([]);
      setGrowthStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Monthly chart component
  const MonthlyChartSection = () => {
    if (!selectedSKU) {
      return (
        <Empty 
          description={t('analytics.selectSKUFirst')} 
          className="py-12" 
        />
      );
    }
    
    if (monthlyData.length === 0) {
      return (
        <Empty 
          description={t('analytics.noMonthlyData')} 
          className="py-12" 
        />
      );
    }
    
    // Calculate monthly average for reference line
    const totalQuantity = monthlyData.reduce((sum, item) => sum + item.quantity, 0);
    const monthlyAverage = monthlyData.length > 0 ? totalQuantity / monthlyData.length : 0;
    
    // Find best performing month
    const bestMonth = monthlyData.length > 0 
      ? monthlyData.reduce((best, current) => current.quantity > best.quantity ? current : best, monthlyData[0])
      : null;
    
    return (
      <Card title={t('analytics.monthlySales')} extra={t('analytics.byMonth')}>
        {monthlyData.length > 0 ? (
          <>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    label={{ value: t('analytics.month'), position: 'insideBottom', offset: -40 }}
                  />
                  <YAxis 
                    label={{ value: t('analytics.quantitySold'), angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'quantity') {
                      return [`${value} ${t('analytics.units')}`, t('analytics.quantitySold')];
                    }
                    return [`${currencyFormatter.format(value as number)}`, t('analytics.revenue')];
                  }} />
                  <Legend />
                  <ReferenceLine 
                    y={monthlyAverage} 
                    stroke="red" 
                    strokeDasharray="3 3"
                    label={{ value: `${t('analytics.monthlyAvg')}: ${monthlyAverage.toFixed(1)}`, position: 'right' }} 
                  />
                  <Bar 
                    dataKey="quantity" 
                    name={t('analytics.quantitySold')} 
                    fillOpacity={0.8}
                    stroke="#8884d8"
                    isAnimationActive={true}
                  >
                    {/* Use Cell components to color bars based on performance */}
                    {monthlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={
                          entry.quantity > monthlyAverage * 1.2 ? "#4CAF50" : // Well above average
                          entry.quantity > monthlyAverage ? "#8BC34A" : // Above average
                          entry.quantity >= monthlyAverage * 0.8 ? "#FFC107" : // Near average
                          "#F44336" // Below average
                        }
                      />
                    ))}
                    <LabelList dataKey="quantity" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="text-center">
                <Statistic
                  title={t('analytics.totalUnitsSold')}
                  value={totalQuantity.toLocaleString()}
                />
              </Card>
              <Card className="text-center">
                <Statistic
                  title={t('analytics.avgMonthlySales')}
                  value={parseFloat(monthlyAverage.toFixed(1))}
                />
              </Card>
              <Card className="text-center">
                <Statistic
                  title={t('analytics.bestSellingMonth')}
                  value={bestMonth ? bestMonth.month : '-'}
                />
              </Card>
            </div>
          </>
        ) : (
          <Empty description={t('analytics.noMonthlyData')} />
        )}
      </Card>
    );
  };

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <Title level={2}>{t('analytics.title')}</Title>
        <Text className="text-gray-500 block mb-6">
          {t('analytics.description')}
        </Text>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('analytics.selectSKU')}
              </label>
              <Select
                placeholder={t('analytics.selectSKU')}
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
                {t('analytics.dateRange')}
              </label>
              <RangePicker
                style={{ width: '100%' }}
                onChange={handleDateRangeChange}
                value={dateRange as any}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="primary"
                onClick={fetchSalesData}
                disabled={!selectedSKU}
                className="bg-[#4745D0]"
              >
                {t('analytics.plot')}
              </Button>
            </div>
          </div>

          {selectedSKU && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Text className="text-gray-500 text-sm">{t('analytics.selectedSKU')}</Text>
                  <Text className="block font-medium">{selectedSKU}</Text>
                </div>
                {skuDetails && (
                  <>
                    <div>
                      <Text className="text-gray-500 text-sm">{t('analytics.productName')}</Text>
                      <Text className="block font-medium">{skuDetails?.productName || selectedSKU}</Text>
                    </div>
                    <div>
                      <Text className="text-gray-500 text-sm">{t('analytics.category')}</Text>
                      <Text className="block font-medium">{skuDetails?.category || 'Apparel'}</Text>
                    </div>
                    <div>
                      <Text className="text-gray-500 text-sm">{t('analytics.currentStock')}</Text>
                      <Text className="block font-medium">{skuDetails?.stock || 0}</Text>
                    </div>
                    <div>
                      <Text className="text-gray-500 text-sm">{t('analytics.price')}</Text>
                      <Text className="block font-medium">¥{(skuDetails?.price || 0).toLocaleString('ja-JP', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</Text>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card title={t('analytics.demandForecastAnalysis')}>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message="Error" description={error} type="error" showIcon />
          ) : chartData.length > 0 ? (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  {dateRange && dateRange[0] && dateRange[1] ? (
                    <Tag color="blue">
                      {t('analytics.filteredData')}: {dayjs(dateRange[0]).format('YYYY-MM-DD')} - {dayjs(dateRange[1]).format('YYYY-MM-DD')}
                    </Tag>
                  ) : (
                    <Tag color="green">{t('analytics.allAvailableData')}</Tag>
                  )}
                </div>
                <Tabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  items={[
                    { key: 'daily', label: t('analytics.dailyView') },
                    { key: 'monthly', label: t('analytics.monthlyView') }
                  ]}
                />
              </div>

              {activeTab === 'daily' ? (
                <div>
                  <div className="mb-2 flex justify-end">
                    <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
                      <Radio.Button value="composed">{t('analytics.composedView')}</Radio.Button>
                      <Radio.Button value="line">{t('analytics.lineView')}</Radio.Button>
                      <Radio.Button value="bar">{t('analytics.barView')}</Radio.Button>
                    </Radio.Group>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'composed' ? (
                        <ComposedChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip 
                            formatter={(value, name) => {
                              if (name === t('analytics.revenue')) {
                                return [`¥${Number(value).toLocaleString('ja-JP', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}`, name];
                              }
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="quantity"
                            fill="#8884d8"
                            name={t('analytics.quantitySold')}
                            opacity={0.6}
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.isPeak ? '#ff7300' : '#8884d8'} 
                              />
                            ))}
                          </Bar>
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="avgQuantity"
                            stroke="#4745D0"
                            strokeWidth={2}
                            dot={false}
                            name={t('analytics.avgQuantity')}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#82ca9d"
                            name={t('analytics.revenue')}
                          />
                        </ComposedChart>
                      ) : chartType === 'line' ? (
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="quantity"
                            stroke="#4745D0"
                            name={t('analytics.quantitySold')}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="avgQuantity"
                            stroke="#8884d8"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name={t('analytics.avgQuantity')}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#82ca9d"
                            name={t('analytics.revenue')}
                          />
                        </LineChart>
                      ) : (
                        <ComposedChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="quantity"
                            fill="#4745D0"
                            name={t('analytics.quantitySold')}
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="revenue"
                            fill="#82ca9d"
                            name={t('analytics.revenue')}
                          />
                        </ComposedChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <MonthlyChartSection />
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card size="small" title={t('analytics.totalQuantitySold')}>
                  <Text className="text-2xl font-bold">
                    {chartData.reduce((sum, item) => sum + item.quantity, 0)}
                  </Text>
                </Card>
                <Card size="small" title={t('analytics.totalRevenue')}>
                  <Text className="text-2xl font-bold">
                    ¥{chartData
                      .reduce((sum, item) => sum + item.revenue, 0)
                      .toLocaleString('ja-JP', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                  </Text>
                </Card>
                {growthStats && (
                  <Card 
                    size="small" 
                    title={t('analytics.weeklyGrowth')}
                    className={
                      growthStats.quantityGrowth >= 0 
                        ? 'bg-green-50' 
                        : 'bg-red-50'
                    }
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Text className="mr-2">{t('analytics.quantitySold')}:</Text>
                        <Text 
                          className={`text-lg font-bold ${
                            growthStats.quantityGrowth >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}
                        >
                          {growthStats.quantityGrowth >= 0 ? '+' : ''}
                          {growthStats.quantityGrowth.toFixed(1)}%
                        </Text>
                      </div>
                      <div className="flex items-center">
                        <Text className="mr-2">{t('analytics.revenue')}:</Text>
                        <Text 
                          className={`text-lg font-bold ${
                            growthStats.revenueGrowth >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}
                        >
                          {growthStats.revenueGrowth >= 0 ? '+' : ''}
                          {growthStats.revenueGrowth.toFixed(1)}%
                        </Text>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Empty
              description={
                selectedSKU 
                  ? error || t('analytics.noData') 
                  : t('analytics.selectCriteria')
              }
              className="py-12"
            />
          )}
        </Card>
      </div>
    </MasterLayout>
  );
};

export default Analytics; 