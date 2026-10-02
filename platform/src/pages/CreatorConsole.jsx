import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MarketplaceSidebar from "@/components/marketplace/MarketplaceSidebar";
import ReleasesOverview from "@/components/dashboard/ReleasesOverview";
import ListingManager from "@/components/artifacts/ListingManager";
import OrdersSection from "@/components/marketplace/OrdersSection";
import StorefrontAppearance from "@/components/storefront/StorefrontAppearance";

export default function CreatorConsole() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [creatorAccount, setCreatorAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreatorAccount();
  }, []);

  const fetchCreatorAccount = async () => {
    try {
      // Get current authenticated creator
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.user?.creator_account) {
          setCreatorAccount(userData.user.creator_account);
        } else {
          // Redirect to creator onboarding if no creator account
          navigate('/creator/setup');
        }
      } else {
        // Redirect to auth if not authenticated
        navigate('/auth?redirect=/console');
      }
    } catch (error) {
      console.error('Failed to fetch creator account:', error);
      navigate('/auth?redirect=/console');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const renderContent = () => {
    if (!creatorAccount) return null;

    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                welcome back, {creatorAccount.display_name || creatorAccount.handle}
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                creator console · manage releases, listings, and orders
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ReleasesOverview creatorId={creatorAccount.id} />
              
              <div className="bg-card rounded-[18px] border border-border/50 p-6">
                <h3 className="text-base font-light tracking-wide lowercase text-foreground mb-4">
                  quick stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">active listings</span>
                    <span className="text-lg font-light text-foreground">
                      {creatorAccount.stats?.active_listings || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">pending orders</span>
                    <span className="text-lg font-light text-foreground">
                      {creatorAccount.stats?.pending_orders || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">total revenue</span>
                    <span className="text-lg font-light text-foreground">
                      ${creatorAccount.stats?.total_revenue || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "releases":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                design releases
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                validated designs from studio ready for listing
              </p>
            </div>
            <ReleasesOverview creatorId={creatorAccount.id} />
          </div>
        );
      
      case "listings":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                marketplace listings
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                manage your published offerings
              </p>
            </div>
            <ListingManager creatorId={creatorAccount.id} />
          </div>
        );
      
      case "orders":
        return (
          <div>
            <OrdersSection creatorId={creatorAccount.id} />
          </div>
        );

      case "commissions":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                commissions
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                custom work requests and terms
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-700/80">
                commissions remain muted until authenticated request, terms, payment protection and disputes are implemented
              </p>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                analytics
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                traffic, engagement, and sales insights
              </p>
            </div>
            <div className="bg-card rounded-[18px] border border-border/50 p-6">
              <p className="text-sm text-muted-foreground">analytics dashboard coming soon</p>
            </div>
          </div>
        );

      case "finance":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                finance
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                earnings, payouts, and financial overview
              </p>
            </div>
            <div className="bg-card rounded-[18px] border border-border/50 p-6">
              <p className="text-sm text-muted-foreground">financial dashboard coming soon</p>
            </div>
          </div>
        );

      case "creator-page":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                public creator page
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                your public profile and marketplace presence
              </p>
            </div>
            <StorefrontAppearance 
              creatorAccount={creatorAccount}
              onSaved={() => fetchCreatorAccount()}
            />
          </div>
        );

      case "storefront":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                white-label storefront
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                your branded storefront settings
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-700/80">
                white-label storefronts are part of creator services (unscheduled)
              </p>
            </div>
          </div>
        );

      case "settings":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                account settings
              </h1>
              <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                profile, preferences, and account management
              </p>
            </div>
            <div className="bg-card rounded-[18px] border border-border/50 p-6">
              <p className="text-sm text-muted-foreground">settings panel coming soon</p>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <p className="text-sm text-muted-foreground">section not found</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">loading creator console...</p>
        </div>
      </div>
    );
  }

  if (!creatorAccount) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background flex">
      <MarketplaceSidebar
        account={creatorAccount}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}