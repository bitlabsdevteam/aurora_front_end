'use client';

import { Card, Tag, Button } from 'antd';
import { UsersIcon } from 'lucide-react';

const TargetDemographics = () => {
  return (
    <Card className="shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Target Demographics</h3>
        <UsersIcon className="w-5 h-5 text-indigo-500" />
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Gen Z (18-24)</h4>
            <Tag color="#4745D0" className="rounded-full">Highest Growth</Tag>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Tag color="blue" className="rounded-full">Sustainability</Tag>
            <Tag color="purple" className="rounded-full">Y2K Revival</Tag>
            <Tag color="green" className="rounded-full">Gender-Fluid</Tag>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Millennials (25-40)</h4>
            <Tag color="#4745D0" className="rounded-full">Highest Spend</Tag>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Tag color="blue" className="rounded-full">Athleisure</Tag>
            <Tag color="purple" className="rounded-full">Minimalism</Tag>
            <Tag color="green" className="rounded-full">Workwear 2.0</Tag>
          </div>
        </div>

        <Button type="link" className="p-0 text-[#4745D0]">
          View Demographics Report
        </Button>
      </div>
    </Card>
  );
};

export default TargetDemographics; 