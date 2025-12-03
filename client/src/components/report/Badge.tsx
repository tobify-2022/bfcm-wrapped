import { Badge as BadgeType } from '@/lib/badges';

interface BadgeProps {
  badge: BadgeType;
}

export default function Badge({ badge }: BadgeProps) {
  if (!badge.unlocked) return null;

  // Premium tier styling
  const getTierBorder = () => {
    switch (badge.tier) {
      case 'platinum':
        return 'border-2 border-yellow-300/50 shadow-2xl shadow-yellow-500/30 ring-2 ring-yellow-400/20';
      case 'gold':
        return 'border-2 border-amber-400/50 shadow-xl shadow-amber-500/20 ring-1 ring-amber-300/20';
      case 'silver':
        return 'border-2 border-gray-300/50 shadow-lg shadow-gray-400/20';
      default:
        return 'border border-white/20';
    }
  };

  const getTierLabel = () => {
    if (!badge.tier) return null;
    const tierColors = {
      platinum: 'bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 text-yellow-900',
      gold: 'bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 text-amber-900',
      silver: 'bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 text-gray-900',
      bronze: 'bg-gradient-to-r from-orange-300 via-orange-500 to-orange-300 text-orange-900',
    };
    return (
      <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${tierColors[badge.tier]} shadow-lg`}>
        {badge.tier}
      </div>
    );
  };

  return (
    <div className={`relative bg-gradient-to-br ${badge.gradient} rounded-2xl p-6 text-white shadow-lg transform transition-all hover:scale-105 ${getTierBorder()} backdrop-blur-sm overflow-hidden`}>
      {/* Premium tier shimmer effect */}
      {badge.tier === 'platinum' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite'
        }} />
      )}
      
      {getTierLabel()}
      
      <div className="relative z-10">
        <div className="text-5xl mb-3 drop-shadow-lg">{badge.emoji}</div>
        <div className="text-xl font-bold mb-2 drop-shadow-md">{badge.title}</div>
        <div className="text-sm opacity-90">{badge.description}</div>
      </div>
    </div>
  );
}

