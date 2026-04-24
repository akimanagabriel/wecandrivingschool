/* eslint-disable import/order */
import {
    CheckCircle,
    CreditCard,
    Shield,
    Smartphone,
    AlertCircle,
    Clock,
    XCircle,
    Sparkles,
    ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
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

const statusConfig = {
    completed: {
        label: 'Completed',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
    pending: {
        label: 'Pending',
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800',
    },
    failed: {
        label: 'Failed',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50 dark:bg-red-950/40',
        border: 'border-red-200 dark:border-red-800',
    },
    refunded: {
        label: 'Refunded',
        variant: 'outline' as const,
        icon: AlertCircle,
        color: 'text-slate-500',
        bg: 'bg-slate-50 dark:bg-slate-900/40',
        border: 'border-slate-200 dark:border-slate-700',
    },
};

const methods = [
    {
        id: 'mtn_momo' as PaymentMethod,
        label: 'MTN Mobile Money',
        shortLabel: 'MTN MoMo',
        placeholder: '078xxxxxxx',
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        border: 'border-yellow-300 dark:border-yellow-700',
        textActive: 'text-yellow-700 dark:text-yellow-400',
        emoji: '🟡',
    },
    {
        id: 'airtel_money' as PaymentMethod,
        label: 'Airtel Money',
        shortLabel: 'Airtel',
        placeholder: '073xxxxxxx',
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-red-300 dark:border-red-700',
        textActive: 'text-red-700 dark:text-red-400',
        emoji: '🔴',
    },
];

export default function Payment({ hasAccess, payments }: Props) {
    const [method, setMethod] = useState<PaymentMethod>('mtn_momo');
    const [showError, setShowError] = useState(false);

    const { errors: pageErrors } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        phone: '',
        payment_method: 'mtn_momo',
    });

    useEffect(() => {
        if (pageErrors?.payment) {
            setShowError(true);
            const t = setTimeout(() => setShowError(false), 7000);
            return () => clearTimeout(t);
        }
    }, [pageErrors]);

    const selectedMethod = methods.find((m) => m.id === method)!;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('payment_method', method);
        post('/student/payment/momo', {
            onSuccess: () => reset('phone'),
            onError: () => {
                setShowError(true);
                setTimeout(() => setShowError(false), 7000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Get Access" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Get Access"
                    description="Unlock unlimited quizzes for 30 days with a single payment."
                />

                {/* Active Access Banner */}
                {hasAccess && (
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-teal-950/40">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                    You have active access!
                                </p>
                                <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                                    You can take quizzes freely. You may still
                                    renew early below.
                                </p>
                            </div>
                        </div>
                        <Sparkles className="absolute top-4 right-4 h-12 w-12 text-emerald-200 opacity-60 dark:text-emerald-800/50" />
                    </div>
                )}

                {/* Error Alert */}
                {(showError || pageErrors?.payment) && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/60">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                                Payment Failed
                            </p>
                            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                {pageErrors?.payment ||
                                    'We could not process your payment. Please check your number and try again.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Pricing Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl dark:from-slate-900 dark:to-black">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
                    <div className="pointer-events-none absolute top-8 -right-2 h-24 w-24 rounded-full bg-white/5" />
                    <div className="relative p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">
                                    Full Access
                                </span>
                                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                                    Unlimited Quizzes
                                </h2>
                                <p className="mt-1 text-sm text-white/60">
                                    30-day access · All features included
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-3xl font-extrabold tabular-nums">
                                    5,000
                                </p>
                                <p className="text-sm text-white/60">
                                    RWF / month
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-2">
                            {[
                                'Unlimited quiz attempts',
                                '400+ question bank',
                                'Instant results & explanations',
                                'Progress tracking',
                            ].map((f) => (
                                <div
                                    key={f}
                                    className="flex items-center gap-2 text-sm text-white/80"
                                >
                                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Form Card */}
                <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
                    <CardHeader className="border-b bg-muted/30 px-6 py-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            Pay with Mobile Money
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5 p-6">
                        {/* Method selector */}
                        <div className="grid grid-cols-2 gap-3">
                            {methods.map((m) => {
                                const isSelected = method === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => {
                                            setMethod(m.id);
                                            setData('payment_method', m.id);
                                        }}
                                        className={cn(
                                            'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all duration-200',
                                            isSelected
                                                ? cn('border-primary', m.bg)
                                                : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30',
                                        )}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                                        )}
                                        <span className="text-2xl">
                                            {m.emoji}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-center text-xs leading-tight font-semibold',
                                                isSelected
                                                    ? m.textActive
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {m.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className="flex items-center gap-1.5 text-sm font-medium"
                                >
                                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder={selectedMethod.placeholder}
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className={cn(
                                        'h-11 text-base transition-shadow',
                                        errors.phone &&
                                            'border-red-400 focus-visible:ring-red-300',
                                    )}
                                />
                                {errors.phone && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        {Array.isArray(errors.phone)
                                            ? errors.phone[0]
                                            : errors.phone}
                                    </p>
                                )}
                            </div>

                            {data.phone && (
                                <div className="rounded-xl border border-border/60 bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                                    A push notification will be sent to{' '}
                                    <span className="font-semibold text-foreground">
                                        {data.phone}
                                    </span>{' '}
                                    requesting confirmation of{' '}
                                    <span className="font-semibold text-foreground">
                                        5,000 RWF
                                    </span>
                                    .
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="h-12 w-full gap-2 text-base font-semibold shadow-sm"
                                disabled={processing || !data.phone}
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="h-4 w-4" />
                                        Processing payment…
                                    </>
                                ) : (
                                    <>
                                        Pay 5,000 RWF via{' '}
                                        {selectedMethod.shortLabel}
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
                                <Shield className="h-3.5 w-3.5" />
                                Payments are secure and processed by ITEC
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Payment History */}
                {payments.length > 0 && (
                    <div>
                        <h3 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">
                            Payment History
                        </h3>
                        <div className="flex flex-col gap-2">
                            {payments.map((p) => {
                                const cfg =
                                    statusConfig[
                                        p.status as keyof typeof statusConfig
                                    ] ?? statusConfig.pending;
                                const Icon = cfg.icon;
                                return (
                                    <div
                                        key={p.id}
                                        className={cn(
                                            'flex items-center justify-between rounded-xl border p-4 transition-colors',
                                            cfg.bg,
                                            cfg.border,
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 dark:bg-black/20">
                                                <Icon
                                                    className={cn(
                                                        'h-4 w-4',
                                                        cfg.color,
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {Number(
                                                        p.amount,
                                                    ).toLocaleString()}{' '}
                                                    {p.currency}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                                                    {p.payment_method.replace(
                                                        '_',
                                                        ' ',
                                                    )}{' '}
                                                    ·{' '}
                                                    {p.paid_at
                                                        ? new Date(
                                                              p.paid_at,
                                                          ).toLocaleDateString(
                                                              'en-RW',
                                                              {
                                                                  day: 'numeric',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                              },
                                                          )
                                                        : 'Pending confirmation'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={cfg.variant}
                                            className="shrink-0 capitalize"
                                        >
                                            {cfg.label}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
