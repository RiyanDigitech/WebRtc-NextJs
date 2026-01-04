import { useMutation } from '@tanstack/react-query';
import { authRepository } from '@/data/repositories/AuthRepository';
import { message } from 'antd';
import { useRouter } from 'next/navigation';

export const useSignup = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: (data: any) => authRepository.signup(data),
        onSuccess: () => {
            message.success('Account created successfully');
            router.push('/login');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Signup failed');
        },
    });
};

export const useLogin = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: (data: any) => authRepository.login(data),
        onSuccess: (data: any) => {
            message.success('Login successful');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            router.push('/');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Login failed');
        },
    });
};
