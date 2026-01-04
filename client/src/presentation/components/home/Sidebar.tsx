'use client';

import { List, Avatar, Typography, Skeleton } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface User {
    id: string;
    name: string;
    email: string;
}

interface SidebarProps {
    users: User[];
    loading: boolean;
    selectedUser: User | null;
    onSelectUser: (user: User) => void;
}

export const Sidebar = ({ users, loading, selectedUser, onSelectUser }: SidebarProps) => {
    return (
        <div className="h-full border-r border-gray-200 overflow-y-auto bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <Typography.Title level={4} className="m-0">Chats</Typography.Title>
            </div>
            <List
                className="flex-1"
                itemLayout="horizontal"
                loading={loading}
                dataSource={users}
                renderItem={(user) => (
                    <List.Item
                        onClick={() => onSelectUser(user)}
                        className={`px-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-100' : ''
                            }`}
                    >
                        <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} className="bg-blue-500" />}
                            title={<Text strong>{user.name}</Text>}
                            description={<Text type="secondary" className="text-xs truncate">{user.email}</Text>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};
