import { TrendingUp, Users, Target, DollarSign, Zap } from 'lucide-react';
import { DerivedMetrics, formatPercent } from '@/lib/report-data-transforms';
import { INDUSTRY_BENCHMARKS } from '@/lib/insights-generator';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { preparePerformanceRadarData } from '@/lib/chart-data-helpers';

interface PerformanceScorecardProps {
  derivedMetrics: DerivedMetrics;
  conversionRate: number;
  shopPayPct?: number;
}

export default function PerformanceScorecard({
  derivedMetrics,
  conversionRate,
  shopPayPct = 0
}: PerformanceScorecardProps) {
  const radarData = preparePerformanceRadarData(
    conversionRate,
    derivedMetrics.repeatCustomerRate,
    derivedMetrics.yoyAOVChange,
    derivedMetrics.yoyGMVChangePct,
    shopPayPct
  );
  
  // Performance dimensions with benchmarks
  const dimensions = [
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Conversion',
      value: conversionRate,
      benchmark: INDUSTRY_BENCHMARKS.averageConversionRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      color: 'cyan'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Loyalty',
      value: derivedMetrics.repeatCustomerRate,
      benchmark: INDUSTRY_BENCHMARKS.averageRepeatRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      color: 'purple'
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'AOV Growth',
      value: derivedMetrics.yoyAOVChangePct,
      benchmark: 0,
      format: (v: number) => formatPercent(v),
      color: 'pink'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'GMV Growth',
      value: derivedMetrics.yoyGMVChangePct,
      benchmark: 10,
      format: (v: number) => formatPercent(v),
      color: 'green'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Shop Pay',
      value: shopPayPct,
      benchmark: INDUSTRY_BENCHMARKS.averageShopPayAdoption,
      format: (v: number) => `${v.toFixed(1)}%`,
      color: 'blue'
    }
  ];
  
  const getStatusColor = (value: number, benchmark: number) => {
    if (value >= benchmark * 1.2) return 'text-green-400 bg-green-500/20 border-green-500/50';
    if (value >= benchmark) return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50';
    if (value >= benchmark * 0.8) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    return 'text-red-400 bg-red-500/20 border-red-500/50';
  };
  
  return (
    <div className="mb-12 bg-gradient-to-br from-slate-800/50 to-purple-900/50 rounded-3xl p-8 border-2 border-purple-500/30 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Performance Scorecard</h2>
      <p className="text-white/70 mb-8 text-center">Multi-dimensional performance analysis vs. industry benchmarks</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" />
              <PolarRadiusAxis stroke="#334155" />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Dimension Cards */}
        <div className="space-y-3">
          {dimensions.map((dim, index) => {
            const statusColor = getStatusColor(dim.value, dim.benchmark);
            const isAbove = dim.value >= dim.benchmark;
            
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border backdrop-blur-sm ${statusColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-900/50 ${statusColor.split(' ')[0]}`}>
                      {dim.icon}
                    </div>
                    <div>
                      <div className="text-sm text-white/70">{dim.label}</div>
                      <div className={`text-xl font-bold ${statusColor.split(' ')[0]}`}>
                        {dim.format(dim.value)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/60">Benchmark</div>
                    <div className="text-sm text-white/80">{dim.format(dim.benchmark)}</div>
                    {isAbove ? (
                      <div className="text-xs text-green-400 font-semibold mt-1">↑ Above</div>
                    ) : (
                      <div className="text-xs text-yellow-400 font-semibold mt-1">↓ Below</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Overall Assessment */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-cyan-500/20">
        <p className="text-white/90 text-center italic">
          {derivedMetrics.performanceScore >= 80
            ? '🎉 Outstanding performance across all dimensions!'
            : derivedMetrics.performanceScore >= 60
            ? '💪 Solid foundation with clear opportunities for optimization.'
            : '🎯 Focus on high-impact improvements to unlock growth potential.'}
        </p>
      </div>
    </div>
  );
}
