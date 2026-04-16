import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, DollarSign, Plus, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const WithdrawalsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  const fetchWithdrawals = useCallback(async () => {
    if (!user || user.isDemo) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Buscar en la tabla withdrawals
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWithdrawals(data || []);

      // Calcular total retirado (solo aprobados)
      const total = data
        ?.filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + parseFloat(w.amount), 0) || 0;

      setTotalWithdrawn(total);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawals.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchWithdrawals();

    if (user && !user.isDemo) {
      // Suscribirse a cambios en tiempo real
      const channel = supabase
        .channel(`user-withdrawals:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawals',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchWithdrawals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchWithdrawals]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'PENDING',
        style: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      },
      approved: {
        label: 'APPROVED',
        style: 'bg-green-500/20 text-green-300 border-green-500/30'
      },
      rejected: {
        label: 'REJECTED',
        style: 'bg-red-500/20 text-red-300 border-red-500/30'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.style}`}>
        {config.label}
      </span>
    );
  };

  if (user?.isDemo) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')} className="border-gray-600">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Withdrawals</h1>
              <p className="text-gray-400 mt-1">Demo Mode - Feature Not Available</p>
            </div>
          </div>
          <Card className="glass-effect border-gray-700">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400">Withdrawal functionality is not available in demo mode.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')} className="border-gray-600">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Withdrawal History</h1>
                <p className="text-gray-400 mt-1">Track and manage your withdrawal requests</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={fetchWithdrawals}
                className="border-gray-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/withdraw')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Withdrawal
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="glass-effect border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Withdrawn</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">
                      ${totalWithdrawn.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Requests</p>
                    <p className="text-3xl font-bold text-yellow-400 mt-1">
                      {withdrawals.filter(w => w.status === 'pending').length}
                    </p>
                  </div>
                  <Loader2 className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect border-gray-700">
            <CardHeader>
              <CardTitle>All Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-800/50 border-b-gray-700">
                      <TableHead className="text-white">Amount</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Payment Method</TableHead>
                      <TableHead className="text-white">Account Details</TableHead>
                      <TableHead className="text-white">Requested</TableHead>
                      <TableHead className="text-white">Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-500" />
                        </TableCell>
                      </TableRow>
                    ) : withdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          No withdrawal requests yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      withdrawals.map((withdrawal) => {
                        const details = withdrawal.payment_details || {};
                        return (
                          <TableRow key={withdrawal.id} className="border-gray-800 hover:bg-slate-800/50">
                            <TableCell className="text-white font-mono font-semibold">
                              ${parseFloat(withdrawal.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                            <TableCell className="text-gray-300">{withdrawal.payment_method || '-'}</TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {details.accountHolder && (
                                <div className="space-y-1">
                                  <div>{details.accountHolder}</div>
                                  <div className="text-xs">****{details.accountNumber?.slice(-4)}</div>
                                </div>
                              )}
                              {!details.accountHolder && '-'}
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {withdrawal.created_at
                                ? formatDistanceToNow(new Date(withdrawal.created_at), { addSuffix: true })
                                : '-'}
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {withdrawal.processed_at
                                ? formatDistanceToNow(new Date(withdrawal.processed_at), { addSuffix: true })
                                : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WithdrawalsPage;