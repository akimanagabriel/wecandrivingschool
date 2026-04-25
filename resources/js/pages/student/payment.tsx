/* eslint-disable import/order */
import {
    CheckCircle,
    Shield,
    Smartphone,
    AlertCircle,
    Clock,
    XCircle,
    Sparkles,
    ChevronRight,
    Star,
    Zap,
    Car,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { PaymentRecord, PricingPlan, WeCanPageProps } from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student/dashboard' },
    { title: 'Access / Pay', href: '/student/payment' },
];

type PaymentMethod = 'mtn_momo' | 'airtel_money';

type Props = WeCanPageProps<{
    hasAccess: boolean;
    plans: PricingPlan[];
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

const momoMethods = [
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

// Icon per plan tier
function PlanIcon({
    amount,
    className,
}: {
    amount: number;
    className?: string;
}) {
    if (amount >= 100000) return <Car className={className} />;
    if (amount >= 4000) return <Star className={className} />;
    if (amount >= 2500) return <Zap className={className} />;
    return <Sparkles className={className} />;
}

// Duration accent color per tier
function planAccent(amount: number) {
    if (amount >= 100000)
        return {
            ring: 'ring-violet-400/60',
            glow: 'shadow-violet-500/20',
            badge: 'bg-violet-600',
            bar: 'from-violet-600 to-purple-700',
            icon: 'text-violet-500',
            selected: 'ring-violet-500 bg-violet-50/60 dark:bg-violet-950/30',
        };
    if (amount >= 4000)
        return {
            ring: 'ring-amber-400/60',
            glow: 'shadow-amber-500/20',
            badge: 'bg-amber-500',
            bar: 'from-amber-500 to-orange-500',
            icon: 'text-amber-500',
            selected: 'ring-amber-500 bg-amber-50/60 dark:bg-amber-950/30',
        };
    if (amount >= 2500)
        return {
            ring: 'ring-blue-400/60',
            glow: 'shadow-blue-500/20',
            badge: 'bg-blue-600',
            bar: 'from-blue-500 to-cyan-500',
            icon: 'text-blue-500',
            selected: 'ring-blue-500 bg-blue-50/60 dark:bg-blue-950/30',
        };
    return {
        ring: 'ring-slate-400/40',
        glow: 'shadow-slate-500/10',
        badge: 'bg-slate-500',
        bar: 'from-slate-500 to-slate-600',
        icon: 'text-slate-500',
        selected: 'ring-slate-400 bg-slate-50/60 dark:bg-slate-900/30',
    };
}

export default function Payment({ hasAccess, plans, payments }: Props) {
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(
        plans.find((p) => p.is_featured) ?? plans[0] ?? null,
    );
    const [method, setMethod] = useState<PaymentMethod>('mtn_momo');
    const [showError, setShowError] = useState(false);

    const { errors: pageErrors } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        phone: '',
        payment_method: 'mtn_momo',
        plan_id: selectedPlan?.id ?? '',
    });

    useEffect(() => {
        if (pageErrors?.payment) {
            setShowError(true);
            const t = setTimeout(() => setShowError(false), 7000);
            return () => clearTimeout(t);
        }
    }, [pageErrors]);

    const selectedMethod = momoMethods.find((m) => m.id === method)!;

    const handlePlanSelect = (plan: PricingPlan) => {
        setSelectedPlan(plan);
        setData('plan_id', plan.id);
    };

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

            <div className="container mx-auto flex w-full flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Get Access"
                    description="Choose a plan that fits your schedule and start practising today."
                />

                {/* Active access banner */}
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
                                    renew or upgrade below.
                                </p>
                            </div>
                        </div>
                        <Sparkles className="absolute top-4 right-4 h-12 w-12 text-emerald-200 opacity-60 dark:text-emerald-800/50" />
                    </div>
                )}

                {/* Error alert */}
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

                {/* ── Plan Grid ── */}
                <div>
                    <p className="mb-3 px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Choose a Plan
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {plans.map((plan) => {
                            const accent = planAccent(plan.amount);
                            const isSelected = selectedPlan?.id === plan.id;
                            const isLarge = plan.amount >= 100000;

                            return (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => handlePlanSelect(plan)}
                                    className={cn(
                                        'relative rounded-2xl border-2 p-4 text-left transition-all duration-200 focus:outline-none',
                                        isSelected
                                            ? cn(
                                                  'border-transparent shadow-lg ring-2',
                                                  accent.ring,
                                                  accent.selected,
                                                  accent.glow,
                                              )
                                            : 'border-border hover:border-border/80 hover:bg-muted/30',
                                        isLarge && 'sm:col-span-2',
                                    )}
                                >
                                    {/* Badge */}
                                    {plan.badge_label && (
                                        <span
                                            className={cn(
                                                'absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm',
                                                accent.badge,
                                            )}
                                        >
                                            {plan.badge_label}
                                        </span>
                                    )}

                                    <div
                                        className={cn(
                                            'flex items-start gap-3',
                                            isLarge && 'sm:items-center',
                                        )}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={cn(
                                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60',
                                                isSelected &&
                                                    'bg-white/70 dark:bg-black/20',
                                            )}
                                        >
                                            <PlanIcon
                                                amount={plan.amount}
                                                className={cn(
                                                    'h-5 w-5',
                                                    accent.icon,
                                                )}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <div
                                                className={cn(
                                                    'flex items-start justify-between gap-2',
                                                    isLarge &&
                                                        'sm:items-center',
                                                )}
                                            >
                                                <div>
                                                    <p className="text-sm leading-tight font-bold text-foreground">
                                                        {plan.name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                                                        {plan.description}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className="text-base leading-tight font-extrabold tabular-nums">
                                                        {Number(
                                                            plan.amount,
                                                        ).toLocaleString()}
                                                        <span className="ml-1 text-xs font-semibold text-muted-foreground">
                                                            {plan.currency}
                                                        </span>
                                                    </p>
                                                    <span className="text-[10px] whitespace-nowrap text-muted-foreground">
                                                        {plan.duration_label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            {plan.features &&
                                                plan.features.length > 0 && (
                                                    <div
                                                        className={cn(
                                                            'mt-2 flex flex-wrap gap-x-3 gap-y-0.5',
                                                            isLarge &&
                                                                'sm:grid sm:grid-cols-2',
                                                        )}
                                                    >
                                                        {plan.features.map(
                                                            (f) => (
                                                                <span
                                                                    key={f}
                                                                    className="flex items-center gap-1 text-[10px] text-muted-foreground"
                                                                >
                                                                    <CheckCircle
                                                                        className={cn(
                                                                            'h-3 w-3 shrink-0',
                                                                            accent.icon,
                                                                        )}
                                                                    />
                                                                    {f}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Selected indicator */}
                                    {isSelected && (
                                        <div className="absolute top-3 right-3">
                                            <div
                                                className={cn(
                                                    'flex h-5 w-5 items-center justify-center rounded-full',
                                                    accent.badge,
                                                )}
                                            >
                                                <CheckCircle className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Payment form ── */}
                {selectedPlan && (
                    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
                        {/* Summary bar */}
                        <div
                            className={cn(
                                'h-1.5 w-full bg-gradient-to-r',
                                planAccent(selectedPlan.amount).bar,
                            )}
                        />
                        <CardContent className="space-y-5 p-5">
                            {/* Selected plan summary */}
                            <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 px-4 py-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Selected plan
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {selectedPlan.name} ·{' '}
                                        {selectedPlan.duration_label}
                                    </p>
                                </div>
                                <p className="shrink-0 text-xl font-extrabold tabular-nums">
                                    {Number(
                                        selectedPlan.amount,
                                    ).toLocaleString()}
                                    <span className="ml-1 text-xs font-semibold text-muted-foreground">
                                        {selectedPlan.currency}
                                    </span>
                                </p>
                            </div>

                            {/* Method selector */}
                            <div>
                                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                                    Pay with
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {momoMethods.map((m) => {
                                        const isActive = method === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => {
                                                    setMethod(m.id);
                                                    setData(
                                                        'payment_method',
                                                        m.id,
                                                    );
                                                }}
                                                className={cn(
                                                    'relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? cn(
                                                              'border-primary',
                                                              m.bg,
                                                          )
                                                        : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30',
                                                )}
                                            >
                                                {isActive && (
                                                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                                                )}
                                                <span className="text-xl">
                                                    {m.emoji}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'text-center text-[11px] leading-tight font-semibold',
                                                        isActive
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
                            </div>

                            {/* Phone form */}
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
                                            'h-11 text-base',
                                            errors.phone &&
                                                'border-red-400 focus-visible:ring-red-300',
                                        )}
                                    />
                                    {errors.phone && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
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
                                            {Number(
                                                selectedPlan.amount,
                                            ).toLocaleString()}{' '}
                                            {selectedPlan.currency}
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
                                            <Spinner className="h-4 w-4" />{' '}
                                            Processing payment…
                                        </>
                                    ) : (
                                        <>
                                            Pay{' '}
                                            {Number(
                                                selectedPlan.amount,
                                            ).toLocaleString()}{' '}
                                            {selectedPlan.currency} via{' '}
                                            {selectedMethod.shortLabel}{' '}
                                            <ChevronRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                    <Shield className="h-3.5 w-3.5" />
                                    Payments are secure and processed by ITEC
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* ── Payment History ── */}
                {payments.length > 0 && (
                    <div>
                        <h3 className="mb-3 px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
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
                                            'flex items-center justify-between rounded-xl border p-3.5',
                                            cfg.bg,
                                            cfg.border,
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 dark:bg-black/20">
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
