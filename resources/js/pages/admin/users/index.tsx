/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/order */
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Eye, Search, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type {
    AdminUserRow,
    PaginatedData,
    WeCanPageProps,
} from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Users', href: '/admin/users' },
];

type Role = { id: number; name: string };
type Props = WeCanPageProps<{
    users: PaginatedData<AdminUserRow>;
    roles: Role[];
    filters: { search?: string; role?: string };
}>;

export default function UsersIndex({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    const apply = () =>
        router.get('/admin/users', { search, role }, { preserveState: true });
    const destroy = (id: number) => {
        if (confirm('Delete this user and all their quiz data?')) {
            router.delete(`/admin/users/${id}`);
        }
    };
    const toggleAccess = (id: number) =>
        router.post(`/admin/users/${id}/toggle-access`);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Users" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Users"
                    description={`${users.total} registered users`}
                />

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && apply()}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40 text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        {[
                                            'Name',
                                            'Email',
                                            'Role',
                                            'Access',
                                            'Attempts',
                                            'Pass Rate',
                                            '',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left font-semibold"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.data.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {u.name}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {u.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        u.roles[0] === 'admin'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {u.roles[0] ?? '—'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        toggleAccess(u.id)
                                                    }
                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                                                        u.has_access
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-400'
                                                            : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                                    }`}
                                                >
                                                    {u.has_access
                                                        ? 'Active'
                                                        : 'None'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {u.total_attempts}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={
                                                        u.pass_rate >= 70
                                                            ? 'font-bold text-green-600'
                                                            : u.pass_rate > 0
                                                              ? 'text-yellow-600'
                                                              : 'text-muted-foreground'
                                                    }
                                                >
                                                    {u.pass_rate}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/admin/users/${u.id}`,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            destroy(u.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {users.links && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-xs text-muted-foreground">
                                    Showing {users.from}–{users.to} of{' '}
                                    {users.total}
                                </p>
                                <div className="flex gap-1">
                                    {users.links.map((l, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                l.url && router.visit(l.url)
                                            }
                                            disabled={!l.url}
                                            dangerouslySetInnerHTML={{
                                                __html: l.label,
                                            }}
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
