import { useNavigate } from 'react-router';
import { authApi } from '@/api/auth';
import { endSession } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { LoginBody } from '@/api/types';
import { userApi } from '@/api/user';
import { queryClient } from '@/app/queryClient';
import { useAuthStore } from '@/stores/authStore';

/** Starts a session: stores tokens, loads `/me`, and lets the PublicOnly guard redirect. */
export async function startSession(credentials: LoginBody): Promise<void> {
    const { token, refreshToken } = await authApi.login(credentials);
    useAuthStore.getState().setTokens(token, refreshToken);
    const user = await userApi.me();
    queryClient.setQueryData(queryKeys.me, user);
    useAuthStore.getState().setUser(user);
}

export function useLogout() {
    const navigate = useNavigate();
    return async (everywhere = false) => {
        try {
            await (everywhere ? authApi.logoutAll() : authApi.logout());
        } catch {
            // The session is dropped locally even if the server call fails.
        }
        endSession(false);
        navigate('/login', { replace: true });
    };
}
