import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './app/AppProvider';
import { router } from './app/router';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing application root');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <Suspense
          fallback={
            <div className="loading-screen" role="status">
              Cargando tu universo…
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
);
