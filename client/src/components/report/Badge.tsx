import { Badge as BadgeType } from '@/lib/badges';

interface BadgeProps {
  badge: BadgeType;
}

export default function Badge({ badge }: BadgeProps) {
  if (!badge.unlocked) return null;

  return (
    <div className={`bg-gradient-to-br ${badge.gradient} rounded-2xl p-6 text-white shadow-lg transform transition-all hover:scale-105 border border-white/20 backdrop-blur-sm`}>
      <div className="text-5xl mb-3 drop-shadow-lg">{badge.emoji}</div>
      <div className="text-xl font-bold mb-2">{badge.title}</div>
      <div className="text-sm opacity-90">{badge.description}</div>
    </div>
  );
}

