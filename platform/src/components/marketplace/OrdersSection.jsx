import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, AlertCircle, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OrdersSection({ creatorId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'manufacturing', 'shipped'

  useEffect(() => {
    fetchOrders();
  }, [creatorId, filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      const response = await fetch(`/api/creators/${creatorId}/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'manufacturing':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'manufacturing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filters = [
    { key: 'all', label: 'all orders' },
    { key: 'pending', label: 'pending' },
    { key: 'confirmed', label: 'confirmed' },
    { key: 'manufacturing', label: 'manufacturing' },
    { key: 'shipped', label: 'shipped' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light tracking-wide lowercase text-foreground">orders</h2>
          <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
            release-bound purchase requests and fulfillment status
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs tracking-wider transition-colors ${
              filter === key
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-card rounded-[18px] border border-border/50 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-secondary rounded w-1/2" />
                    <div className="h-2 bg-secondary rounded w-1/4" />
                  </div>
                  <div className="w-20 h-6 bg-secondary rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground/40 tracking-wide">
              {filter === 'all' ? 'no orders yet' : `no ${filter} orders`}
            </p>
            <p className="text-xs text-muted-foreground/30 tracking-wide mt-1">
              orders will appear here when buyers submit purchase requests
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {order.release?.preview_url ? (
                      <img 
                        src={order.release.preview_url} 
                        alt={`Order ${order.id.substring(0, 8)}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium tracking-wide text-foreground lowercase">
                            order {order.id.substring(0, 8)}...
                          </p>
                          {getStatusIcon(order.status)}
                        </div>
                        <p className="text-xs text-muted-foreground/60 tracking-wide mt-0.5">
                          release {order.release_id.substring(0, 8)}... · {order.variant}
                          {order.size && ` · size ${order.size}`} × {order.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground/50 tracking-wide mt-1">
                          {order.customer_name} · {order.destination?.country}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`text-xs mb-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                        {order.server_total && (
                          <p className="text-sm font-light text-foreground">
                            ${order.server_total}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/50">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {order.notes && (
                      <p className="text-xs text-muted-foreground/60 mt-2 italic">
                        "{order.notes}"
                      </p>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}