import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CreditCard, DollarSign, RotateCcw, Search } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { AdminPaymentRow, PaginatedData, WeCanPageProps } from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin',    href: '/admin' },
    { title: 'Payments', href: '/admin/payments' },
];

type Totals = { total: number; thisMonth: number; pending: number };
type Props = WeCanPageProps<{
    payments: PaginatedData<AdminPaymentRow>;
    totals:   Totals;
    filters:  { search?: string; status?: string; method?: string };
}>;

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    completed: 'default', pending: 'secondary', failed: 'destructive', refunded: 'outline',
};

export default function PaymentsIndex({ payments, totals, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [method, setMethod] = useState(filters.method ?? '');

    const apply  = () => router.get('/admin/payments', { search, status, method }, { preserveState: true });
    const refund = (id: number) => { if (confirm('Refund this payment?')) router.post(`/admin/payments/${id}/refund`); };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading title="Payments" />

                {/* Totals */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Total Revenue', value: `${Number(totals.total).toLocaleString()} RWF`,      icon: DollarSign, color: 'text-green-500' },
                        { label: 'This Month',    value: `${Number(totals.thisMonth).toLocaleString()} RWF`,  icon: CreditCard, color: 'text-blue-500'  },
                        { label: 'Pending',       value: totals.pending,                                      icon: RotateCcw,  color: 'text-yellow-500'},
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                                <s.icon className={`h-4 w-4 ${s.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{s.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Search student…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} />
                    </div>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">All Statuses</option>
                        {['pending','completed','failed','refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">All Methods</option>
                        {['mtn_momo','airtel_money','stripe','cash'].map((m) => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
                    </select>
                    <Button variant="outline" onClick={apply}>Filter</Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        {['Student','Amount','Method','Status','Transaction','Date',''].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {payments.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{p.user_name}</p>
                                                <p className="text-xs text-muted-foreground">{p.user_email}</p>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">{Number(p.amount).toLocaleString()} {p.currency}</td>
                                            <td className="px-4 py-3 capitalize text-muted-foreground">{p.payment_method.replace('_',' ')}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={statusVariant[p.status] ?? 'outline'}>{p.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.transaction_id ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                                            <td className="px-4 py-3">
                                                {p.status === 'completed' && (
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => refund(p.id)}>
                                                        Refund
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.data.length === 0 && (
                                        <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No payments found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {payments.links && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-xs text-muted-foreground">Showing {payments.from}–{payments.to} of {payments.total}</p>
                                <div className="flex gap-1">
                                    {payments.links.map((l, i) => (
                                        <button key={i} onClick={() => l.url && router.visit(l.url)} disabled={!l.url}
                                            dangerouslySetInnerHTML={{ __html: l.label }}
                                            className={`rounded px-2.5 py-1 text-xs font-medium ${l.active ? 'bg-primary text-primary-foreground' : 'border text-muted-foreground hover:bg-muted disabled:opacity-40'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
