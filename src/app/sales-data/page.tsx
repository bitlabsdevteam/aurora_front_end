'use client';

import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Button, Select, DatePicker, Alert } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import MasterLayout from '../components/layout/MasterLayout';
import { useLocale } from '../../context/LocaleContext';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface SalesRecord {
  _id: string;
  Transaction_ID: string;
  Store_ID: string;
  Store_Name: string;
  Date: string;
  SKU_ID: string;
  Teller_ID: string;
  Teller_Name: string;
  Original_Cost: number;
  Sold_Cost: number;
  Quantity_Sold: number;
  Payment_Method: string;
}

const SalesDataPage = () => {
  const { t } = useLocale();
  
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [filteredData, setFilteredData] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  useEffect(() => {
    // Fetch sales data from our API proxy to avoid CORS issues
    const fetchSalesData = async () => {
      try {
        // Use our server-side API proxy instead of calling Astra DB directly
        const proxyEndpoint = '/api/sales-data';
        
        console.log('Fetching sales data from API proxy:', proxyEndpoint);
        
        const response = await fetch(proxyEndpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch sales data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API response received:', data);
        
        // Check if data is returned in the expected format
        const salesArray = Array.isArray(data) ? data : (data.sales || data.data || []);
        
        if (salesArray.length === 0) {
          console.warn('API returned empty data array');
        }
        
        setSalesData(salesArray);
        setFilteredData(salesArray);
        setError(null);
      } catch (error) {
        console.error('Error fetching sales data from API:', error);
        setError(`Failed to load sales data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setSalesData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const handleSearch = () => {
    let filtered = [...salesData];

    // Filter by product name
    if (searchText) {
      filtered = filtered.filter(
        item => (item.SKU_ID || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by store
    if (storeFilter) {
      filtered = filtered.filter(item => item.Store_ID === storeFilter);
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(item => 
        dayjs(item.Date).isAfter(dateRange[0]) && dayjs(item.Date).isBefore(dateRange[1])
      );
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setStoreFilter('');
    setDateRange([null, null]);
    setFilteredData(salesData);
  };

  const stores = salesData.length > 0 
    ? Array.from(new Set(salesData.map(item => item.Store_ID)))
    : [];

  const columns: ColumnType<SalesRecord>[] = [
    {
      title: t('sales.transactionId'),
      dataIndex: 'Transaction_ID',
      key: 'transaction_id',
      sorter: (a, b) => (a.Transaction_ID || '').localeCompare(b.Transaction_ID || ''),
    },
    {
      title: t('sales.storeId'),
      dataIndex: 'Store_ID',
      key: 'store_id',
      filters: stores.map(store => ({ text: store, value: store })),
      onFilter: (value, record) => record.Store_ID === value,
    },
    {
      title: t('sales.date'),
      dataIndex: 'Date',
      key: 'date',
      sorter: (a, b) => dayjs(a.Date || '').unix() - dayjs(b.Date || '').unix(),
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: t('sales.productId'),
      dataIndex: 'SKU_ID',
      key: 'product_id',
    },
    {
      title: t('sales.storeName'),
      dataIndex: 'Store_Name',
      key: 'store_name',
      sorter: (a, b) => (a.Store_Name || '').localeCompare(b.Store_Name || ''),
    },
    {
      title: t('sales.quantity'),
      dataIndex: 'Quantity_Sold',
      key: 'quantity',
      sorter: (a, b) => (a.Quantity_Sold || 0) - (b.Quantity_Sold || 0),
    },
    {
      title: t('sales.originalCost'),
      dataIndex: 'Original_Cost',
      key: 'original_cost',
      render: (cost) => isNaN(cost) ? '¥0' : `¥${parseFloat(cost).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sorter: (a, b) => (a.Original_Cost || 0) - (b.Original_Cost || 0),
    },
    {
      title: t('sales.soldCost'),
      dataIndex: 'Sold_Cost',
      key: 'sold_cost',
      render: (cost) => isNaN(cost) ? '¥0' : `¥${parseFloat(cost).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sorter: (a, b) => (a.Sold_Cost || 0) - (b.Sold_Cost || 0),
    },
    {
      title: t('sales.tellerId'),
      dataIndex: 'Teller_ID',
      key: 'teller_id',
    },
    {
      title: t('sales.tellerName'),
      dataIndex: 'Teller_Name',
      key: 'teller_name',
    },
    {
      title: t('sales.paymentMethod'),
      dataIndex: 'Payment_Method',
      key: 'payment_method',
      filters: [
        { text: 'Cash', value: 'Cash' },
        { text: 'Credit Card', value: 'Credit Card' },
        { text: 'E-money', value: 'E-money' },
      ],
      onFilter: (value, record) => record.Payment_Method === value,
    },
  ];

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">{t('sales.title')} ({filteredData.length} {t('sales.records')})</h1>
          
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}
          
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.searchProduct')}
              </label>
              <Input
                placeholder={t('sales.searchProduct')}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                className="w-64"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.storeId')}
              </label>
              <Select
                placeholder={t('sales.storeId')}
                value={storeFilter}
                onChange={value => setStoreFilter(value)}
                allowClear
                style={{ width: 200 }}
                options={stores.map(store => ({ value: store, label: store }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('filters.dateRange')}
              </label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                className="w-64"
              />
            </div>
            <Space>
              <Button type="primary" onClick={handleSearch} className="bg-[#4745D0]">
                {t('sales.search')}
              </Button>
              <Button onClick={handleReset}>{t('sales.reset')}</Button>
            </Space>
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${t('sales.total')} ${total} ${t('sales.records')}`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </MasterLayout>
  );
};

export default SalesDataPage; 