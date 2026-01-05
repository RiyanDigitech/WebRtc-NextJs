'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { useState } from 'react';
import { SocketProvider } from './home/SocketProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <SocketProvider>
                <ConfigProvider>
                    {children}
                </ConfigProvider>
            </SocketProvider>
        </QueryClientProvider>
    );
}
