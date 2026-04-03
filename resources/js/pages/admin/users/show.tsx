import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { WeCanPageProps } from '@/types/wecan';

type AttemptRow  = { id: number; score: number; is_passed: boolean; started_at: string; ended_at: string };
type PaymentRow  = { id: number; amount: number; currency: string; payment_method: string; status: string; paid_at: string | null };
type UserDetail  = { id: number; name: string; email: string; roles: string[]; has_access: boolean; is_active: boolean; pass_rate: number };

type Props = WeCanPageProps<{
    user:     UserDetail;
    attempts: AttemptRow[];
    payments: PaymentRow[];
}>;

export default function UserShow({ user, attempts, payments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Users', href: '/admin/users' },
        { title: user.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />
            <div className="mx-auto max-w-3xl flex flex-col gap-6 p-4 md:p-6">
                <Button variant="ghost" size="sm" className="self-start" onClick={() => router.visit('/admin/users')}>
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Users
                </Button>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">{user.name}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <Badge variant={user.roles[0] === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                    {user.roles[0] ?? 'No role'}
                                </Badge>
                                <Badge variant={user.has_access ? 'default' : 'outline'}>
                                    {user.has_access ? 'Access Active' : 'No Access'}
                                </Badge>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-5 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{attempts.length}</p>
                                <p className="text-xs text-muted-foreground">Attempts</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{user.pass_rate}%</p>
                                <p className="text-xs text-muted-foreground">Pass Rate</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0}%
                                </p>
                                <p className="text-xs text-muted-foreground">Best Score</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button
                                variant={user.has_access ? 'outline' : 'default'}
                                size="sm"
                                className="w-full"
                                onClick={() => router.post(`/admin/users/${user.id}/toggle-access`)}
                            >
                                {user.has_access ? 'Revoke Access' : 'Grant Access'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {attempts.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Quiz History</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {attempts.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            {a.is_passed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-400" />}
                                            <div>
                                                <p className="text-sm font-medium">{a.score}%
                                                    <Badge variant={a.is_passed ? 'default' : 'destructive'} className="ml-2 text-[10px]">
                                                        {a.is_passed ? 'PASS' : 'FAIL'}
                                                    </Badge>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {a.started_at ? new Date(a.started_at).toLocaleString() : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => router.visit(`/quiz/${a.id}/results`)}>View →</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {payments.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {payments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between px-6 py-3">
                                        <div>
                                            <p className="text-sm font-medium">{Number(p.amount).toLocaleString()} {p.currency}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {p.payment_method.replace('_', ' ')} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : 'Pending'}
                                            </p>
                                        </div>
                                        <Badge variant={p.status === 'completed' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'}>
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
