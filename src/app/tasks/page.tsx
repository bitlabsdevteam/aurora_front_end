'use client';

import React from 'react';
import { Table, Badge } from 'antd';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import MasterLayout from '../components/layout/MasterLayout';

interface Task {
  id: string;
  owner: string;
  createdAt: string;
  finishedAt: string | null;
  status: 'Ready and running' | 'Finished';
}

const tasks: Task[] = [
  {
    id: uuidv4(),
    owner: 'Alice',
    createdAt: '2024-06-01T09:00:00Z',
    finishedAt: null,
    status: 'Ready and running',
  },
  {
    id: uuidv4(),
    owner: 'Bob',
    createdAt: '2024-06-01T10:00:00Z',
    finishedAt: '2024-06-01T12:00:00Z',
    status: 'Finished',
  },
  {
    id: uuidv4(),
    owner: 'Charlie',
    createdAt: '2024-06-02T08:30:00Z',
    finishedAt: null,
    status: 'Ready and running',
  },
  {
    id: uuidv4(),
    owner: 'Diana',
    createdAt: '2024-06-02T09:15:00Z',
    finishedAt: '2024-06-02T11:45:00Z',
    status: 'Finished',
  },
  {
    id: uuidv4(),
    owner: 'Eve',
    createdAt: '2024-06-03T07:50:00Z',
    finishedAt: null,
    status: 'Ready and running',
  },
];

const columns = [
  {
    title: 'Task ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Owner',
    dataIndex: 'owner',
    key: 'owner',
  },
  {
    title: 'Created Date Time',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: 'Finished Date Time',
    dataIndex: 'finishedAt',
    key: 'finishedAt',
    render: (date: string | null) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : <span className="text-gray-400">-</span>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Badge
        status={status === 'Finished' ? 'success' : 'processing'}
        text={status}
      />
    ),
  },
];

const TasksManagerPage = () => {
  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Tasks Manager</h1>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={false}
        />
      </div>
    </MasterLayout>
  );
};

export default TasksManagerPage; 