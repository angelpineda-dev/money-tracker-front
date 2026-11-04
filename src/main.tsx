import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { AuthBootstrap } from '@/app/AuthBootstrap';
import { Providers } from '@/app/Providers';
import { router } from '@/routes/router';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
    <StrictMode>
        <Providers>
            <AuthBootstrap>
                <RouterProvider router={router} />
            </AuthBootstrap>
        </Providers>
    </StrictMode>,
);
