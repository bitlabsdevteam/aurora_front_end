'use client';

import React, { useState } from 'react';
import { Select, Button, DatePicker } from 'antd';
import { Filter, X } from 'lucide-react';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

// Mock data for filters
const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Living' },
  { value: 'beauty', label: 'Beauty & Health' },
];

const regions = [
  { value: 'na', label: 'North America' },
  { value: 'eu', label: 'Europe' },
  { value: 'asia', label: 'Asia Pacific' },
  { value: 'latam', label: 'Latin America' },
];

const Filters = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all filters?')) {
      setSelectedCategories([]);
      setSelectedRegions([]);
      setDateRange([null, null]);
    }
  };

  const handleApply = () => {
    console.log('Applied Filters:', {
      categories: selectedCategories,
      regions: selectedRegions,
      dateRange: dateRange.map(date => date?.format('YYYY-MM-DD')),
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </h3>
          <button
            onClick={handleReset}
            className="p-1 hover:bg-gray-100 rounded text-gray-500"
            title="Reset filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <RangePicker
            className="w-full"
            onChange={(dates) => setDateRange(dates || [null, null])}
            value={dateRange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select categories"
            value={selectedCategories}
            onChange={setSelectedCategories}
            options={categories}
            maxTagCount={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regions
          </label>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select regions"
            value={selectedRegions}
            onChange={setSelectedRegions}
            options={regions}
            maxTagCount={2}
          />
        </div>

        <Button
          type="primary"
          className="w-full bg-[#4745D0] hover:bg-[#3d3bb7]"
          onClick={handleApply}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default Filters; 