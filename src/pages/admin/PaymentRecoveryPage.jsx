import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Search, DollarSign, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const PaymentRecoveryPage = () => {
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [failedDeposits, setFailedDeposits] = useState([]);
  
  // Form state
  const [recoveryForm, setRecoveryForm] = useState({
    email: '',
    amount: '',
    stripe_transaction_id: '',
    reason: ''
  });
  const [recovering, setRecovering] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchEmail) return;

    setLoading(true);
    setUserData(null);
    setAuditHistory([]);
    setFailedDeposits([]);

    try {
      // Get user
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, email, balance, full_name')
        .eq('email', searchEmail)
        .single();

      if (userError || !user) throw new Error('User not found');
      setUserData(user);
      setRecoveryForm(prev => ({ ...prev, email: user.email }));

      // Get audit history
      const { data: audits } = await supabase
        .from('balance_audit')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (audits) setAuditHistory(audits);

      // Get failed deposits
      const { data: deposits } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'completed')
        .order('created_at', { ascending: false });
        
      if (deposits) setFailedDeposits(deposits);

    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!recoveryForm.email || !recoveryForm.amount || !recoveryForm.stripe_transaction_id) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setRecovering(true);
    try {
      const { data, error } = await supabase.functions.invoke('recover-failed-payment', {
        body: recoveryForm
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Recovery Successful",
        description: `Credited $${data.credited_amount} to ${recoveryForm.email}. New balance: $${data.new_balance}`,
        className: "bg-green-600 text-white"
      });

      // Reset form & refresh
      setRecoveryForm({ email: userData?.email || '', amount: '', stripe_transaction_id: '', reason: '' });
      handleSearch();

    } catch (err) {
      console.error(err);
      toast({ title: "Recovery Failed", description: err.message, variant: "destructive" });
    } finally {
      setRecovering(false);
    }
  };

  const selectFailedDeposit = (dep) => {
    setRecoveryForm(prev => ({
      ...prev,
      amount: dep.amount.toString(),
      stripe_transaction_id: dep.stripe_session_id || `manual_${Date.now()}`,
      reason: `Recovering failed deposit ${dep.id}`
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-400" /> Payment Recovery
          </h1>
          <p className="text-gray-400 text-sm">Manually credit failed Stripe transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Search Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Search User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input 
                  placeholder="User email..." 
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </form>

              {userData && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2">
                  <div className="text-sm text-gray-400">Found User</div>
                  <div className="font-medium text-white">{userData.email}</div>
                  <div className="text-sm text-gray-300">{userData.full_name || 'No Name'}</div>
                  <div className="text-lg font-bold text-green-400 mt-2">Balance: ${Number(userData.balance || 0).toFixed(2)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recovery Form */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Manual Credit</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecover} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Email</Label>
                  <Input 
                    value={recoveryForm.email}
                    onChange={(e) => setRecoveryForm({...recoveryForm, email: e.target.value})}
                    placeholder="user@example.com"
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Amount (USD)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={recoveryForm.amount}
                    onChange={(e) => setRecoveryForm({...recoveryForm, amount: e.target.value})}
                    placeholder="10.00"
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Stripe Transaction ID</Label>
                  <Input 
                    value={recoveryForm.stripe_transaction_id}
                    onChange={(e) => setRecoveryForm({...recoveryForm, stripe_transaction_id: e.target.value})}
                    placeholder="pi_3O..."
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Reason / Notes</Label>
                  <Input 
                    value={recoveryForm.reason}
                    onChange={(e) => setRecoveryForm({...recoveryForm, reason: e.target.value})}
                    placeholder="User paid but webhook failed..."
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={recovering || !recoveryForm.email} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {recovering ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Process Recovery
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Failed Deposits */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" /> 
                Pending / Failed Deposits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!userData ? (
                <div className="text-center py-8 text-gray-500">Search for a user first.</div>
              ) : failedDeposits.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No failed deposits found for this user.</div>
              ) : (
                <div className="space-y-3">
                  {failedDeposits.map(dep => (
                    <div key={dep.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div>
                        <div className="text-white font-medium">${dep.amount} USD</div>
                        <div className="text-xs text-gray-400">{new Date(dep.created_at).toLocaleString()}</div>
                        <div className="text-xs text-orange-400 mt-1">Status: {dep.status}</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => selectFailedDeposit(dep)}>
                        Select for Recovery
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit History */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent Balance Audit</CardTitle>
            </CardHeader>
            <CardContent>
              {!userData ? (
                <div className="text-center py-8 text-gray-500">Search for a user first.</div>
              ) : auditHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No audit history found.</div>
              ) : (
                <div className="space-y-3">
                  {auditHistory.map(audit => (
                    <div key={audit.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-semibold ${audit.action.includes('RECOVERY') ? 'text-green-400' : 'text-blue-400'}`}>
                          {audit.action}
                        </span>
                        <span className="text-gray-400">{new Date(audit.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-gray-300">Amount: <span className={audit.amount > 0 ? "text-green-400" : "text-red-400"}>{audit.amount > 0 ? '+' : ''}{audit.amount}</span></div>
                      <div className="text-gray-500 text-xs mt-1">{audit.notes || 'No notes'}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentRecoveryPage;