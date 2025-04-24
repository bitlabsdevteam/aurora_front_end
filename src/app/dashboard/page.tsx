'use client';

import React, { useState, useEffect } from 'react';
import TopWidgets from '../components/dashboard/TopWidgets';
import Filters from '../components/dashboard/Filters';
import AiInsights from '../components/dashboard/AiInsights';
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';

const MasterLayout = dynamic(() => import('../components/layout/MasterLayout'), {
  ssr: false
});

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const content = (
    <div className="min-h-screen bg-[#F8F9FE]">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
            
            <TopWidgets />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[300px] p-4 flex flex-col space-y-4">
          <Filters />
          <AiInsights />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <MasterLayout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton active />
              </div>
            ))}
          </div>
        </div>
      </MasterLayout>
    );
  }

  return <MasterLayout>{content}</MasterLayout>;
};

export default Dashboard; 