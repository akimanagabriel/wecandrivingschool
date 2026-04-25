/* eslint-disable import/order */
import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Star,
    GripVertical,
    CheckCircle,
    X,
    Sparkles,
    Zap,
    Car,
    BadgeCheck,
    Tag,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { PricingPlan, WeCanPageProps } from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Pricing Plans', href: '/admin/pricing-plans' },
];

type Props = WeCanPageProps<{ plans: PricingPlan[] }>;

// Preset quick-fill templates for common plan patterns
const PRESETS = [
    {
        label: '1-Day Pass',
        amount: 500,
        duration_days: 1,
        duration_label: '1 Day',
        name: 'Day Pass',
    },
    {
        label: '3-Day',
        amount: 1000,
        duration_days: 3,
        duration_label: '3 Days',
        name: 'Starter',
    },
    {
        label: '1 Week',
        amount: 2200,
        duration_days: 7,
        duration_label: '1 Week',
        name: 'Basic',
    },
    {
        label: '15 Days',
        amount: 3000,
        duration_days: 15,
        duration_label: '15 Days',
        name: 'Standard',
    },
    {
        label: '25 Days',
        amount: 4500,
        duration_days: 25,
        duration_label: '25 Days',
        name: 'Premium',
    },
    {
        label: '1 Month',
        amount: 5000,
        duration_days: 30,
        duration_label: '1 Month',
        name: 'Full Month',
    },
    {
        label: 'Practical',
        amount: 200000,
        duration_days: 30,
        duration_label: '1 Month',
        name: 'Practical Driving',
    },
    {
        label: 'Custom',
        amount: 0,
        duration_days: 0,
        duration_label: '',
        name: '',
    },
];

function planAccentColor(amount: number) {
    if (amount >= 100000) return 'violet';
    if (amount >= 4000) return 'amber';
    if (amount >= 2500) return 'blue';
    return 'slate';
}

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

const accentClasses: Record<
    string,
    { icon: string; ring: string; badge: string; activeBg: string }
> = {
    violet: {
        icon: 'text-violet-500',
        ring: 'ring-violet-400/50',
        badge: 'bg-violet-600',
        activeBg:
            'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800',
    },
    amber: {
        icon: 'text-amber-500',
        ring: 'ring-amber-400/50',
        badge: 'bg-amber-500',
        activeBg:
            'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    },
    blue: {
        icon: 'text-blue-500',
        ring: 'ring-blue-400/50',
        badge: 'bg-blue-600',
        activeBg:
            'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    },
    slate: {
        icon: 'text-slate-500',
        ring: 'ring-slate-400/30',
        badge: 'bg-slate-500',
        activeBg:
            'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700',
    },
};

const emptyForm = {
    name: '',
    description: '',
    amount: '' as unknown as number,
    currency: 'RWF',
    duration_days: '' as unknown as number,
    duration_label: '',
    features: [''],
    badge_label: '',
    is_featured: false,
    is_active: true,
};

export default function PricingPlansIndex({ plans }: Props) {
    const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, put, processing, errors, reset } =
        useForm(emptyForm);

    const openCreate = () => {
        reset();
        setData(emptyForm as any);
        setEditingPlan(null);
        setShowForm(true);
    };

    const openEdit = (plan: PricingPlan) => {
        setEditingPlan(plan);
        setData({
            name: plan.name,
            description: plan.description ?? '',
            amount: plan.amount,
            currency: plan.currency,
            duration_days: plan.duration_days,
            duration_label: plan.duration_label,
            features: plan.features.length > 0 ? plan.features : [''],
            badge_label: plan.badge_label ?? '',
            is_featured: plan.is_featured,
            is_active: plan.is_active,
        } as any);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingPlan(null);
        reset();
    };

    const applyPreset = (preset: (typeof PRESETS)[0]) => {
        setData((d: any) => ({
            ...d,
            name: preset.name,
            amount: preset.amount || d.amount,
            duration_days: preset.duration_days || d.duration_days,
            duration_label: preset.duration_label || d.duration_label,
        }));
    };

    const addFeature = () =>
        setData('features' as any, [...(data as any).features, '']);
    const removeFeature = (i: number) =>
        setData(
            'features' as any,
            (data as any).features.filter((_: any, idx: number) => idx !== i),
        );
    const updateFeature = (i: number, val: string) => {
        const f = [...(data as any).features];
        f[i] = val;
        setData('features' as any, f);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanData = {
            ...(data as any),
            features: (data as any).features.filter((f: string) => f.trim()),
        };
        if (editingPlan) {
            router.put(`/admin/pricing-plans/${editingPlan.id}`, cleanData, {
                onSuccess: closeForm,
            });
        } else {
            router.post('/admin/pricing-plans', cleanData, {
                onSuccess: closeForm,
            });
        }
    };

    const deletePlan = (plan: PricingPlan) => {
        if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
            router.delete(`/admin/pricing-plans/${plan.id}`);
        }
    };

    const toggleActive = (plan: PricingPlan) => {
        router.post(`/admin/pricing-plans/${plan.id}/toggle`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing Plans" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Pricing Plans"
                        description="Manage all plans shown to students. Drag to reorder, toggle to activate."
                    />
                    <Button onClick={openCreate} className="shrink-0 gap-2">
                        <Plus className="h-4 w-4" /> New Plan
                    </Button>
                </div>

                {/* ── Plan cards ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => {
                        const color = planAccentColor(plan.amount);
                        const acc = accentClasses[color];
                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    'group relative rounded-2xl border p-5 transition-all duration-200',
                                    plan.is_active
                                        ? cn(
                                              'shadow-sm hover:shadow-md',
                                              acc.activeBg,
                                          )
                                        : 'border-border bg-muted/20 opacity-60',
                                    plan.is_featured && cn('ring-2', acc.ring),
                                )}
                            >
                                {/* Featured / badge */}
                                {plan.badge_label && (
                                    <span
                                        className={cn(
                                            'absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm',
                                            acc.badge,
                                        )}
                                    >
                                        {plan.badge_label}
                                    </span>
                                )}

                                {/* Drag handle (cosmetic) */}
                                <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-40">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Header */}
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70">
                                        <PlanIcon
                                            amount={plan.amount}
                                            className={cn('h-5 w-5', acc.icon)}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="truncate text-sm font-bold">
                                                {plan.name}
                                            </p>
                                            {plan.is_featured && (
                                                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                                            )}
                                        </div>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                            {plan.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Price + duration */}
                                <div className="mt-4 flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl leading-none font-extrabold tabular-nums">
                                            {Number(
                                                plan.amount,
                                            ).toLocaleString()}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {plan.currency} ·{' '}
                                            {plan.duration_label}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            plan.is_active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="capitalize"
                                    >
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                {/* Features */}
                                {plan.features.length > 0 && (
                                    <ul className="mt-3 space-y-1">
                                        {plan.features.slice(0, 4).map((f) => (
                                            <li
                                                key={f}
                                                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                                            >
                                                <CheckCircle
                                                    className={cn(
                                                        'h-3 w-3 shrink-0',
                                                        acc.icon,
                                                    )}
                                                />
                                                {f}
                                            </li>
                                        ))}
                                        {plan.features.length > 4 && (
                                            <li className="pl-4 text-xs text-muted-foreground">
                                                +{plan.features.length - 4}{' '}
                                                more…
                                            </li>
                                        )}
                                    </ul>
                                )}

                                {/* Actions */}
                                <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3">
                                    <button
                                        onClick={() => toggleActive(plan)}
                                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                        title={
                                            plan.is_active
                                                ? 'Deactivate'
                                                : 'Activate'
                                        }
                                    >
                                        {plan.is_active ? (
                                            <ToggleRight className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <ToggleLeft className="h-4 w-4" />
                                        )}
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                    <div className="ml-auto flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => openEdit(plan)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => deletePlan(plan)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add new card (shortcut) */}
                    <button
                        onClick={openCreate}
                        className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/20 hover:text-foreground"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-current">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold">
                                Add New Plan
                            </p>
                            <p className="mt-0.5 text-xs">
                                Custom amount, duration &amp; features
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* ── Slide-over / Modal Form ── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeForm}
                    />

                    {/* Panel */}
                    <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl">
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-5 py-4 backdrop-blur">
                            <div>
                                <h2 className="text-base font-bold">
                                    {editingPlan
                                        ? 'Edit Plan'
                                        : 'Create New Plan'}
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {editingPlan
                                        ? `Editing "${editingPlan.name}"`
                                        : 'Fill in the details below'}
                                </p>
                            </div>
                            <button
                                onClick={closeForm}
                                className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-5">
                            {/* Quick presets */}
                            {!editingPlan && (
                                <div>
                                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                        <Tag className="h-3.5 w-3.5" /> Quick
                                        Presets
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRESETS.map((p) => (
                                            <button
                                                key={p.label}
                                                type="button"
                                                onClick={() => applyPreset(p)}
                                                className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted"
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Name & Badge */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="name"
                                        className="text-xs font-semibold"
                                    >
                                        Plan Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Premium"
                                        value={(data as any).name}
                                        onChange={(e) =>
                                            setData(
                                                'name' as any,
                                                e.target.value,
                                            )
                                        }
                                        className={cn(
                                            'h-9',
                                            errors.name && 'border-red-400',
                                        )}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="badge_label"
                                        className="text-xs font-semibold"
                                    >
                                        Badge Label
                                    </Label>
                                    <Input
                                        id="badge_label"
                                        placeholder="Most Popular"
                                        value={(data as any).badge_label}
                                        onChange={(e) =>
                                            setData(
                                                'badge_label' as any,
                                                e.target.value,
                                            )
                                        }
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="description"
                                    className="text-xs font-semibold"
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Short description of the plan…"
                                    value={(data as any).description}
                                    onChange={(e) =>
                                        setData(
                                            'description' as any,
                                            e.target.value,
                                        )
                                    }
                                    className="h-16 resize-none text-sm"
                                />
                            </div>

                            {/* Amount + Currency */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <Label
                                        htmlFor="amount"
                                        className="text-xs font-semibold"
                                    >
                                        Amount *
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={1}
                                        placeholder="5000"
                                        value={(data as any).amount || ''}
                                        onChange={(e) =>
                                            setData(
                                                'amount' as any,
                                                Number(e.target.value),
                                            )
                                        }
                                        className={cn(
                                            'h-9',
                                            errors.amount && 'border-red-400',
                                        )}
                                    />
                                    {errors.amount && (
                                        <p className="text-xs text-red-500">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="currency"
                                        className="text-xs font-semibold"
                                    >
                                        Currency
                                    </Label>
                                    <select
                                        id="currency"
                                        value={(data as any).currency}
                                        onChange={(e) =>
                                            setData(
                                                'currency' as any,
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                    >
                                        <option value="RWF">RWF</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="duration_days"
                                        className="text-xs font-semibold"
                                    >
                                        Duration (days) *
                                    </Label>
                                    <Input
                                        id="duration_days"
                                        type="number"
                                        min={1}
                                        max={365}
                                        placeholder="30"
                                        value={
                                            (data as any).duration_days || ''
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'duration_days' as any,
                                                Number(e.target.value),
                                            )
                                        }
                                        className={cn(
                                            'h-9',
                                            errors.duration_days &&
                                                'border-red-400',
                                        )}
                                    />
                                    {errors.duration_days && (
                                        <p className="text-xs text-red-500">
                                            {errors.duration_days}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="duration_label"
                                        className="text-xs font-semibold"
                                    >
                                        Duration Label *
                                    </Label>
                                    <Input
                                        id="duration_label"
                                        placeholder="1 Month"
                                        value={(data as any).duration_label}
                                        onChange={(e) =>
                                            setData(
                                                'duration_label' as any,
                                                e.target.value,
                                            )
                                        }
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold">
                                        Features / Inclusions
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        <Plus className="h-3 w-3" /> Add feature
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {((data as any).features as string[]).map(
                                        (f, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    placeholder={`Feature ${i + 1}…`}
                                                    value={f}
                                                    onChange={(e) =>
                                                        updateFeature(
                                                            i,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 flex-1 text-sm"
                                                />
                                                {(data as any).features.length >
                                                    1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFeature(i)
                                                        }
                                                        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex items-center gap-6">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={(data as any).is_featured}
                                        onChange={(e) =>
                                            setData(
                                                'is_featured' as any,
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-border"
                                    />
                                    <span className="flex items-center gap-1 text-sm font-medium">
                                        <Star className="h-3.5 w-3.5 text-amber-500" />{' '}
                                        Featured
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={(data as any).is_active}
                                        onChange={(e) =>
                                            setData(
                                                'is_active' as any,
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-border"
                                    />
                                    <span className="flex items-center gap-1 text-sm font-medium">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />{' '}
                                        Active
                                    </span>
                                </label>
                            </div>

                            {/* Live preview */}
                            {(data as any).amount > 0 && (data as any).name && (
                                <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                                    <p className="mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Preview
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">
                                                {(data as any).name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(data as any).duration_label ||
                                                    `${(data as any).duration_days} days`}
                                            </p>
                                        </div>
                                        <p className="text-xl font-extrabold tabular-nums">
                                            {Number(
                                                (data as any).amount,
                                            ).toLocaleString()}
                                            <span className="ml-1 text-xs font-semibold text-muted-foreground">
                                                {(data as any).currency}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeForm}
                                    className="h-10 flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-10 flex-1 font-semibold"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Saving…'
                                        : editingPlan
                                          ? 'Save Changes'
                                          : 'Create Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
