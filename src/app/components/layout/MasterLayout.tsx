'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  Layout,
  Button,
  Dropdown,
  Avatar,
  theme,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings,
  BarChart2,
  ShoppingCart,
  Users,
  ClipboardList,
} from 'lucide-react';

const { Header, Sider, Content } = Layout;

interface MasterLayoutProps {
  children: React.ReactNode;
}

const MasterLayout = ({ children }: MasterLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { token } = theme.useToken();

  const handleLogout = () => {
    document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      key: 'mcp',
      label: 'MCP Servers',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => router.push('/mcp'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: 'Dashboard',
    },
    {
      key: 'analytics',
      icon: <BarChart2 className="w-4 h-4" />,
      label: 'Analytics',
    },
    {
      key: 'products',
      icon: <ShoppingCart className="w-4 h-4" />,
      label: 'Products',
    },
    {
      key: 'customers',
      icon: <Users className="w-4 h-4" />,
      label: 'Customers',
    },
    {
      key: 'tasks',
      icon: <ClipboardList className="w-4 h-4" />,
      label: 'Tasks Manager',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(`/${e.key}`);
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white border-r border-gray-200 relative"
        width={256}
        theme="light"
      >
        <div className="p-4 border-b border-gray-100 flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-[#4745D0]">A</span>
            {!collapsed && (
              <span className="text-xl font-semibold text-gray-800">Aurora</span>
            )}
          </Link>
          <Button
            icon={collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            onClick={() => setCollapsed(!collapsed)}
            className={`ml-auto flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-all ${
              collapsed ? 'w-8 h-8 p-0' : 'w-8 h-8 p-0'
            }`}
          />
        </div>
        <Menu
          mode="inline"
          className="border-0 px-3 py-4"
          items={menuItems}
          defaultSelectedKeys={['dashboard']}
          onClick={handleMenuClick}
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            background: token.colorBgContainer,
            padding: '0 24px',
            height: 64,
            lineHeight: '64px',
            borderBottom: '1px solid #f0f0f0',
          }}
          className="flex items-center justify-end shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                <Avatar
                  style={{
                    backgroundColor: token.colorPrimary,
                    color: token.colorBgContainer,
                  }}
                  icon={<User className="w-4 h-4" />}
                />
                <span className="text-sm font-medium text-gray-800">John Doe</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="bg-[#F8F9FE] p-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MasterLayout; 