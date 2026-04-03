import { Head } from '@inertiajs/react';
import { AlertTriangle, BarChart3, CreditCard, HelpCircle, TrendingUp, Users } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { AdminStats, WeCanPageProps } from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
];

type MonthlyRevenue = { month: string; total: number };
type HardestQuestion = { id: number; question: string; fail_rate: number; total_answers: number };
type RecentPayment   = { id: number; user: string; amount: number; method: string; status: string; date: string | null };

type Props = WeCanPageProps<{
    stats: AdminStats;
    monthlyRevenue: MonthlyRevenue[];
    hardestQuestions: HardestQuestion[];
    recentPayments: RecentPayment[];
}>;

export default function AdminDashboard({ stats, monthlyRevenue, hardestQuestions, recentPayments }: Props) {
    const statCards = [
        { label: 'Total Students',  value: stats.totalStudents,                              icon: Users,      color: 'text-blue-500' },
        { label: 'Questions',       value: stats.totalQuestions,                             icon: HelpCircle, color: 'text-purple-500' },
        { label: 'Quiz Attempts',   value: stats.totalAttempts,                              icon: BarChart3,  color: 'text-green-500' },
        { label: 'Total Revenue',   value: `${Number(stats.totalRevenue).toLocaleString()} RWF`, icon: CreditCard, color: 'text-yellow-500',
          sub: `Pass rate: ${stats.passRate}%` },
    ];

    const maxRevenue = Math.max(...monthlyRevenue.map((r) => Number(r.total)), 1);

    const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        completed: 'default',
        pending:   'secondary',
        failed:    'destructive',
        refunded:  'outline',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading title="Admin Dashboard" description="Overview of WeCanDrivingSchool." />

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((s) => (
                        <Card key={s.label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                                <s.icon className={`h-4 w-4 ${s.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{s.value}</div>
                                {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Revenue chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-4 w-4 text-blue-500" /> Monthly Revenue (RWF)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {monthlyRevenue.length > 0 ? (
                                <div className="flex h-36 items-end gap-2">
                                    {monthlyRevenue.map((r) => (
                                        <div key={r.month} className="flex flex-1 flex-col items-center gap-1">
                                            <span className="text-[10px] text-muted-foreground">
                                                {Number(r.total).toLocaleString()}
                                            </span>
                                            <div
                                                className="w-full rounded-t bg-primary/80 transition-all"
                                                style={{
                                                    height: `${Math.round((Number(r.total) / maxRevenue) * 100)}px`,
                                                    minHeight: '4px',
                                                }}
                                            />
                                            <span className="text-[10px] text-muted-foreground">
                                                {r.month?.slice(5)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">No revenue data yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hardest questions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="h-4 w-4 text-red-400" /> Most Failed Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {hardestQuestions.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">Not enough data yet.</p>
                            ) : hardestQuestions.map((q) => (
                                <div key={q.id} className="flex items-center gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm">{q.question}</p>
                                        <p className="text-xs text-muted-foreground">{q.total_answers} attempts</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-bold text-red-500">{q.fail_rate}%</p>
                                        <p className="text-[10px] text-muted-foreground">fail</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent payments table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        {['Student', 'Amount', 'Method', 'Status', 'Date'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentPayments.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium">{p.user}</td>
                                            <td className="px-4 py-3">{Number(p.amount).toLocaleString()} RWF</td>
                                            <td className="px-4 py-3 capitalize">{p.method.replace('_', ' ')}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={statusVariant[p.status] ?? 'outline'}>
                                                    {p.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {p.date ? new Date(p.date).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentPayments.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                No payments yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
