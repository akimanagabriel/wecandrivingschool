/* eslint-disable import/order */
import { Head, router } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Calendar, CreditCard, Hash, Sparkles } from 'lucide-react';
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
    const isSuccess = payment.status === 'completed' || payment.status === 'pending';

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
                      value: new Date(payment.expires_at).toLocaleDateString('en-RW', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                      }),
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
                <div className="flex flex-col items-center text-center pt-2 pb-1">
                    <div className="relative mb-5">
                        {/* Outer glow ring */}
                        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md scale-125" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                            <CheckCircle className="h-10 w-10 text-white drop-shadow" strokeWidth={2.5} />
                        </div>
                        {/* Sparkle accents */}
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-emerald-400 animate-pulse" />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">You&apos;re all set!</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                        {payment.status === 'pending'
                            ? 'Your payment is being confirmed. Access will activate shortly.'
                            : 'Your WeCanDrivingSchool access is now active and ready to use.'}
                    </p>

                    {/* Status pill */}
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 capitalize">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                        {payment.status === 'pending' ? 'Confirming payment…' : 'Access active'}
                    </div>
                </div>

                {/* Receipt card */}
                <div className="rounded-2xl border border-border/60 bg-muted/30 overflow-hidden">
                    <div className="px-5 py-3 border-b border-border/60 bg-muted/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Payment Receipt
                        </p>
                    </div>
                    <div className="divide-y divide-border/50">
                        {details.map((d) => (
                            <div
                                key={d.label}
                                className="flex items-center justify-between px-5 py-3 gap-4"
                            >
                                <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                                    <d.icon className="h-3.5 w-3.5" />
                                    {d.label}
                                </div>
                                <span
                                    className={[
                                        'text-sm text-right',
                                        d.highlight ? 'font-bold text-foreground' : 'font-medium',
                                        d.capitalize ? 'capitalize' : '',
                                        d.mono ? 'font-mono text-xs text-muted-foreground truncate max-w-[140px]' : '',
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
                    className="w-full h-12 text-base font-semibold gap-2 shadow-sm"
                    onClick={() => router.visit('/student/dashboard')}
                >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                    Questions? Contact support or check your payment history on the Pay page.
                </p>
            </div>
        </AuthLayout>
    );
}
