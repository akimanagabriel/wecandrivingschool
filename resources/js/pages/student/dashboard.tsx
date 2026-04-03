import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle, BookOpen, CheckCircle, ChevronRight,
    Clock, Play, Target, TrendingUp, Trophy, XCircle,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { RecentAttempt, WeCanPageProps } from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student/dashboard' },
];

type Props = WeCanPageProps<{
    hasAccess: boolean;
    passRate: number;
    totalAttempts: number;
    bestScore: number;
    recentAttempts: RecentAttempt[];
    activeAttempt: { id: number; remainingSeconds: number } | null;
}>;

export default function StudentDashboard({
    hasAccess, passRate, totalAttempts, bestScore, recentAttempts, activeAttempt,
}: Props) {
    const { flash } = usePage<WeCanPageProps>().props;

    const stats = [
        { label: 'Total Attempts', value: totalAttempts,   icon: BookOpen,    color: 'text-blue-500' },
        { label: 'Best Score',     value: `${bestScore}%`, icon: Trophy,      color: 'text-yellow-500' },
        { label: 'Pass Rate',      value: `${passRate}%`,  icon: TrendingUp,  color: 'text-green-500' },
        { label: 'Pass Mark',      value: '70%',           icon: Target,      color: 'text-purple-500' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading title="My Dashboard" description="Track your quiz progress and results." />

                {/* Flash messages */}
                {flash?.success && (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* No access warning */}
                {!hasAccess && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between gap-4">
                            <span>You need active access to take quizzes.</span>
                            <Button size="sm" onClick={() => router.visit('/student/payment')}>
                                Buy Access — 5,000 RWF
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Active quiz banner */}
                {activeAttempt && (
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 animate-pulse text-blue-500" />
                                <div>
                                    <p className="font-semibold text-blue-800 dark:text-blue-200">Quiz In Progress</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Resume before it expires!</p>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => router.visit(`/quiz/${activeAttempt.id}`)}>
                                <Play className="mr-1 h-3.5 w-3.5" /> Resume
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s) => (
                        <Card key={s.label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                                <s.icon className={`h-4 w-4 ${s.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{s.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Start quiz CTA */}
                {hasAccess && (
                    <Card className="bg-primary text-primary-foreground">
                        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Ready for a new quiz?</h3>
                                <p className="text-sm opacity-80">20 random questions · 20-minute timer · Instant results</p>
                            </div>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="shrink-0 font-bold"
                                onClick={() => router.post('/quiz/start')}
                            >
                                <Play className="mr-2 h-4 w-4" /> Start New Quiz
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Recent attempts */}
                {recentAttempts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Quiz Attempts</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {recentAttempts.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            {a.is_passed
                                                ? <CheckCircle className="h-4 w-4 text-green-500" />
                                                : <XCircle    className="h-4 w-4 text-red-400" />
                                            }
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Score: <span className={a.is_passed ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{a.score}%</span>
                                                    <Badge variant={a.is_passed ? 'default' : 'destructive'} className="ml-2 text-[10px]">
                                                        {a.is_passed ? 'PASS' : 'FAIL'}
                                                    </Badge>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {a.correct_answers}/{a.total_questions} correct
                                                    {a.started_at ? ` · ${new Date(a.started_at).toLocaleDateString()}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => router.visit(`/quiz/${a.id}/results`)} className="gap-1">
                                            View <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {recentAttempts.length === 0 && hasAccess && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-muted-foreground">No quizzes yet — start your first quiz above!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
