import { AlertTriangle, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { Recommendation } from '@/lib/insights-generator';

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

export default function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-500 to-orange-500';
      case 'medium':
        return 'from-cyan-500 to-blue-500';
      case 'low':
        return 'from-slate-500 to-slate-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'growth':
        return <TrendingUp className="w-5 h-5" />;
      case 'optimization':
        return <Zap className="w-5 h-5" />;
      case 'risk':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return priority;
    }
  };
  
  if (recommendations.length === 0) {
    return (
      <div className="mb-12 p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl border-2 border-green-500/30 backdrop-blur-sm text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Excellent Performance!</h2>
        <p className="text-white/80">You're operating at peak efficiency. Continue monitoring these metrics and maintain your current strategies.</p>
      </div>
    );
  }
  
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Strategic Recommendations
        </h2>
        <p className="text-white/70">Actionable insights to drive growth and optimize performance</p>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border-2 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Icon & Priority Badge */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPriorityColor(rec.priority)} flex items-center justify-center text-white shadow-lg`}>
                  {getCategoryIcon(rec.category)}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{rec.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getPriorityColor(rec.priority)}`}>
                    {getPriorityLabel(rec.priority)}
                  </span>
                  {rec.shopifyProduct && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-shopify-green text-white">
                      {rec.shopifyProduct}
                    </span>
                  )}
                </div>
                
                <p className="text-white/80 leading-relaxed mb-3">
                  {rec.description}
                </p>
                
                <div className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">Potential Impact:</span>
                  <span className="text-sm text-cyan-300">{rec.potentialImpact}</span>
                </div>
              </div>
              
              {/* Index Number */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-white/70 text-sm font-bold">
                  {index + 1}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Next Steps CTA */}
      <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Ready to Take Action?</h3>
            <p className="text-white/70 text-sm">
              Schedule a strategy session with your CSM to prioritize these recommendations and create a 90-day action plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
