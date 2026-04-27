/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @stylistic/padding-line-between-statements */

import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Copy,
    CheckCircle,
    XCircle,
    Users,
    Calendar,
    TrendingUp,
    Clock,
    MapPin,
    Award,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Session {
    accessed_at: string;
    ip_address: string;
    score: number | null;
    is_passed: boolean;
}

interface Props {
    link: {
        id: number;
        name: string;
        token: string;
        max_uses: number;
        used_count: number;
        remaining_uses: number;
        expires_at: string | null;
        url: string;
    };
    sessions: Session[];
    total_attempts: number;
    average_score: number;
    pass_rate: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Shared Links', href: '/admin/shared-links' },
    { title: 'Statistics', href: '#' },
];

export default function SharedLinksStats({
    link,
    sessions,
    total_attempts,
    average_score,
    pass_rate,
}: Props) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Link copied to clipboard!');
    };

    const getScoreColor = (score: number | null) => {
        if (!score) {
            return 'text-gray-400';
        }
        if (score >= 70) {
            return 'text-green-600';
        }
        return 'text-red-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Link Statistics - ${link.name}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header with back button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.get('/admin/shared-links')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Links
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Link Statistics</h1>
                        <p className="text-muted-foreground">
                            Performance overview for "{link.name}"
                        </p>
                    </div>
                </div>

                {/* Link Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Link Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    URL
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                                        {link.url}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    Token
                                </div>
                                <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs">
                                    {link.token}
                                </code>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    Usage
                                </div>
                                <div className="mt-1">
                                    <span className="font-medium">
                                        {link.used_count}
                                    </span>{' '}
                                    / {link.max_uses}
                                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${(link.used_count / link.max_uses) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {link.remaining_uses} remaining uses
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    Expiration
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {link.expires_at
                                            ? new Date(
                                                  link.expires_at,
                                              ).toLocaleString()
                                            : 'Never expires'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Quiz Attempts
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {total_attempts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Out of {link.used_count} total clicks
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Average Score
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {average_score}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all attempts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pass Rate
                            </CardTitle>
                            <Award className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pass_rate}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((pass_rate / 100) * total_attempts)}{' '}
                                students passed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sessions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Access Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Access Time</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Result</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No access sessions recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sessions.map((session, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span>
                                                        {new Date(
                                                            session.accessed_at,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    <code className="text-xs">
                                                        {session.ip_address}
                                                    </code>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {session.score !== null ? (
                                                    <span
                                                        className={`font-medium ${getScoreColor(session.score)}`}
                                                    >
                                                        {session.score}%
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {session.score !== null &&
                                                    (session.is_passed ? (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-500"
                                                        >
                                                            <CheckCircle className="mr-1 h-3 w-3" />{' '}
                                                            Passed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            <XCircle className="mr-1 h-3 w-3" />{' '}
                                                            Failed
                                                        </Badge>
                                                    ))}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
