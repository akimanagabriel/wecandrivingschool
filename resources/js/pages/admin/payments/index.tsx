/* eslint-disable import/order */
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    CreditCard,
    DollarSign,
    RotateCcw,
    Search,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type {
    AdminPaymentRow,
    PaginatedData,
    WeCanPageProps,
} from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Payments', href: '/admin/payments' },
];

type Totals = { total: number; thisMonth: number; pending: number };
type Props = WeCanPageProps<{
    payments: PaginatedData<AdminPaymentRow>;
    totals: Totals;
    filters: { search?: string; status?: string; method?: string };
}>;

const statusConfig = {
    completed: {
        label: 'Completed',
        variant: 'default' as const,
        icon: CheckCircle,
        dot: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
    pending: {
        label: 'Pending',
        variant: 'secondary' as const,
        icon: Clock,
        dot: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800',
    },
    failed: {
        label: 'Failed',
        variant: 'destructive' as const,
        icon: XCircle,
        dot: 'bg-red-500',
        text: 'text-red-700 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/40',
        border: 'border-red-200 dark:border-red-800',
    },
    refunded: {
        label: 'Refunded',
        variant: 'outline' as const,
        icon: AlertCircle,
        dot: 'bg-slate-400',
        text: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-900/40',
        border: 'border-slate-200 dark:border-slate-700',
    },
};

const statsCards = (totals: Totals) => [
    {
        label: 'Total Revenue',
        value: `${Number(totals.total).toLocaleString()} RWF`,
        icon: DollarSign,
        iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        iconColor: 'text-emerald-600',
        sublabel: 'All time completed',
    },
    {
        label: 'This Month',
        value: `${Number(totals.thisMonth).toLocaleString()} RWF`,
        icon: TrendingUp,
        iconBg: 'bg-blue-100 dark:bg-blue-950/60',
        iconColor: 'text-blue-600',
        sublabel: new Date().toLocaleString('default', {
            month: 'long',
            year: 'numeric',
        }),
    },
    {
        label: 'Pending Payments',
        value: totals.pending,
        icon: RotateCcw,
        iconBg: 'bg-amber-100 dark:bg-amber-950/60',
        iconColor: 'text-amber-600',
        sublabel: 'Awaiting confirmation',
    },
];

export default function PaymentsIndex({ payments, totals, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [method, setMethod] = useState(filters.method ?? '');

    const apply = () =>
        router.get(
            '/admin/payments',
            { search, status, method },
            { preserveState: true },
        );

    const getExportUrl = () => {
        const params = new URLSearchParams();

        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (method) params.set('method', method);

        const query = params.toString();
        return `/admin/payments/report${query ? `?${query}` : ''}`;
    };

    const refund = (id: number) => {
        if (
            confirm(
                'Are you sure you want to refund this payment? This action cannot be undone.',
            )
        ) {
            router.post(`/admin/payments/${id}/refund`);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setMethod('');
        router.get('/admin/payments', {}, { preserveState: true });
    };

    const hasFilters = search || status || method;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Payments"
                    description="Monitor transactions and manage student access."
                />

                {/* Stats row */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {statsCards(totals).map((s) => (
                        <Card
                            key={s.label}
                            className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60"
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            {s.label}
                                        </p>
                                        <p className="mt-1.5 truncate text-2xl font-bold tabular-nums">
                                            {s.value}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {s.sublabel}
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                            s.iconBg,
                                        )}
                                    >
                                        <s.icon
                                            className={cn(
                                                'h-5 w-5',
                                                s.iconColor,
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters bar */}
                <Card className="border-0 shadow-sm ring-1 ring-border/60">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                Filters
                            </div>
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="h-9 pl-9 text-sm"
                                    placeholder="Search by student name or email…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && apply()
                                    }
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                <option value="">All Statuses</option>
                                {[
                                    'pending',
                                    'completed',
                                    'failed',
                                    'refunded',
                                ].map((s) => (
                                    <option
                                        key={s}
                                        value={s}
                                        className="capitalize"
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            >
                                <option value="">All Methods</option>
                                {[
                                    'mtn_momo',
                                    'airtel_money',
                                    'stripe',
                                    'cash',
                                ].map((m) => (
                                    <option key={m} value={m}>
                                        {m.replace(/_/g, ' ').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            <div className="flex shrink-0 flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    className="h-9"
                                    onClick={apply}
                                >
                                    Apply
                                </Button>
                                <a
                                    href={getExportUrl()}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted"
                                >
                                    Export PDF
                                </a>
                                {hasFilters && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-9 text-muted-foreground"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments table */}
                <Card className="overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/60">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        {[
                                            'Student',
                                            'Amount',
                                            'Method',
                                            'Status',
                                            'Transaction ID',
                                            'Date',
                                            '',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {payments.data.map((p) => {
                                        const cfg =
                                            statusConfig[
                                                p.status as keyof typeof statusConfig
                                            ] ?? statusConfig.pending;
                                        const Icon = cfg.icon;
                                        return (
                                            <tr
                                                key={p.id}
                                                className="group transition-colors hover:bg-muted/30"
                                            >
                                                {/* Student */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                                            {p.user_name
                                                                .split(' ')
                                                                .map(
                                                                    (
                                                                        n: string,
                                                                    ) => n[0],
                                                                )
                                                                .join('')
                                                                .toUpperCase()
                                                                .slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                {p.user_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {p.user_email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-4 py-3">
                                                    <span className="font-bold tabular-nums">
                                                        {Number(
                                                            p.amount,
                                                        ).toLocaleString()}
                                                    </span>
                                                    <span className="ml-1 text-xs text-muted-foreground">
                                                        {p.currency}
                                                    </span>
                                                </td>

                                                {/* Method */}
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground capitalize">
                                                        {p.payment_method.replace(
                                                            /_/g,
                                                            ' ',
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <div
                                                        className={cn(
                                                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                                                            cfg.bg,
                                                            cfg.border,
                                                            cfg.text,
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                'h-1.5 w-1.5 shrink-0 rounded-full',
                                                                cfg.dot,
                                                            )}
                                                        />
                                                        {cfg.label}
                                                    </div>
                                                </td>

                                                {/* Transaction ID */}
                                                <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                                                    {p.transaction_id ? (
                                                        <span
                                                            title={
                                                                p.transaction_id
                                                            }
                                                        >
                                                            {p.transaction_id}
                                                        </span>
                                                    ) : (
                                                        <span className="text-border">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                    {p.paid_at ? (
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">
                                                                {new Date(
                                                                    p.paid_at,
                                                                ).toLocaleDateString(
                                                                    'en-RW',
                                                                    {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                    },
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(
                                                                    p.paid_at,
                                                                ).getFullYear()}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            Not yet
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3 text-right">
                                                    {p.status ===
                                                        'completed' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-xs text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() =>
                                                                refund(p.id)
                                                            }
                                                        >
                                                            Refund
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {payments.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <CreditCard className="h-8 w-8 opacity-30" />
                                                    <p className="text-sm font-medium">
                                                        No payments found
                                                    </p>
                                                    {hasFilters && (
                                                        <p className="text-xs">
                                                            Try adjusting your
                                                            filters
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {payments.links && payments.data.length > 0 && (
                            <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
                                <p className="text-xs text-muted-foreground">
                                    Showing{' '}
                                    <span className="font-medium text-foreground">
                                        {payments.from}–{payments.to}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-foreground">
                                        {payments.total}
                                    </span>{' '}
                                    payments
                                </p>
                                <div className="flex items-center gap-1">
                                    {payments.links.map((l, i) => {
                                        const isPrev =
                                            l.label.includes('Previous') ||
                                            l.label.includes('&laquo;');
                                        const isNext =
                                            l.label.includes('Next') ||
                                            l.label.includes('&raquo;');
                                        const isNum = !isPrev && !isNext;

                                        return (
                                            <button
                                                key={i}
                                                onClick={() =>
                                                    l.url && router.visit(l.url)
                                                }
                                                disabled={!l.url}
                                                className={cn(
                                                    'flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                                                    l.active
                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                        : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                                                )}
                                            >
                                                {isPrev ? (
                                                    <ChevronLeft className="h-3.5 w-3.5" />
                                                ) : isNext ? (
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: l.label,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
