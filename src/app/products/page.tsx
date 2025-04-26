'use client';

import React, { useState, useEffect } from 'react';
import { Table, Input, DatePicker, Space, Button } from 'antd';
import type { TablePaginationConfig, ColumnType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import MasterLayout from '../components/layout/MasterLayout';

// Register dayjs plugins
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image?: string;
}

const ProductsPage = () => {
  const [data, setData] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  useEffect(() => {
    // Fetch products from JSON file
    const fetchProducts = async () => {
      try {
        const response = await fetch('/json/products.json');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setData(data.products);
        setFilteredData(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = () => {
    let filtered = [...data];

    // Filter by SKU or name
    if (searchText) {
      filtered = filtered.filter(
        item => 
          item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
          item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(item => 
        dayjs(item.createdAt).isBetween(dateRange[0], dateRange[1], 'day', '[]')
      );
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setDateRange([null, null]);
    setFilteredData(data);
  };

  const columns: ColumnType<Product>[] = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      sorter: (a: Product, b: Product) => a.sku.localeCompare(b.sku),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: Array.from(new Set(data.map(item => item.category))).map(category => ({
        text: category,
        value: category,
      })),
      onFilter: (value, record: Product) => 
        record.category === (value as string),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === 'In Stock'
              ? 'bg-green-100 text-green-800'
              : status === 'Low Stock'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: Product, b: Product) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
  ];

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Products ({filteredData.length})</h1>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by SKU/Name
              </label>
              <Input
                placeholder="Search SKU or product name"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                className="w-64"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                className="w-64"
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
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
        />
      </div>
    </MasterLayout>
  );
};

export default ProductsPage; 