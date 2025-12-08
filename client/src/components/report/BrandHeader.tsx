import { Sparkles } from 'lucide-react';

interface BrandHeaderProps {
  accountName: string;
  startDate: string;
  endDate: string;
  variant?: 'full' | 'compact';
}

/**
 * Premium branded header for BFCM Wrapped reports
 * Features 3D commerce illustrations and elegant typography
 */
export default function BrandHeader({ 
  accountName, 
  startDate, 
  endDate,
  variant = 'full' 
}: BrandHeaderProps) {
  const year = new Date(startDate).getFullYear();
  
  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-6 px-8 rounded-t-3xl border-b-2 border-cyan-500/30 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/assets/commerce/7.png" 
              alt="Wrapped Packages" 
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
                BFCM {year} Wrapped
              </h1>
              <p className="text-sm text-white/70">{accountName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60 uppercase tracking-wide">Powered by</div>
            <div className="text-lg font-bold text-shopify-green">Shopify</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white p-12 text-center relative overflow-hidden border-b-2 border-cyan-500/30">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      
      <div className="relative z-10">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <img 
            src="/assets/commerce/2.png" 
            alt="Global Commerce" 
            className="w-32 h-32 object-contain drop-shadow-2xl animate-float"
          />
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
          <img 
            src="/assets/commerce/7.png" 
            alt="Wrapped Packages" 
            className="w-28 h-28 object-contain drop-shadow-2xl animate-float-delayed"
          />
        </div>
        
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl" style={{ textShadow: '0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(6, 182, 212, 0.4)' }}>
              Your BFCM {year}
            </h1>
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="text-4xl font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(192, 132, 252, 0.5)' }}>
            Wrapped
          </div>
        </div>
        
        {/* Merchant Info */}
        <div className="space-y-2">
          <p className="text-2xl font-light text-white drop-shadow-lg">
            {accountName}
          </p>
          <p className="text-lg text-white/90 drop-shadow-md">
            {new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        {/* Powered by Shopify badge */}
        <div className="mt-8 inline-flex items-center gap-2 bg-shopify-green/20 border border-shopify-green/50 rounded-full px-6 py-2 backdrop-blur-sm">
          <div className="w-2 h-2 bg-shopify-green rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-white">Powered by Shopify</span>
        </div>
      </div>
      
      {/* Bottom accent strip */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-500 to-pink-500 animate-gradient-x"></div>
    </div>
  );
}

