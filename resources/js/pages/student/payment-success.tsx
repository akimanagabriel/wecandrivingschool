/* eslint-disable import/order */
import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle,
    Calendar,
    CreditCard,
    Hash,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import type { WeCanPageProps } from '@/types/wecan';

type Props = WeCanPageProps<{
    payment: {
        amount: number;
        currency: string;
        payment_method: string;
        status: string;
        expires_at: string | null;
        transaction_id?: string | null;
    };
}>;

export default function PaymentSuccess({ payment }: Props) {
    const isSuccess =
        payment.status === 'completed' || payment.status === 'pending';

    const details = [
        {
            icon: CreditCard,
            label: 'Amount Paid',
            value: `${Number(payment.amount).toLocaleString()} ${payment.currency}`,
            highlight: true,
        },
        {
            icon: CreditCard,
            label: 'Payment Method',
            value: payment.payment_method?.replace(/_/g, ' '),
            capitalize: true,
        },
        ...(payment.transaction_id
            ? [
                  {
                      icon: Hash,
                      label: 'Transaction ID',
                      value: payment.transaction_id,
                      mono: true,
                  },
              ]
            : []),
        ...(payment.expires_at
            ? [
                  {
                      icon: Calendar,
                      label: 'Access Until',
                      value: new Date(payment.expires_at).toLocaleDateString(
                          'en-RW',
                          {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                          },
                      ),
                  },
              ]
            : []),
    ];

    return (
        <AuthLayout
            title="Payment Successful!"
            description="Your access is now active. You're ready to start practising."
        >
            <Head title="Payment Successful" />

            <div className="flex flex-col gap-5">
                {/* Success icon + heading */}
                <div className="flex flex-col items-center pt-2 pb-1 text-center">
                    <div className="relative mb-5">
                        {/* Outer glow ring */}
                        <div className="absolute inset-0 scale-125 rounded-full bg-emerald-400/20 blur-md" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                            <CheckCircle
                                className="h-10 w-10 text-white drop-shadow"
                                strokeWidth={2.5}
                            />
                        </div>
                        {/* Sparkle accents */}
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 animate-pulse text-emerald-400" />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">
                        You&apos;re all set!
                    </h2>
                    <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                        {payment.status === 'pending'
                            ? 'Your payment is being confirmed. Access will activate shortly.'
                            : 'Your WeCanDrivingSchool access is now active and ready to use.'}
                    </p>

                    {/* Status pill */}
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 capitalize dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {payment.status === 'pending'
                            ? 'Confirming payment…'
                            : 'Access active'}
                    </div>
                </div>

                {/* Receipt card */}
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                    <div className="border-b border-border/60 bg-muted/50 px-5 py-3">
                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Payment Receipt
                        </p>
                    </div>
                    <div className="divide-y divide-border/50">
                        {details.map((d) => (
                            <div
                                key={d.label}
                                className="flex items-center justify-between gap-4 px-5 py-3"
                            >
                                <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                                    <d.icon className="h-3.5 w-3.5" />
                                    {d.label}
                                </div>
                                <span
                                    className={[
                                        'text-right text-sm',
                                        d.highlight
                                            ? 'font-bold text-foreground'
                                            : 'font-medium',
                                        d.capitalize ? 'capitalize' : '',
                                        d.mono
                                            ? 'max-w-[140px] truncate font-mono text-xs text-muted-foreground'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    {d.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <Button
                    className="h-12 w-full gap-2 text-base font-semibold shadow-sm"
                    onClick={() => router.visit('/student/dashboard')}
                >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                    Questions? Contact support or check your payment history on
                    the Pay page.
                </p>
            </div>
        </AuthLayout>
    );
}
