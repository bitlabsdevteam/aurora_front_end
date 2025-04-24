'use client';

import React from 'react';
import MasterLayout from '../components/layout/MasterLayout';

const TasksManagerPage = () => {
  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Tasks Manager</h1>
        <div className="space-y-4">
          <p className="text-gray-600">
            Task management and tracking will be displayed here.
          </p>
        </div>
      </div>
    </MasterLayout>
  );
};

export default TasksManagerPage; 