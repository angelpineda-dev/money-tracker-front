import { type ReactNode, useEffect, useState } from 'react';
import { endSession, refreshSession } from '@/api/client';
import { userApi } from '@/api/user';
import { SplashScreen } from '@/components/SplashScreen';
import { useAuthStore } from '@/stores/authStore';

/**
 * On boot, a persisted refresh token is exchanged for an access token and the user profile
 * is loaded before any route renders, so guards never see a half-restored session.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(() => !useAuthStore.getState().refreshToken);

    useEffect(() => {
        if (ready) return;
        let cancelled = false;
        (async () => {
            try {
                await refreshSession();
                const user = await userApi.me();
                useAuthStore.getState().setUser(user);
            } catch {
                endSession(false);
            } finally {
                if (!cancelled) setReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [ready]);

    return ready ? children : <SplashScreen />;
}
