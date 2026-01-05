'use client';

import { Typography, Empty, Avatar, Button, Input, Space } from 'antd';
import { UserOutlined, SendOutlined, VideoCameraOutlined, PhoneOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketProvider';
import { VideoCall } from './VideoCall';// web rtc

const { Title, Text } = Typography;

interface User {
    id: string;
    name: string;
}

interface Message {
    senderId: string;
    message: string;
    timestamp: Date;
}

interface ChatWindowProps {
    selectedUser: User | null;
}

export const ChatWindow = ({ selectedUser }: ChatWindowProps) => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchHistory = async () => {
        if (!selectedUser || !currentUserId) return;
        try {
            const response = await fetch(`http://localhost:5000/api/messages/${currentUserId}/${selectedUser.id}`);
            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();
            const formattedMessages = data.map((msg: any) => ({
                senderId: msg.senderId,
                message: msg.content,
                timestamp: new Date(msg.createdAt)
            }));
            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket || !selectedUser) return;

        const handleReceiveMessage = (data: Message) => {
            // Only add message if it's from the selected user
            if (data.senderId === selectedUser.id) {
                setMessages((prev) => [...prev, data]);
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        fetchHistory();

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, selectedUser, currentUserId]);

    const handleSend = () => {
        if (!inputValue.trim() || !socket || !selectedUser || !currentUserId) return;

        const newMessage: Message = {
            senderId: currentUserId,
            message: inputValue,
            timestamp: new Date(),
        };

        socket.emit('send_message', {
            recipientId: selectedUser.id,
            senderId: currentUserId,
            message: inputValue,
        });

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
    };

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
                {/*  {web rtc} */}<div className="flex-1">
                    <Title level={5} className="m-0">{selectedUser.name}</Title>
                    <Text type="secondary" className="text-xs">Online</Text>
                </div> {/*  {web rtc} */}
                <Space>
                    <Button
                        type="text"
                        icon={<PhoneOutlined className="text-gray-600" />}
                        onClick={() => (window as any).startVideoCall?.(selectedUser.id, selectedUser.name)}
                    />
                    <Button
                        type="text"
                        icon={<VideoCameraOutlined className="text-gray-600" />}
                        onClick={() => (window as any).startVideoCall?.(selectedUser.id, selectedUser.name)}
                    />
                </Space> {/*  {web rtc} */}
            </div> {/*  {web rtc} */}
            {currentUserId && (
                <VideoCall
                    currentUserId={currentUserId}
                    userName={localStorage.getItem('userName') || 'User'}
                />
            )}
            {/*  {web rtc} */}
            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#e5ddd5] flex flex-col gap-2">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${msg.senderId === currentUserId
                            ? 'self-end bg-[#dcf8c6] rounded-tr-none'
                            : 'self-start bg-white rounded-tl-none'
                            }`}
                    >
                        <Text>{msg.message}</Text>
                        <div className="text-[10px] text-gray-500 text-right mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-4">
                <Input
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={handleSend}
                    className="flex-1 rounded-full px-4"
                />
                <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    size="large"
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="bg-blue-500 hover:bg-blue-600 border-none shadow-md"
                />
            </div>
        </div>
    );
};
