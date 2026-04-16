import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign } from 'lucide-react';

const WithdrawalRequestDialog = ({ open, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: '',
    payment_details: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user?.isDemo) {
      toast({
        title: "Demo Account",
        description: "Withdrawal requests are not available in demo mode.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);

    // Validation
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive"
      });
      return;
    }

    if (amount > user.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have $${user.balance.toFixed(2)} available.`,
        variant: "destructive"
      });
      return;
    }

    if (!formData.payment_method) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.payment_details.trim()) {
      toast({
        title: "Payment Details Required",
        description: "Please provide your payment details.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // We use the 'trades' table to store withdrawal requests
      // Type: WITHDRAWAL_REQUEST
      // Status: PENDING
      // Symbol: Stores "Method | Details"
      // Profit/Loss: Negative amount (representing the deduction)
      
      const symbolData = `${formData.payment_method} | ${formData.payment_details}`;
      
      const { data, error } = await supabase
        .from('trades')
        .insert([
          {
            user_id: user.id,
            type: 'WITHDRAWAL_REQUEST',
            status: 'PENDING',
            symbol: symbolData,
            profit_loss: -amount, // Negative value for withdrawal
            lot_size: 0,
            open_price: 0,
            margin: 0,
            open_time: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal request of $${amount.toFixed(2)} has been submitted.`,
        className: "bg-green-600 text-white"
      });

      setFormData({ amount: '', payment_method: '', payment_details: '' });
      onClose();
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Request Withdrawal
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Submit a withdrawal request to transfer funds to your account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Available Balance:</span>
              <span className="text-white font-semibold">${user?.balance?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="bg-slate-800 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger className="bg-slate-800 border-gray-600 text-white">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-gray-700 text-white">
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Crypto">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_details">Payment Details</Label>
            <textarea
              id="payment_details"
              placeholder="Enter your account details (e.g., bank account number, PayPal email, wallet address)"
              value={formData.payment_details}
              onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
              className="w-full min-h-[100px] bg-slate-800 border border-gray-600 rounded-md p-2 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalRequestDialog;