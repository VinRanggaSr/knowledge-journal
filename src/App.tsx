import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import AppRoutes from '@/routes/AppRoutes';
import PasswordGate from '@/components/PasswordGate';

const queryClient = new QueryClient();

function App() {
  return (
    <PasswordGate>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </PasswordGate>
  );
}

export default App;
