import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Loader2 } from 'lucide-react';
    import { motion } from 'framer-motion';

    const StatCard = ({ icon: Icon, title, value, loading, iconColor }) => {
      return (
        <motion.div whileHover={{ scale: 1.05 }} className="h-full">
          <Card className="bg-slate-800/60 border-gray-700/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <Icon className={`h-4 w-4 ${iconColor || 'text-gray-400'}`} />
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="h-8 bg-slate-700 rounded w-2/3 animate-pulse"></div>
              ) : (
                <div className="text-2xl font-bold text-white">{value}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default StatCard;