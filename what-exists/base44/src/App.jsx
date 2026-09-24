import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ArtifactDetail from './pages/ArtifactDetail';
import ShopProfile from './pages/ShopProfile';
import PublishArtifact from './pages/PublishArtifact';
import Onboarding from './pages/Onboarding';
import CreateAccount from './pages/market/CreateAccount';
import AccessAccount from './pages/market/AccessAccount';
import MarketDashboard from './pages/market/MarketDashboard';
import StoreSettings from './pages/market/StoreSettings';
import MyStore from './pages/market/MyStore';
import FAQ from './pages/FAQ';
import AdminReview from './pages/AdminReview';
import Roadmap from './pages/Roadmap';
import Checkout from './pages/Checkout';
import CanvasDesigner from './pages/CanvasDesigner';
import BuildPage from './pages/studio/BuildPage';
import TemplatesPage from './pages/studio/TemplatesPage';
import StylesPage from './pages/studio/StylesPage';
import PresetsPage from './pages/studio/PresetsPage';
import MaterialsPage from './pages/studio/MaterialsPage';
import PrintPage from './pages/studio/PrintPage';
import CodePage from './pages/studio/CodePage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* standalone pages (no header) */}
      <Route path="/canvas" element={<CanvasDesigner />} />
      {/* Studio pages */}
      <Route path="/build"     element={<BuildPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/styles"    element={<StylesPage />} />
      <Route path="/presets"   element={<PresetsPage />} />
      <Route path="/materials" element={<MaterialsPage />} />
      <Route path="/print"     element={<PrintPage />} />
      <Route path="/code"      element={<CodePage />} />
      <Route path="/admin" element={<AdminReview />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/store/create" element={<CreateAccount />} />
      <Route path="/store/access" element={<AccessAccount />} />
      <Route path="/store/dashboard" element={<MarketDashboard />} />
      <Route path="/store/settings" element={<StoreSettings />} />
      <Route path="/store/mystore" element={<MyStore />} />

      {/* legacy redirects — keep old paths working */}
      <Route path="/market/create" element={<CreateAccount />} />
      <Route path="/market/access" element={<AccessAccount />} />
      <Route path="/market/dashboard" element={<MarketDashboard />} />

      {/* main app with header */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/artifact/:id" element={<ArtifactDetail />} />
        <Route path="/shop/:username" element={<ShopProfile />} />
        <Route path="/publish" element={<PublishArtifact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App