'use client';

import { Form, Input, Button, Card, Typography } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSignup } from '@/presentation/hooks/useAuth';
import Link from 'next/link';

const { Title, Text } = Typography;

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
    const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });
    const { mutate, isPending } = useSignup();

    const onSubmit = (data: SignupFormData) => {
        mutate(data);
    };

    return (
        <>
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md shadow-lg border-0">
                    <Title level={2} className="text-center mb-8">Create Account</Title>
                    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                        <Form.Item
                            label="Name"
                            validateStatus={errors.name ? 'error' : ''}
                            help={errors.name?.message}
                        >
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => <Input {...field} placeholder="Enter your name" />}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            validateStatus={errors.email ? 'error' : ''}
                            help={errors.email?.message}
                        >
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => <Input {...field} placeholder="Enter your email" />}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            validateStatus={errors.password ? 'error' : ''}
                            help={errors.password?.message}
                        >
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => <Input.Password {...field} placeholder="Enter your password" />}
                            />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" block loading={isPending} size="large">
                            Sign Up
                        </Button>
                    </Form>
                    <div className="text-center mt-6">
                        <Text>Already have an account? </Text>
                        <Link href="/login" className="text-blue-600 hover:text-blue-800">Login here</Link>
                    </div>
                </Card>
            </div>
        </>
    );
}
