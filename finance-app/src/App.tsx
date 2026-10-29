import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { useDashboardStore } from './store/dashboardStore';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { activeWindow, setWindow } = useDashboardStore();
  return (
    <AppShell activeWindow={activeWindow} onWindowChange={setWindow}>
      <DashboardPage />
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
