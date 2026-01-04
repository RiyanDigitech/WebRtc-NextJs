'use client';

import { Layout, Button, message, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/presentation/components/home/Sidebar';
import { ChatWindow } from '@/presentation/components/home/ChatWindow';

const { Header, Content, Sider } = Layout;

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Set current user name from localStorage if available, or fetch
    setCurrentUser({ name: localStorage.getItem('userName') || 'User' });

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  if (!currentUser) return null;

  return (
    <Layout className="h-screen overflow-hidden">
      <Header className="bg-blue-600 px-6 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-4">
          <Typography.Title level={3} className="m-0 text-white">ChatApp</Typography.Title>
          <span className="text-blue-100 text-sm">Welcome, {currentUser.name}</span>
        </div>
        <Button
          type="text"
          onClick={handleLogout}
          className="text-white hover:text-blue-200"
        >
          Logout
        </Button>
      </Header>
      <Layout className="flex-1 overflow-hidden">
        <Sider width={350} className="bg-white" theme="light">
          <Sidebar
            users={users}
            loading={loading}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
        </Sider>
        <Content className="h-full relative shadow-inner">
          <ChatWindow selectedUser={selectedUser} />
        </Content>
      </Layout>
    </Layout>
  );
}
