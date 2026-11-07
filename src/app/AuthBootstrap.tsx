import { Box } from '@mui/material';
import { type ReactNode, useEffect, useState } from 'react';
import { endSession, refreshSession } from '@/api/client';
import { isSessionRejected } from '@/api/errors';
import { userApi } from '@/api/user';
import { QueryState } from '@/components/QueryState';
import { SplashScreen } from '@/components/SplashScreen';
import { useAuthStore } from '@/stores/authStore';

/**
 * On boot, a persisted refresh token is exchanged for an access token and the user profile
 * is loaded before any route renders, so guards never see a half-restored session.
 *
 * The session is dropped only when the server rejects it (401/403). A rate limit, a server
 * error or no connection keeps the stored token and offers a retry instead of logging out.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(() => !useAuthStore.getState().refreshToken);
    const [error, setError] = useState<unknown>(null);
    const [attempt, setAttempt] = useState(0);

    // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` re-runs the restore on retry.
    useEffect(() => {
        if (ready) return;
        let cancelled = false;
        (async () => {
            try {
                await refreshSession();
                const user = await userApi.me();
                useAuthStore.getState().setUser(user);
                if (!cancelled) setReady(true);
            } catch (e) {
                if (isSessionRejected(e)) {
                    endSession(false);
                    if (!cancelled) setReady(true);
                } else if (!cancelled) {
                    setError(e);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [ready, attempt]);

    if (ready) return children;
    if (error) {
        return (
            <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
                <Box sx={{ maxWidth: 480, width: '100%' }}>
                    <QueryState
                        isPending={false}
                        error={error}
                        onRetry={() => {
                            setError(null);
                            setAttempt((a) => a + 1);
                        }}
                    />
                </Box>
            </Box>
        );
    }
    return <SplashScreen />;
}
