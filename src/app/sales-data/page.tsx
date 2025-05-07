'use client';

import React, { useState } from 'react';
import { Table, Input, Space, Button, Select } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import MasterLayout from '../components/layout/MasterLayout';

interface SalesRecord {
  id: number;
  month: string;
  product: string;
  region: string;
  unitsSold: number;
  revenue: number;
  costOfGoods: number;
  profit: number;
  date: string;
}

const SalesDataPage = () => {
  // Sample sales data for 2024
  const salesData: SalesRecord[] = [
    { id: 1, month: 'January', product: 'Summer Dress', region: 'North America', unitsSold: 1250, revenue: 56250, costOfGoods: 31250, profit: 25000, date: '2024-01-31' },
    { id: 2, month: 'January', product: 'Winter Jacket', region: 'Europe', unitsSold: 890, revenue: 89000, costOfGoods: 53400, profit: 35600, date: '2024-01-31' },
    { id: 3, month: 'February', product: 'Denim Jeans', region: 'North America', unitsSold: 1450, revenue: 72500, costOfGoods: 43500, profit: 29000, date: '2024-02-28' },
    { id: 4, month: 'February', product: 'Casual Shirts', region: 'Asia', unitsSold: 2100, revenue: 63000, costOfGoods: 37800, profit: 25200, date: '2024-02-28' },
    { id: 5, month: 'March', product: 'Athletic Shoes', region: 'Europe', unitsSold: 960, revenue: 115200, costOfGoods: 67200, profit: 48000, date: '2024-03-31' },
    { id: 6, month: 'March', product: 'Casual Shorts', region: 'North America', unitsSold: 1820, revenue: 54600, costOfGoods: 32760, profit: 21840, date: '2024-03-31' },
    { id: 7, month: 'April', product: 'Spring Collection', region: 'Asia', unitsSold: 2450, revenue: 98000, costOfGoods: 58800, profit: 39200, date: '2024-04-30' },
    { id: 8, month: 'April', product: 'Accessories', region: 'Europe', unitsSold: 3200, revenue: 48000, costOfGoods: 25600, profit: 22400, date: '2024-04-30' },
    { id: 9, month: 'May', product: 'Summer Collection', region: 'North America', unitsSold: 2850, revenue: 142500, costOfGoods: 85500, profit: 57000, date: '2024-05-31' },
    { id: 10, month: 'May', product: 'Swimwear', region: 'Asia', unitsSold: 1750, revenue: 78750, costOfGoods: 43750, profit: 35000, date: '2024-05-31' },
    { id: 11, month: 'June', product: 'Sandals', region: 'Europe', unitsSold: 1560, revenue: 62400, costOfGoods: 35880, profit: 26520, date: '2024-06-30' },
    { id: 12, month: 'June', product: 'Summer Hats', region: 'North America', unitsSold: 980, revenue: 29400, costOfGoods: 14700, profit: 14700, date: '2024-06-30' },
    { id: 13, month: 'July', product: 'Beach Collection', region: 'Asia', unitsSold: 2350, revenue: 117500, costOfGoods: 70500, profit: 47000, date: '2024-07-31' },
    { id: 14, month: 'July', product: 'Casual Wear', region: 'Europe', unitsSold: 1870, revenue: 74800, costOfGoods: 44880, profit: 29920, date: '2024-07-31' },
    { id: 15, month: 'August', product: 'Back to School', region: 'North America', unitsSold: 3250, revenue: 162500, costOfGoods: 97500, profit: 65000, date: '2024-08-31' },
    { id: 16, month: 'August', product: 'Fall Preview', region: 'Asia', unitsSold: 1650, revenue: 82500, costOfGoods: 49500, profit: 33000, date: '2024-08-31' },
    { id: 17, month: 'September', product: 'Fall Collection', region: 'Europe', unitsSold: 2120, revenue: 106000, costOfGoods: 63600, profit: 42400, date: '2024-09-30' },
    { id: 18, month: 'September', product: 'Light Jackets', region: 'North America', unitsSold: 1380, revenue: 96600, costOfGoods: 55200, profit: 41400, date: '2024-09-30' },
    { id: 19, month: 'October', product: 'Winter Preview', region: 'Asia', unitsSold: 1720, revenue: 120400, costOfGoods: 68800, profit: 51600, date: '2024-10-31' },
    { id: 20, month: 'October', product: 'Fall Boots', region: 'Europe', unitsSold: 1480, revenue: 118400, costOfGoods: 66640, profit: 51760, date: '2024-10-31' },
  ];

  const [filteredData, setFilteredData] = useState<SalesRecord[]>(salesData);
  const [searchText, setSearchText] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  const handleSearch = () => {
    let filtered = [...salesData];

    // Filter by product name
    if (searchText) {
      filtered = filtered.filter(
        item => item.product.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by region
    if (regionFilter) {
      filtered = filtered.filter(item => item.region === regionFilter);
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setRegionFilter('');
    setFilteredData(salesData);
  };

  const regions = Array.from(new Set(salesData.map(item => item.region)));

  const columns: ColumnType<SalesRecord>[] = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      sorter: (a, b) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      }
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      sorter: (a, b) => a.product.localeCompare(b.product),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      filters: regions.map(region => ({ text: region, value: region })),
      onFilter: (value, record) => record.region === value,
    },
    {
      title: 'Units Sold',
      dataIndex: 'unitsSold',
      key: 'unitsSold',
      sorter: (a, b) => a.unitsSold - b.unitsSold,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => `$${revenue.toLocaleString()}`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'Cost of Goods',
      dataIndex: 'costOfGoods',
      key: 'costOfGoods',
      render: (cost) => `$${cost.toLocaleString()}`,
      sorter: (a, b) => a.costOfGoods - b.costOfGoods,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit) => `$${profit.toLocaleString()}`,
      sorter: (a, b) => a.profit - b.profit,
    },
  ];

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Sales Data 2024 ({filteredData.length} records)</h1>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Product
              </label>
              <Input
                placeholder="Search product name"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                className="w-64"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <Select
                placeholder="Select Region"
                value={regionFilter}
                onChange={value => setRegionFilter(value)}
                allowClear
                style={{ width: 200 }}
                options={regions.map(region => ({ value: region, label: region }))}
              />
            </div>
            <Space>
              <Button type="primary" onClick={handleSearch} className="bg-[#4745D0]">
                Search
              </Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
          }}
        />
      </div>
    </MasterLayout>
  );
};

export default SalesDataPage; 