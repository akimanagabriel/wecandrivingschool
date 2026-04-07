/* eslint-disable import/order */
import { CheckCircle, CreditCard, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { PaymentRecord, WeCanPageProps } from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student/dashboard' },
    { title: 'Access / Pay', href: '/student/payment' },
];

type PaymentMethod = 'mtn_momo' | 'airtel_money';

type Props = WeCanPageProps<{
    hasAccess: boolean;
    payments: PaymentRecord[];
}>;

export default function Payment({ hasAccess, payments }: Props) {
    const [method, setMethod] = useState<PaymentMethod>('mtn_momo');

    const { data, setData, post, processing, errors, reset } = useForm({
        phone: '',
        payment_method: 'mtn_momo',
    });

    const handleMomoSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setData('payment_method', method);

        post('/student/payment/momo', {
            onSuccess: () => {
                reset('phone');
            },
        });
    };

    const methods = [
        {
            id: 'mtn_momo' as PaymentMethod,
            label: 'MTN Mobile Money',
            emoji: '📱',
        },
        {
            id: 'airtel_money' as PaymentMethod,
            label: 'Airtel Money',
            emoji: '📱',
        },
    ];

    const statusColor: Record<string, string> = {
        completed: 'default',
        pending: 'secondary',
        refunded: 'outline',
        failed: 'destructive',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Get Access" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Get Access"
                    description="Unlock unlimited quizzes for 30 days."
                />

                {hasAccess && (
                    <Alert>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertDescription>
                            You have active access, you can take quizzes freely.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Pricing card */}
                <Card className="overflow-hidden py-0">
                    <div className="bg-primary p-6 text-primary-foreground">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Full Access
                                </h2>
                                <p className="mt-1 text-sm opacity-80">
                                    Unlimited quizzes for 30 days
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-extrabold">5,000</p>
                                <p className="text-sm opacity-80">
                                    RWF / month
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-1.5 text-sm">
                            {[
                                'Unlimited quiz attempts',
                                '400+ question bank',
                                'Instant results & explanations',
                                'Progress tracking',
                            ].map((f) => (
                                <div
                                    key={f}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4 opacity-70" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Payment form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="h-4 w-4" />
                            Choose Payment Method
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* Method selector */}
                        <div className="grid grid-cols-2 gap-3">
                            {methods.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                        setMethod(m.id);
                                        setData('payment_method', m.id);
                                    }}
                                    className={cn(
                                        'flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition',
                                        method === m.id
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-border text-muted-foreground hover:border-primary/30',
                                    )}
                                >
                                    <span className="text-2xl">{m.emoji}</span>
                                    <span>{m.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* MoMo form */}
                        <form onSubmit={handleMomoSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">
                                    <Smartphone className="mr-1 inline h-3.5 w-3.5" />
                                    Phone Number
                                </Label>

                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder={
                                        method === 'mtn_momo'
                                            ? '078xxxxxxx'
                                            : '073xxxxxxx'
                                    }
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                />

                                {/* ✅ FIXED ERROR DISPLAY */}
                                {errors.phone && (
                                    <div className="space-y-1 text-sm text-red-500">
                                        {Array.isArray(errors.phone) ? (
                                            errors.phone.map((err, i) => (
                                                <p key={i}>{err}</p>
                                            ))
                                        ) : (
                                            <p>{errors.phone}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                                A push notification will be sent to{' '}
                                <strong>{data.phone || 'your phone'}</strong> to
                                confirm payment of <strong>5,000 RWF</strong>.
                            </p>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2" />}
                                Pay 5,000 RWF via{' '}
                                {method === 'mtn_momo'
                                    ? 'MTN MoMo'
                                    : 'Airtel Money'}
                            </Button>
                        </form>

                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <Shield className="h-3.5 w-3.5" />
                            Payments are secure and encrypted
                        </div>
                    </CardContent>
                </Card>

                {/* Payment history */}
                {payments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Payment History
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="divide-y">
                                {payments.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between px-6 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {Number(
                                                    p.amount,
                                                ).toLocaleString()}{' '}
                                                {p.currency}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {p.payment_method.replace(
                                                    '_',
                                                    ' ',
                                                )}{' '}
                                                ·{' '}
                                                {p.paid_at
                                                    ? new Date(
                                                          p.paid_at,
                                                      ).toLocaleDateString()
                                                    : 'Pending'}
                                            </p>
                                        </div>

                                        <Badge
                                            variant={
                                                (statusColor[
                                                    p.status
                                                ] as never) ?? 'outline'
                                            }
                                        >
                                            {p.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
