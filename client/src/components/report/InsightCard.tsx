import { LucideIcon } from 'lucide-react';

export interface InsightCardProps {
  title: string;
  insight: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

const variantStyles = {
  default: {
    container: 'bg-gray-50 border-gray-200',
    icon: 'text-gray-600 bg-gray-100',
    title: 'text-gray-900',
    text: 'text-gray-700'
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-700 bg-green-100',
    title: 'text-green-900',
    text: 'text-green-800'
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-700 bg-amber-100',
    title: 'text-amber-900',
    text: 'text-amber-800'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-700 bg-blue-100',
    title: 'text-blue-900',
    text: 'text-blue-800'
  }
};

export default function InsightCard({ 
  title, 
  insight, 
  icon: Icon, 
  variant = 'default' 
}: InsightCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <div className={`p-6 rounded-xl border-2 ${styles.container} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${styles.icon} flex-shrink-0`}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm uppercase tracking-wider mb-2 ${styles.title}`}>
            {title}
          </h3>
          <p className={`text-base leading-relaxed ${styles.text}`}>
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}

