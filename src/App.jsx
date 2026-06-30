import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Stats from '@/pages/Stats';
import Settings from '@/pages/Settings';
import Lobby from '@/pages/Lobby';
import { AssetsProvider } from '@/lib/AssetsContext';
import { SocketProvider, useSocket } from '@/lib/SocketContext';
import ConnectionBar from '@/components/ConnectionBar';

// Componente protector: Si no hay sala, te expulsa al Lobby
const RequireRoom = ({ children }) => {
  const { room } = useSocket();
  if (!room) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ConnectionBar />
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AssetsProvider>
              <Routes>
                <Route path="/" element={<Lobby />} />
                
                {/* Protegemos la ruta del juego */}
                <Route 
                  path="/game" 
                  element={
                    <RequireRoom>
                      <Home />
                    </RequireRoom>
                  } 
                />
                
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </AssetsProvider>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;