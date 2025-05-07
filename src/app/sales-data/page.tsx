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
  transaction_id: string;
  store_id: string;
  date: string;
  product_id: string;
  product_name: string;
  quantity: string;
  price: string;
  total: string;
  staff_id: string;
  payment_method: string;
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
        item => item.product_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by store
    if (storeFilter) {
      filtered = filtered.filter(item => item.store_id === storeFilter);
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(item => 
        dayjs(item.date).isAfter(dateRange[0]) && dayjs(item.date).isBefore(dateRange[1])
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
    ? Array.from(new Set(salesData.map(item => item.store_id)))
    : [];

  const columns: ColumnType<SalesRecord>[] = [
    {
      title: t('sales.transactionId'),
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      sorter: (a, b) => a.transaction_id.localeCompare(b.transaction_id),
    },
    {
      title: t('sales.storeId'),
      dataIndex: 'store_id',
      key: 'store_id',
      filters: stores.map(store => ({ text: store, value: store })),
      onFilter: (value, record) => record.store_id === value,
    },
    {
      title: t('sales.date'),
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: t('sales.productId'),
      dataIndex: 'product_id',
      key: 'product_id',
    },
    {
      title: t('sales.productName'),
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
    },
    {
      title: t('sales.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => parseInt(a.quantity) - parseInt(b.quantity),
    },
    {
      title: t('sales.price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${parseInt(price).toLocaleString()}`,
      sorter: (a, b) => parseInt(a.price) - parseInt(b.price),
    },
    {
      title: t('sales.total_amount'),
      dataIndex: 'total',
      key: 'total',
      render: (total) => `¥${parseInt(total).toLocaleString()}`,
      sorter: (a, b) => parseInt(a.total) - parseInt(b.total),
    },
    {
      title: t('sales.staffId'),
      dataIndex: 'staff_id',
      key: 'staff_id',
    },
    {
      title: t('sales.paymentMethod'),
      dataIndex: 'payment_method',
      key: 'payment_method',
      filters: [
        { text: 'Cash', value: 'Cash' },
        { text: 'Credit Card', value: 'Credit Card' },
        { text: 'Mobile Payment', value: 'Mobile Payment' },
      ],
      onFilter: (value, record) => record.payment_method === value,
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