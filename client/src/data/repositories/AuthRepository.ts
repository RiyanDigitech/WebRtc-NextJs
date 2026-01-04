import api from '../sources/api';
import { User } from '../../core/models/User';

export class AuthRepository {
    async signup(data: any): Promise<User> {
        const response = await api.post('/auth/signup', data);
        return response.data;
    }

    async login(data: any): Promise<User> {
        const response = await api.post('/auth/login', data);
        return response.data;
    }
}

export const authRepository = new AuthRepository();
