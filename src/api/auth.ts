import { api, unwrap } from './client';
import type { LoginBody, RegisterBody, TokenPair } from './types';

export const authApi = {
    login: (body: LoginBody) => unwrap<TokenPair>(api.post('/api/auth/login', body)),
    register: (body: RegisterBody) => unwrap<undefined>(api.post('/api/auth/register', body)),
    logout: () => unwrap<undefined>(api.post('/api/auth/logout')),
    logoutAll: () => unwrap<undefined>(api.post('/api/auth/logout-all')),
};
