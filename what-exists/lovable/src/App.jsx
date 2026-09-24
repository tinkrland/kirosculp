// app entry. wraps everything in providers and declares the route map.
//
// route layout decisions:
//   - "/auth" stands alone with no header chrome (sign-in surface)
//   - "/admin" and the "/store/*" pages also stand alone because they
//     are dedicated workspaces with their own sidebars
//   - everything else lives under AppLayout which renders the sticky
//     header + cart drawer

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ArtifactDetail from './pages/ArtifactDetail';
import ShopProfile from './pages/ShopProfile';
import ShopArtifactBySlug from './pages/ShopArtifactBySlug';
import CollectionPage from './pages/CollectionPage';
import PublishArtifact from './pages/PublishArtifact';
import Onboarding from './pages/Onboarding';
import CreateAccount from './pages/market/CreateAccount';
import AccessAccount from './pages/market/AccessAccount';
import MarketDashboard from './pages/market/MarketDashboard';
import StoreSettings from './pages/market/StoreSettings';
import MyStore from './pages/market/MyStore';
import FAQ from './pages/FAQ';
import SizeGuide from './pages/SizeGuide';
import CreatorDocs from './pages/CreatorDocs';
import About from './pages/About';
import AdminReview from './pages/AdminReview';
import AdminOverview from './pages/admin/AdminOverview';
import AdminManufacturers from './pages/admin/AdminManufacturers';
import AdminRouting from './pages/admin/AdminRouting';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDocs from './pages/admin/AdminDocs';
import AdminIdea from './pages/admin/AdminIdea';
import Compare from './pages/Compare';
import Roadmap from './pages/Roadmap';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import CommissionPage from './pages/CommissionPage';
import DemoApp from './pages/DemoApp';
import BuyerDashboard from './pages/BuyerDashboard';
import DemoBuyer from './pages/DemoBuyer';
import SharedList from './pages/SharedList';
import Studiogram from './pages/Studiogram';
import StudiogramGuide from './features/studiogram/StudiogramGuide';
import ProductStudio from './pages/ProductStudio';

const RoutedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* sign-in surface */}
      <Route path="/auth" element={<Auth />} />

      {/* standalone pages (no header) */}
      <Route path="/admin" element={<AdminOverview />} />
      <Route path="/admin/review" element={<AdminReview />} />
      <Route path="/admin/manufacturers" element={<AdminManufacturers />} />
      <Route path="/admin/routing" element={<AdminRouting />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/docs" element={<AdminDocs />} />
      <Route path="/admin/idea" element={<AdminIdea />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/store/create" element={<CreateAccount />} />
      <Route path="/store/access" element={<AccessAccount />} />
      <Route path="/store/dashboard" element={<MarketDashboard />} />
      <Route path="/store/settings" element={<StoreSettings />} />
      <Route path="/store/mystore" element={<MyStore />} />

      {/* legacy redirects keep older bookmarks working */}
      <Route path="/market/create" element={<CreateAccount />} />
      <Route path="/market/access" element={<AccessAccount />} />
      <Route path="/market/dashboard" element={<MarketDashboard />} />

      {/* no-login creator demo sandbox (localStorage-backed) */}
      <Route path="/demo/app" element={<DemoApp />} />
      <Route path="/demo/buyer" element={<DemoBuyer />} />

      {/* main app shell */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/artifact/:id" element={<ArtifactDetail />} />
        <Route path="/shop/:username" element={<ShopProfile />} />
        {/* slug-aware routes - fixed prefixes first so 'c' / 'commission' don't get matched as slugs */}
        <Route path="/shop/:username/commission" element={<CommissionPage />} />
        <Route path="/shop/:username/c/:collectionSlug" element={<CollectionPage />} />
        <Route path="/shop/:username/:slug" element={<ShopArtifactBySlug />} />
        <Route path="/publish" element={<PublishArtifact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/creator-docs" element={<CreatorDocs />} />
        <Route path="/studiogram" element={<Studiogram />} />
        <Route path="/studiogram/:pageName" element={<StudiogramGuide />} />
        <Route path="/productstudio" element={<ProductStudio />} />
        <Route path="/projectstudio" element={<ProductStudio />} />
        <Route path="/about" element={<About />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
        <Route path="/list/:token" element={<SharedList />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <RoutedApp />
          </Router>
          <Toaster />
          <Sonner />
        </QueryClientProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
