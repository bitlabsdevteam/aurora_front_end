'use client';

import React, { useState, useEffect } from 'react';
import { Table, Input, DatePicker, Space, Button, Alert } from 'antd';
import type { TablePaginationConfig, ColumnType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import MasterLayout from '../components/layout/MasterLayout';
import { useLocale } from '../../context/LocaleContext';

// Register dayjs plugins
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

interface Product {
  _id: string;
  sku_id: string;
  product_name: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  sex: string;
  pattern: string;
  fabric: string;
  fit: string;
  season: string;
  price: number;
  stock_quantity: number;
  launch_date: string;
  eco_tag: string;
  country_origin: string;
  upc: string;
  style_collection: string;
  supplier: string;
  care_instructions: string;
  image_url: string;
  status: string;
}

const ProductsPage = () => {
  const { t } = useLocale();
  const [data, setData] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  useEffect(() => {
    // Fetch products from API endpoint
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use our API proxy instead of the static JSON file
        const response = await fetch('/api/skus');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Raw products data:', data);
        
        // Process the response data
        const productArray = Array.isArray(data) ? data : (data.products || data.items || []);
        
        // Convert API data to match our Product interface
        const formattedProducts = productArray.map((item: any): Product => {
          console.log('Processing product item:', item);
          return {
            _id: item._id || item.id || '',
            sku_id: item.sku_id || '',
            product_name: item.product_name || item.name || '',
            brand: item.brand || '',
            category: item.category || '',
            size: item.size || '',
            color: item.color || '',
            sex: item.sex || '',
            pattern: item.pattern || '',
            fabric: item.fabric || '',
            fit: item.fit || '',
            season: item.season || '',
            price: typeof item.price === 'number' ? item.price : 0,
            stock_quantity: typeof item.stock_quantity === 'number' ? item.stock_quantity : 
                           (typeof item.stock === 'number' ? item.stock : 0),
            launch_date: item.launch_date || new Date().toISOString().split('T')[0],
            eco_tag: item.eco_tag || '',
            country_origin: item.country_origin || '',
            upc: item.upc || '',
            style_collection: item.style_collection || '',
            supplier: item.supplier || '',
            care_instructions: item.care_instructions || '',
            image_url: item.image_url || '',
            status: getStockStatus(typeof item.stock_quantity === 'number' ? item.stock_quantity : 
                                  (typeof item.stock === 'number' ? item.stock : 0))
          };
        });
        
        console.log('Formatted products:', formattedProducts); // Debug logging
        setData(formattedProducts);
        setFilteredData(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
        
        // Fallback to local JSON if API fails
        fetchLocalProducts();
      } finally {
        setLoading(false);
      }
    };

    // Fallback function to fetch from local JSON
    const fetchLocalProducts = async () => {
      try {
        const response = await fetch('/json/products.json');
        if (!response.ok) {
          throw new Error('Failed to fetch local products data');
        }
        const data = await response.json();
        setData(data.products);
        setFilteredData(data.products);
      } catch (localError) {
        console.error('Error fetching local products:', localError);
        setData([]);
        setFilteredData([]);
      }
    };

    fetchProducts();
  }, []);

  // Helper function to determine stock status
  const getStockStatus = (stockValue: number): string => {
    if (stockValue <= 0) return '在庫切れ';
    if (stockValue <= 10) return '在庫僅少';
    return '在庫あり';
  };

  const handleSearch = () => {
    let filtered = [...data];

    // Filter by SKU or name
    if (searchText) {
      filtered = filtered.filter(
        item => 
          (item.sku_id || '').toLowerCase().includes(searchText.toLowerCase()) ||
          (item.product_name || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(item => 
        dayjs(item.launch_date).isBetween(dateRange[0], dateRange[1], 'day', '[]')
      );
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setDateRange([null, null]);
    setFilteredData(data);
  };

  const getStatusTranslation = (status: string) => {
    if (status === '在庫あり') return t('products.inStock');
    if (status === '在庫僅少') return t('products.lowStock');
    if (status === '在庫切れ') return t('products.outOfStock');
    return status;
  };

  const columns: ColumnType<Product>[] = [
    {
      title: '品番',
      dataIndex: 'sku_id',
      key: 'sku',
      width: 120,
      sorter: (a: Product, b: Product) => (a.sku_id || '').localeCompare(b.sku_id || ''),
    },
    {
      title: '商品名',
      dataIndex: 'product_name',
      key: 'name',
      width: 180,
      sorter: (a: Product, b: Product) => (a.product_name || '').localeCompare(b.product_name || ''),
    },
    {
      title: 'ブランド',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
      sorter: (a: Product, b: Product) => (a.brand || '').localeCompare(b.brand || ''),
    },
    {
      title: 'カテゴリー',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      filters: Array.from(new Set(data.map(item => item.category)))
        .filter(Boolean)
        .map(category => ({
          text: category,
          value: category,
        })),
      onFilter: (value, record: Product) => 
        record.category === (value as string),
    },
    {
      title: 'サイズ',
      dataIndex: 'size',
      key: 'size',
      width: 80,
    },
    {
      title: '色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
    },
    {
      title: '性別',
      dataIndex: 'sex',
      key: 'sex',
      width: 80,
    },
    {
      title: '柄',
      dataIndex: 'pattern',
      key: 'pattern',
      width: 90,
    },
    {
      title: '素材',
      dataIndex: 'fabric',
      key: 'fabric',
      width: 100,
    },
    {
      title: 'フィット',
      dataIndex: 'fit',
      key: 'fit',
      width: 90,
    },
    {
      title: 'シーズン',
      dataIndex: 'season',
      key: 'season',
      width: 100,
    },
    {
      title: '価格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      render: (price: number) => isNaN(price) ? '¥0.00' : `¥${price.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sorter: (a: Product, b: Product) => (a.price || 0) - (b.price || 0),
    },
    {
      title: '在庫',
      dataIndex: 'stock_quantity',
      key: 'stock',
      width: 80,
      align: 'center',
      sorter: (a: Product, b: Product) => (a.stock_quantity || 0) - (b.stock_quantity || 0),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === '在庫あり'
              ? 'bg-green-100 text-green-800'
              : status === '在庫僅少'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'エコタグ',
      dataIndex: 'eco_tag',
      key: 'eco_tag',
      width: 100,
    },
    {
      title: '原産国',
      dataIndex: 'country_origin',
      key: 'country_origin',
      width: 120,
    },
    {
      title: 'UPC',
      dataIndex: 'upc',
      key: 'upc',
      width: 140,
    },
    {
      title: 'スタイルコレクション',
      dataIndex: 'style_collection',
      key: 'style_collection',
      width: 150,
    },
    {
      title: 'サプライヤー',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: 'お手入れ方法',
      dataIndex: 'care_instructions',
      key: 'care_instructions',
      width: 140,
    },
    {
      title: '発売日',
      dataIndex: 'launch_date',
      key: 'launch_date',
      width: 120,
      align: 'center',
      sorter: (a: Product, b: Product) => dayjs(a.launch_date || '').unix() - dayjs(b.launch_date || '').unix(),
    },
  ];

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">{t('products.title')} ({filteredData.length})</h1>
          
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}
          
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                品番/商品名で検索
              </label>
              <Input
                placeholder="品番または商品名を検索"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                className="w-64"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日付範囲
              </label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                className="w-64"
              />
            </div>
            <Space>
              <Button type="primary" onClick={handleSearch} className="bg-[#4745D0]">
                検索
              </Button>
              <Button onClick={handleReset}>リセット</Button>
            </Space>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            loading={loading}
            pagination={{
              total: filteredData.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `合計 ${total} 個`,
            }}
            scroll={{ x: 2500, y: 500 }}
            size="small"
            rowClassName={(record, index) => index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            className="border-separate border-spacing-0"
            bordered={false}
          />
        </div>
      </div>
    </MasterLayout>
  );
};

export default ProductsPage; 