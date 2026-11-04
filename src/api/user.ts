import { api, unwrap } from './client';
import type { User } from './types';

export const userApi = {
    me: () => unwrap<User>(api.get('/api/user/me')),
};
