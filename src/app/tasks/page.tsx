'use client';

import React from 'react';
import { Table, Badge } from 'antd';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import MasterLayout from '../components/layout/MasterLayout';
import { useLocale } from '../../context/LocaleContext';

interface Task {
  id: string;
  name: string;
  owner: string;
  createdAt: string;
  finishedAt: string | null;
  status: 'Ready and running' | 'Finished';
}

const tasks: Task[] = [
  {
    id: uuidv4(),
    name: 'Data Import',
    owner: 'Alice',
    createdAt: '2024-06-01T09:00:00Z',
    finishedAt: null,
    status: 'Ready and running',
  },
  {
    id: uuidv4(),
    name: 'Generate Report',
    owner: 'Bob',
    createdAt: '2024-06-01T10:00:00Z',
    finishedAt: '2024-06-01T12:00:00Z',
    status: 'Finished',
  },
  {
    id: uuidv4(),
    name: 'Sync Inventory',
    owner: 'Charlie',
    createdAt: '2024-06-02T08:30:00Z',
    finishedAt: null,
    status: 'Ready and running',
  },
  {
    id: uuidv4(),
    name: 'Backup Database',
    owner: 'Diana',
    createdAt: '2024-06-02T09:15:00Z',
    finishedAt: '2024-06-02T11:45:00Z',
    status: 'Finished',
  },
  {
    id: uuidv4(),
    name: 'User Audit',
    owner: 'Eve',
    createdAt: '2024-06-03T07:50:00Z',
    finishedAt: null,
    status: 'Ready and running',
  },
];

const TasksManagerPage = () => {
  const { t } = useLocale();
  
  const columns = [
    {
      title: t('tasks.taskID'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('tasks.taskName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('tasks.owner'),
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: t('tasks.createdDateTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('tasks.finishedDateTime'),
      dataIndex: 'finishedAt',
      key: 'finishedAt',
      render: (date: string | null) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : <span className="text-gray-400">-</span>,
    },
    {
      title: t('tasks.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'Finished' ? 'success' : 'processing'}
          text={status === 'Finished' ? t('tasks.completed') : t('tasks.inProgress')}
        />
      ),
    },
  ];

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">{t('tasks.title')}</h1>
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