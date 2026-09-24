import { db } from '@/lib/db';
import { useLocation } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await db.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <h1 className="font-hand text-6xl text-muted-foreground/30">404</h1>
                <p className="text-sm tracking-wider text-muted-foreground lowercase">
                    this page doesn't exist yet
                </p>
                {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                    <div className="p-4 bg-card rounded-[20px] border border-border/50 text-left">
                        <p className="text-xs text-muted-foreground/60 tracking-wide">
                            admin: this page hasn't been created yet.
                        </p>
                    </div>
                )}
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="inline-flex items-center px-6 py-2.5 text-sm tracking-wider text-muted-foreground border border-border/60 rounded-full hover:text-foreground hover:border-foreground/30 transition-colors lowercase"
                >
                    go home
                </button>
            </div>
        </div>
    )
}