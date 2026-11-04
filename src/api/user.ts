import { api, unwrap } from './client';
import type { ChangePasswordBody, UpdateProfileBody, User } from './types';

export interface TelegramLinkCode {
    code: string;
    expiresAt: string;
}

export const userApi = {
    me: () => unwrap<User>(api.get('/api/user/me')),
    update: (body: UpdateProfileBody) => unwrap<User>(api.patch('/api/user/me', body)),
    remove: () => unwrap<undefined>(api.delete('/api/user/me')),
    changePassword: (body: ChangePasswordBody) => unwrap<undefined>(api.patch('/api/user/me/password', body)),
    telegramLinkCode: () => unwrap<TelegramLinkCode>(api.post('/api/user/me/telegram/link-code')),
    unlinkTelegram: () => unwrap<undefined>(api.delete('/api/user/me/telegram')),
};
