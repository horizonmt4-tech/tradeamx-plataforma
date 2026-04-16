import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Loader2, PieChart, TrendingUp, Layers, Shield, DollarSign } from 'lucide-react';
    import { motion } from 'framer-motion';

    const StatItem = ({ icon: Icon, label, value, colorClass, loading }) => (
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-400">
                <Icon className={`w-4 h-4 mr-2 ${colorClass}`} />
                <span>{label}</span>
            </div>
            {loading ? (
                <div className="h-4 bg-slate-700 rounded w-20 animate-pulse"></div>
            ) : (
                <span className="font-mono font-semibold text-white">{value}</span>
            )}
        </div>
    );

    const CabinetTab = ({ user, loading, equity, floatingPL, freeMargin, marginUsed }) => {
        const stats = [
            { icon: PieChart, label: 'Balance', value: `$${user?.balance?.toFixed(2) || '0.00'}`, color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Flotante P/L', value: `$${floatingPL?.toFixed(2) || '0.00'}`, color: floatingPL >= 0 ? 'text-green-400' : 'text-red-400' },
            { icon: Layers, label: 'Capital', value: `$${equity?.toFixed(2) || '0.00'}`, color: 'text-purple-400' },
            { icon: Shield, label: 'Margen Libre', value: `$${freeMargin?.toFixed(2) || '0.00'}`, color: 'text-yellow-400' },
            { icon: DollarSign, label: 'Bono', value: `$${user?.bonus?.toFixed(2) || '0.00'}`, color: 'text-pink-400' },
        ];

        return (
            <Card className="glass-effect border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Resumen de Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                        </div>
                    ) : (
                        <motion.div 
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                           {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <StatItem icon={stat.icon} label={stat.label} value={stat.value} colorClass={stat.color} loading={loading} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        );
    };

    export default CabinetTab;