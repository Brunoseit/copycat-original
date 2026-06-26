import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Stats from '@/pages/Stats';
import Settings from '@/pages/Settings';
import { AssetsProvider } from '@/lib/AssetsContext';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          {/* Quitamos las barreras de seguridad y cargamos el juego directo */}
          <AssetsProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </AssetsProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;