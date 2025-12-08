import { TrendingUp, Award, AlertCircle, Target } from 'lucide-react';
import { DerivedMetrics, formatCurrency, formatPercent } from '@/lib/report-data-transforms';
import AnimatedMetric from './AnimatedMetric';

interface ExecutiveSummaryProps {
  accountName: string;
  totalGMV: number;
  totalOrders: number;
  derivedMetrics: DerivedMetrics;
  keyTakeaways: string[];
}

export default function ExecutiveSummary({
  accountName,
  totalGMV,
  totalOrders,
  derivedMetrics,
  keyTakeaways
}: ExecutiveSummaryProps) {
  const gradeColors = {
    'A': 'from-green-500 to-emerald-500',
    'B': 'from-cyan-500 to-blue-500',
    'C': 'from-yellow-500 to-amber-500',
    'D': 'from-orange-500 to-red-500',
    'F': 'from-red-500 to-pink-500'
  };
  
  const gradeColor = gradeColors[derivedMetrics.performanceGrade];
  
  return (
    <div className="mb-12 bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-3xl p-8 border-2 border-cyan-500/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Executive Summary</h2>
          <p className="text-white/70">BFCM 2025 Performance Overview for {accountName}</p>
        </div>
        
        {/* Performance Grade Badge */}
        <div className="relative">
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradeColor} flex items-center justify-center shadow-lg`}>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{derivedMetrics.performanceGrade}</div>
              <div className="text-xs text-white/90 font-semibold">Grade</div>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full px-3 py-1 border border-cyan-500/30">
            <span className="text-xs font-bold text-cyan-400">{derivedMetrics.performanceScore}/100</span>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-4 border border-pink-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <div className="text-xs text-white/70 uppercase">Total GMV</div>
          </div>
          <div className="text-2xl font-bold text-pink-400">
            <AnimatedMetric
              value={totalGMV}
              formatFn={formatCurrency}
              duration={2000}
            />
          </div>
          {derivedMetrics.yoyGMVChangePct !== 0 && (
            <div className={`text-sm font-semibold mt-1 ${derivedMetrics.yoyGMVChangePct >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
              {formatPercent(derivedMetrics.yoyGMVChangePct)} YoY
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <div className="text-xs text-white/70 uppercase">Total Orders</div>
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            <AnimatedMetric
              value={totalOrders}
              formatFn={(v) => v.toFixed(0).toLocaleString()}
              duration={2000}
            />
          </div>
          {derivedMetrics.yoyOrdersChangePct !== 0 && (
            <div className={`text-sm font-semibold mt-1 ${derivedMetrics.yoyOrdersChangePct >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
              {formatPercent(derivedMetrics.yoyOrdersChangePct)} YoY
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <div className="text-xs text-white/70 uppercase">Growth Status</div>
          </div>
          <div className="text-2xl font-bold text-purple-400 capitalize">
            {derivedMetrics.growthRate}
          </div>
          <div className="text-sm text-white/70 mt-1">
            Performance tier
          </div>
        </div>
      </div>
      
      {/* Key Takeaways */}
      <div className="bg-slate-900/50 rounded-xl p-6 border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Key Takeaways</h3>
        </div>
        <ul className="space-y-3">
          {keyTakeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <p className="text-white/90 leading-relaxed flex-1">{takeaway}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
