'use client';

import React, { useState } from 'react';
import { Table, Button, Badge, Space, Modal, message } from 'antd';
import { PoweroffOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import MasterLayout from '../components/layout/MasterLayout';

interface MCPServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  type: string;
  version: string;
  lastActive: string;
  capabilities: string[];
}

const MCPPage = () => {
  const [servers, setServers] = useState<MCPServer[]>([
    {
      id: 'mcp-1',
      name: 'GitHub Integration Server',
      status: 'running',
      type: 'Code Repository',
      version: '1.0.0',
      lastActive: '2024-04-23 10:30:00',
      capabilities: ['resource-access', 'tool-execution'],
    },
    {
      id: 'mcp-2',
      name: 'PostgreSQL Data Server',
      status: 'running',
      type: 'Database',
      version: '1.1.0',
      lastActive: '2024-04-23 10:29:00',
      capabilities: ['data-query', 'schema-inspection'],
    },
    {
      id: 'mcp-3',
      name: 'File System Server',
      status: 'stopped',
      type: 'Storage',
      version: '1.0.2',
      lastActive: '2024-04-23 09:15:00',
      capabilities: ['file-access', 'search'],
    },
    {
      id: 'mcp-4',
      name: 'Slack Integration Server',
      status: 'error',
      type: 'Communication',
      version: '1.0.1',
      lastActive: '2024-04-23 08:45:00',
      capabilities: ['message-access', 'channel-management'],
    },
    {
      id: 'mcp-5',
      name: 'Google Drive Server',
      status: 'running',
      type: 'Document Storage',
      version: '1.2.0',
      lastActive: '2024-04-23 10:28:00',
      capabilities: ['document-access', 'sharing'],
    },
  ]);

  const handleToggleServer = (serverId: string) => {
    setServers(prev => prev.map(server => {
      if (server.id === serverId) {
        const newStatus = server.status === 'running' ? 'stopped' : 'running';
        message.success(`Server ${server.name} ${newStatus === 'running' ? 'started' : 'stopped'}`);
        return { ...server, status: newStatus };
      }
      return server;
    }));
  };

  const handleRestartServer = (serverId: string) => {
    Modal.confirm({
      title: 'Restart Server',
      content: 'Are you sure you want to restart this server?',
      onOk: () => {
        setServers(prev => prev.map(server => {
          if (server.id === serverId) {
            message.success(`Server ${server.name} restarted successfully`);
            return { ...server, status: 'running' };
          }
          return server;
        }));
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={
            status === 'running' ? 'success' :
            status === 'stopped' ? 'default' :
            'error'
          }
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: 'Capabilities',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities: string[]) => (
        <Space size={[0, 4]} wrap>
          {capabilities.map((cap) => (
            <Badge
              key={cap}
              count={cap}
              style={{
                backgroundColor: '#4745D0',
                padding: '0 8px',
                borderRadius: '10px',
              }}
            />
          ))}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: MCPServer) => (
        <Space size="middle">
          <Button
            icon={<PoweroffOutlined />}
            onClick={() => handleToggleServer(record.id)}
            type={record.status === 'running' ? 'default' : 'primary'}
          >
            {record.status === 'running' ? 'Stop' : 'Start'}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => handleRestartServer(record.id)}
          >
            Restart
          </Button>
          <Button
            icon={<SettingOutlined />}
            type="text"
          >
            Configure
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MasterLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">MCP Servers</h1>
          <p className="text-gray-600">
            Manage your Model Context Protocol (MCP) servers and their configurations.
          </p>
        </div>
        <Table
          columns={columns}
          dataSource={servers}
          rowKey="id"
          pagination={false}
        />
      </div>
    </MasterLayout>
  );
};

export default MCPPage; 