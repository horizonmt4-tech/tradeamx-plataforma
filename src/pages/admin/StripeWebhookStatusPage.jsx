import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Activity, RefreshCw, AlertTriangle, CheckCircle, Server } from 'lucide-react';

const StripeWebhookStatusPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Simulating webhook logs as we don't have a specific table for it in schema yet,
  // but we can query recent deposits to see what came through.
  const [recentDeposits, setRecentDeposits] = useState([]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          id, amount, status, payment_method, stripe_session_id, created_at, updated_at,
          profiles(email)
        `)
        .order('updated_at', { ascending: false })
        .limit(15);
        
      if (error) throw error;
      setRecentDeposits(data || []);
    } catch (err) {
      toast({ title: "Error fetching status", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleManualRetry = () => {
    toast({
      title: "Diagnostic Tool",
      description: "🚧 Automated retry from Stripe dashboard is recommended. Ensure your webhook URL in Stripe is pointing to: [YOUR_PROJECT_URL]/functions/v1/stripe-webhook",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" /> Stripe Webhook Diagnostic
          </h1>
          <p className="text-gray-400 text-sm">Monitor webhook deliveries and payment synchronizations</p>
        </div>
        <Button onClick={fetchStatus} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700 md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" /> Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-300">
            <div className="p-3 bg-slate-900 rounded border border-slate-700">
              <p className="text-gray-400 mb-1">Expected Webhook Endpoint:</p>
              <code className="text-xs text-blue-400 break-all">
                https://cgfjgosmqfsoypmfqnhq.supabase.co/functions/v1/stripe-webhook
              </code>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-700">
              <p className="text-gray-400 mb-1">Required Events:</p>
              <ul className="list-disc list-inside pl-4 text-xs space-y-1">
                <li>payment_intent.succeeded</li>
                <li>payment_intent.payment_failed</li>
                <li>checkout.session.completed</li>
              </ul>
            </div>
            <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700" onClick={handleManualRetry}>
              <AlertTriangle className="w-4 h-4 mr-2" /> Force Sync Check
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recent Deposit Synchronizations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeposits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent deposits found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Time</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Stripe ID</th>
                      <th className="px-4 py-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {recentDeposits.map((dep) => (
                      <tr key={dep.id} className="bg-slate-800/30 hover:bg-slate-700/30">
                        <td className="px-4 py-3 text-gray-300">
                          {new Date(dep.updated_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {dep.profiles?.email || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          ${dep.amount}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[120px]">
                          {dep.stripe_session_id || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {dep.status === 'completed' ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs">
                              <CheckCircle className="w-3 h-3" /> Completed
                            </span>
                          ) : dep.status === 'pending' ? (
                            <span className="flex items-center gap-1 text-orange-400 text-xs">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 text-xs">
                              <AlertTriangle className="w-3 h-3" /> {dep.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StripeWebhookStatusPage;