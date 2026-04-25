"use client";

import { useState } from 'react';
import { usePaystack } from '@/hooks/usePaystack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'subscription' | 'credits';
  amount: number;
  email?: string;
  planId?: string;
  planType?: string;
  creditAmount?: number;
  title?: string;
  description?: string;
}

export function PaymentModal({
  open,
  onOpenChange,
  paymentType,
  amount,
  email: initialEmail,
  planId,
  planType,
  creditAmount,
  title = 'Make Payment',
  description,
}: PaymentModalProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const { initializePayment, loading, error } = usePaystack();

  const handlePayment = async () => {
    if (!email) return;

    // This will redirect to Paystack's page on success.
    // The modal will close naturally since the page navigates away.
    await initializePayment({
      email,
      amount,
      paymentType,
      planId,
      planType,
      creditAmount,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-lg font-semibold">₦{amount.toLocaleString()}</span>
            </div>
            {paymentType === 'credits' && creditAmount && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Credits</span>
                <span className="text-sm font-medium">{creditAmount} credits</span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!email || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Paystack...
              </>
            ) : (
              `Pay ₦${amount.toLocaleString()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}