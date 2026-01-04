'use client';

import { Typography, Empty, Avatar, Button } from 'antd';
import { UserOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface User {
    id: string;
    name: string;
}

interface ChatWindowProps {
    selectedUser: User | null;
}

export const ChatWindow = ({ selectedUser }: ChatWindowProps) => {
    if (!selectedUser) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <Empty
                    description={
                        <span className="text-gray-400 text-lg">
                            Select a user to start chatting
                        </span>
                    }
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white shadow-sm z-10">
                <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                <div>
                    <Title level={5} className="m-0">{selectedUser.name}</Title>
                    <Text type="secondary" className="text-xs">Online</Text>
                </div>
            </div>

            {/* Messages Area placeholder */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#e5ddd5] flex flex-col gap-4">
                {/* Sample messages */}
                <div className="self-start bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[70%]">
                    <Text>Hello! How are you?</Text>
                </div>
                <div className="self-end bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[70%]">
                    <Text>I'm good, thanks! How about you?</Text>
                </div>
            </div>

            {/* Input Area placeholder */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-4">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    size="large"
                    className="bg-blue-500 hover:bg-blue-600 border-none shadow-md"
                />
            </div>
        </div>
    );
};
