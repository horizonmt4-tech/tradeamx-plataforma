import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Calendar, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ProgressItem = ({ label, value, max, icon: Icon, colorClass, formatFn = (v) => v, suffix = '' }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isCompleted = percentage >= 100;

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-900/50 border border-slate-700/50 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-slate-200 text-sm">{label}</h4>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-white tracking-tight">
                {formatFn(value)}{suffix}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                / {formatFn(max)}{suffix}
              </span>
            </div>
          </div>
        </div>
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="text-green-400 bg-green-400/10 p-1 rounded-full"
          >
            <CheckCircle2 className="w-5 h-5" />
          </motion.div>
        )}
      </div>
      
      <div className="relative h-2.5 bg-slate-900 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full rounded-full ${colorClass.replace('text-', 'bg-')}`}
          style={{ width: `${percentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-slate-500 font-medium">{percentage.toFixed(1)}% Completado</span>
        <span className={isCompleted ? "text-green-400 font-medium" : "text-slate-400"}>
          {isCompleted ? "¡Objetivo alcanzado!" : "En progreso"}
        </span>
      </div>
    </div>
  );
};

const ObjectivesProgress = ({ user }) => {
  // Safe defaults
  const balance = user?.balance || 0;
  const profit = user?.profit || 0;
  const days = user?.trading_days || 0;
  const drawdown = user?.drawdown || 0;

  // Configuration for targets
  const objectives = {
    profitTarget: {
      label: "Objetivo de Ganancia",
      value: profit,
      target: balance * 0.08, // 8% target
      icon: Target,
      color: "text-emerald-500",
      format: (v) => `$${v.toFixed(2)}`
    },
    tradingDays: {
      label: "Días de Trading Mínimos",
      value: days,
      target: 10,
      icon: Calendar,
      color: "text-blue-500",
      format: (v) => v,
      suffix: ' días'
    },
    maxDrawdown: {
      label: "Límite de Pérdida (Drawdown)",
      value: drawdown,
      target: balance * 0.10, // 10% max drawdown allowed
      icon: TrendingDown,
      color: "text-rose-500",
      format: (v) => `$${v.toFixed(2)}`
    },
  };
  
  return (
    <Card className="glass-effect border-gray-700 h-full bg-slate-900/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <div className="h-6 w-1 bg-indigo-500 rounded-full" />
          Progreso de la Cuenta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressItem
          {...objectives.profitTarget}
          max={objectives.profitTarget.target}
          colorClass="text-emerald-500"
          formatFn={objectives.profitTarget.format}
        />
        <ProgressItem
          {...objectives.tradingDays}
          max={objectives.tradingDays.target}
          colorClass="text-blue-500"
          formatFn={objectives.tradingDays.format}
          suffix={objectives.tradingDays.suffix}
        />
         <ProgressItem
          {...objectives.maxDrawdown}
          // For drawdown, "progress" is actually bad, but we visualize it as "amount used of allowed limit"
          max={objectives.maxDrawdown.target}
          colorClass="text-rose-500"
          formatFn={objectives.maxDrawdown.format}
        />
        
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300 leading-relaxed">
            Mantén tu drawdown por debajo del 10% y completa los días de trading mínimos para calificar para el siguiente nivel de fondeo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectivesProgress;