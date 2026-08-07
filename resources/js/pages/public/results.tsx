// resources/js/pages/public/results.tsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    XCircle,
    Lock,
    ArrowLeft,
    RefreshCw,
    Award,
    Target,
    BarChart3,
    Trophy,
    Star,
    ChevronDown,
    ChevronUp,
    Home,
    RotateCcw,
    CreditCard,
    Sparkles,
    GraduationCap,
    LayoutDashboard,
    FileText,
    TrendingUp,
    TrendingDown,
    Zap,
    Clock,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Answer {
    question_id: number;
    question_text: string;
    image_path: string | null;
    category: string;
    explanation: string;
    is_correct: boolean;
    selected_option: string;
    selected_option_image: string | null;
    correct_option: string;
    correct_option_image: string | null;
    all_options: {
        id: number;
        text: string;
        image_path: string | null;
        is_correct: boolean;
    }[];
}

interface Props {
    token: string;
    attempt: {
        id: number;
        score: number;
        correct_answers: number;
        incorrect_answers: number;
        total_questions: number;
        is_passed: boolean;
        user_name: string;
        completed_at: string;
        attempt_number: number;
        max_attempts: number;
        passing_score: number;
        passing_required: string;
    };
    answers: Answer[];
    link: {
        id: number;
        name: string;
        remaining_attempts: number;
        max_attempts: number;
    };
    plans: any[];
    showUpgradeModal: boolean;
    remainingIpAttempts: number;
    maxAttemptsPerIp: number;
    hasRemainingAttempts: boolean;
    canTryAgain: boolean;
    attemptHistory?: {
        score: number;
        is_passed: boolean;
        completed_at: string;
        correct: number;
        total: number;
    }[];
}

export default function PublicResults({
    token,
    attempt,
    answers,
    link,
    plans,
    showUpgradeModal,
    remainingIpAttempts,
    maxAttemptsPerIp,
    hasRemainingAttempts,
    canTryAgain,
    attemptHistory = [],
}: Props) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] =
        useState(showUpgradeModal);
    const [isStartingNewQuiz, setIsStartingNewQuiz] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'review'>(
        'overview',
    );

    const passed = attempt.is_passed;
    const correct = attempt.correct_answers;
    const incorrect = attempt.incorrect_answers;
    const total = attempt.total_questions;
    const scoreOutOf20 = correct;
    const scoreOutOf100 = attempt.score;
    const passingScoreOutOf20 = 12;
    const passingPercentage = Math.round((passingScoreOutOf20 / total) * 100);

    const handleTryAgain = () => {
        if (!canTryAgain) return;
        setIsStartingNewQuiz(true);
        router.visit(`/public/quiz/access/${token}`, {
            preserveState: false,
            onFinish: () => {
                setIsStartingNewQuiz(false);
            },
        });
    };

    if (!attempt || !answers) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="mt-4 text-lg font-medium text-foreground">
                        Loading results...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Quiz Results - WeCanDrivingSchool" />

            <div className="min-h-screen bg-background py-8">
                <div className="container mx-auto max-w-4xl px-4">
                    {/* ─── Header ───────────────────────────────────────────── */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Quiz Results
                                </h1>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {attempt.user_name}
                                    </span>

                                    <span className="text-muted-foreground/30">
                                        •
                                    </span>
                                    <span>
                                        {new Date(
                                            attempt.completed_at,
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className="text-sm font-medium"
                                >
                                    {remainingIpAttempts} attempts remaining
                                </Badge>
                                {hasRemainingAttempts ? (
                                    <Badge className="text-sm font-medium">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        {remainingIpAttempts} of{' '}
                                        {maxAttemptsPerIp} left
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="destructive"
                                        className="text-sm font-medium"
                                    >
                                        <XCircle className="mr-1 h-3 w-3" />
                                        No attempts left
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* ─── Tabs ────────────────────────────────────────── */}
                        <Tabs
                            defaultValue="overview"
                            className="w-full"
                            onValueChange={(value) =>
                                setActiveTab(value as 'overview' | 'review')
                            }
                        >
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger
                                    value="overview"
                                    className="flex items-center gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="review"
                                    className="flex items-center gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Review Answers
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* ─── Tab Content ──────────────────────────────────────── */}
                    {activeTab === 'overview' ? (
                        <div className="space-y-6">
                            {/* ─── Score Card ──────────────────────────────── */}
                            <Card
                                className={cn(
                                    'overflow-hidden border-2',
                                    passed
                                        ? 'border-green-500/50'
                                        : 'border-red-500/50',
                                )}
                            >
                                <div
                                    className={cn(
                                        'absolute top-0 left-0 h-1 w-full',
                                        passed ? 'bg-green-500' : 'bg-red-500',
                                    )}
                                />
                                <CardHeader className="text-center">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                        {passed ? (
                                            <Trophy className="h-10 w-10 text-green-500" />
                                        ) : (
                                            <Target className="h-10 w-10 text-red-500" />
                                        )}
                                    </div>
                                    <CardTitle className="text-3xl font-bold">
                                        {passed
                                            ? 'You Passed!'
                                            : 'Keep Practicing!'}
                                    </CardTitle>
                                    <CardDescription className="text-lg font-semibold text-foreground">
                                        {correct} / {total} • {scoreOutOf100}%
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* ─── Stats Grid ──────────────────────── */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/20">
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {correct}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Correct
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/20">
                                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {incorrect}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Incorrect
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800/50">
                                            <p className="text-2xl font-bold text-foreground">
                                                {total}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Total
                                            </p>
                                        </div>
                                    </div>

                                    {/* ─── Progress Bar ────────────────────── */}
                                    <div className="mt-6">
                                        <div className="relative">
                                            <Progress
                                                value={scoreOutOf100}
                                                className="h-3"
                                            />
                                            <div
                                                className="absolute -top-6 text-xs font-medium text-primary"
                                                style={{
                                                    left: `${passingPercentage}%`,
                                                    transform:
                                                        'translateX(-50%)',
                                                }}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Pass
                                                    </span>
                                                    <span className="text-[10px] font-bold text-primary">
                                                        {passingScoreOutOf20}/
                                                        {total} (
                                                        {passingPercentage}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ─── Score Details ───────────────────── */}
                                    <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">
                                                Score (out of {total})
                                            </p>
                                            <p
                                                className={cn(
                                                    'text-2xl font-bold',
                                                    passed
                                                        ? 'text-green-600'
                                                        : 'text-red-600',
                                                )}
                                            >
                                                {correct} / {total}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Passing: {passingScoreOutOf20} /{' '}
                                                {total}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">
                                                Score (out of 100)
                                            </p>
                                            <p
                                                className={cn(
                                                    'text-2xl font-bold',
                                                    passed
                                                        ? 'text-green-600'
                                                        : 'text-red-600',
                                                )}
                                            >
                                                {scoreOutOf100}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Passing: {passingPercentage}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* ─── Result Message ──────────────────── */}
                                    <div
                                        className={cn(
                                            'mt-4 rounded-lg p-3 text-center text-sm font-medium',
                                            passed
                                                ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
                                        )}
                                    >
                                        {passed ? (
                                            <>
                                                <CheckCircle className="mr-2 inline h-4 w-4" />
                                                You got {correct}/{total}{' '}
                                                correct! You passed!
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="mr-2 inline h-4 w-4" />
                                                You got {correct}/{total}{' '}
                                                correct. You need{' '}
                                                {passingScoreOutOf20}/{total} to
                                                pass.
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ─── Attempt History ────────────────────────── */}
                            {attemptHistory.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <GraduationCap className="h-4 w-4" />
                                            Attempt History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {attemptHistory.map(
                                                (history, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className={cn(
                                                            'text-sm font-medium',
                                                            history.is_passed
                                                                ? 'border-green-500 text-green-600'
                                                                : 'border-red-500 text-red-600',
                                                        )}
                                                    >
                                                        Attempt {index + 1}:{' '}
                                                        {history.correct}/
                                                        {history.total} (
                                                        {history.score}%){' '}
                                                        {history.is_passed
                                                            ? '✅'
                                                            : '❌'}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        /* ─── Review Answers Tab ──────────────────────────── */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Detailed Review
                                </h3>
                                <Badge variant="outline">
                                    {answers.filter((a) => a.is_correct).length}{' '}
                                    of {answers.length} correct
                                </Badge>
                            </div>

                            <ScrollArea className="h-[600px] rounded-lg border p-4">
                                <div className="space-y-6 pr-4">
                                    {answers.map((answer, index) => (
                                        <Card
                                            key={answer.question_id}
                                            className={cn(
                                                'border-l-4',
                                                answer.is_correct
                                                    ? 'border-l-green-500'
                                                    : 'border-l-red-500',
                                            )}
                                        >
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-sm font-medium">
                                                            Question {index + 1}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs">
                                                            {answer.category}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-xs',
                                                            answer.is_correct
                                                                ? 'border-green-500 text-green-600'
                                                                : 'border-red-500 text-red-600',
                                                        )}
                                                    >
                                                        {answer.is_correct ? (
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                        ) : (
                                                            <XCircle className="mr-1 h-3 w-3" />
                                                        )}
                                                        {answer.is_correct
                                                            ? 'Correct'
                                                            : 'Incorrect'}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <p className="text-sm font-medium">
                                                    {answer.question_text}
                                                </p>

                                                {answer.image_path && (
                                                    <img
                                                        src={answer.image_path}
                                                        alt="Question"
                                                        className="max-h-32 rounded-lg object-contain"
                                                        onError={(e) => {
                                                            (
                                                                e.target as HTMLImageElement
                                                            ).style.display =
                                                                'none';
                                                        }}
                                                    />
                                                )}

                                                <div className="space-y-1.5">
                                                    {answer.all_options.map(
                                                        (option) => {
                                                            const isSelected =
                                                                option.text ===
                                                                answer.selected_option;
                                                            const isCorrect =
                                                                option.is_correct;

                                                            let className =
                                                                'flex items-center gap-3 rounded-lg border p-3 text-sm';
                                                            if (isCorrect) {
                                                                className +=
                                                                    ' border-green-500 bg-green-50 dark:bg-green-950/20';
                                                            } else if (
                                                                isSelected &&
                                                                !isCorrect
                                                            ) {
                                                                className +=
                                                                    ' border-red-500 bg-red-50 dark:bg-red-950/20';
                                                            } else {
                                                                className +=
                                                                    ' border-border';
                                                            }

                                                            return (
                                                                <div
                                                                    key={
                                                                        option.id
                                                                    }
                                                                    className={
                                                                        className
                                                                    }
                                                                >
                                                                    <div className="flex-1">
                                                                        {
                                                                            option.text
                                                                        }
                                                                    </div>
                                                                    {isCorrect && (
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    )}
                                                                    {isSelected &&
                                                                        !isCorrect && (
                                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                                        )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>

                                                {answer.explanation && (
                                                    <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                                                        <p className="font-medium">
                                                            Explanation:
                                                        </p>
                                                        <p>
                                                            {answer.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* ─── Actions ──────────────────────────────────────────── */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        {canTryAgain && (
                            <Button
                                onClick={handleTryAgain}
                                disabled={isStartingNewQuiz}
                                className="gap-2"
                            >
                                {isStartingNewQuiz ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="h-4 w-4" />
                                        Try Again ({remainingIpAttempts}{' '}
                                        attempts left)
                                    </>
                                )}
                            </Button>
                        )}
                        <Link href="/">
                            <Button variant="ghost" className="gap-2">
                                <Home className="h-4 w-4" />
                                Return Home
                            </Button>
                        </Link>
                    </div>

                    {/* ─── Upgrade Banner ──────────────────────────────────── */}
                    {!hasRemainingAttempts && (
                        <Card className="mt-8 border-primary/50 bg-primary/5">
                            <CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row md:justify-between md:text-left">
                                <div className="flex-1">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Ready for Unlimited Practice?
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        You've used all {maxAttemptsPerIp} free
                                        attempts. Upgrade to get unlimited
                                        access to all quizzes!
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="shrink-0 gap-2"
                                >
                                    <Lock className="h-4 w-4" />
                                    Get Full Access
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* ─── Single Column Scrollable Payment Modal ────────────────── */}
            <Dialog
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
            >
                <DialogContent className="flex max-h-[85vh] max-w-md flex-col overflow-hidden p-0">
                    {/* ─── Fixed Header ────────────────────────────────────── */}
                    <div className="shrink-0 border-b bg-muted/30 px-5 py-3.5">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                <Award className="h-5 w-5 text-primary" />
                                Get Full Access
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Choose a plan to continue practicing unlimited.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* ─── Scrollable Content ────────────────────────────── */}
                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {plans &&
                            plans.map((plan) => {
                                const isPractical = plan.amount >= 100000;
                                const isFeatured = plan.is_featured;

                                return (
                                    <Card
                                        key={plan.id}
                                        className={cn(
                                            'relative transition-all hover:shadow-md',
                                            isFeatured
                                                ? 'border-2 border-primary shadow-sm'
                                                : 'border-border hover:border-primary/30',
                                        )}
                                    >
                                        {/* ─── Badge ─────────────────── */}
                                        {(isFeatured || plan.badge_label) && (
                                            <div className="absolute -top-2.5 right-3">
                                                <Badge
                                                    className={cn(
                                                        'px-2.5 py-0.5 text-[10px] font-semibold',
                                                        isFeatured
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-amber-500 text-white',
                                                    )}
                                                >
                                                    {isFeatured ? (
                                                        <>
                                                            <Star className="mr-1 h-2.5 w-2.5 fill-current" />
                                                            Best Value
                                                        </>
                                                    ) : plan.badge_label ===
                                                      'Most Popular' ? (
                                                        <>
                                                            <Trophy className="mr-1 h-2.5 w-2.5" />
                                                            Popular
                                                        </>
                                                    ) : plan.badge_label ===
                                                      'Includes Practical' ? (
                                                        <>
                                                            <Target className="mr-1 h-2.5 w-2.5" />
                                                            Practical
                                                        </>
                                                    ) : (
                                                        plan.badge_label
                                                    )}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* ─── Card Content ────────── */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="text-sm font-semibold">
                                                        {plan.name}
                                                    </h4>
                                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                                        {plan.description}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-extrabold tracking-tight text-foreground">
                                                        {Number(
                                                            plan.amount,
                                                        ).toLocaleString()}
                                                        <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                                                            {plan.currency}
                                                        </span>
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {plan.duration_label}
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator className="my-2.5" />

                                            <ul className="space-y-1 text-xs">
                                                {plan.features
                                                    ?.slice(0, 2)
                                                    .map((feature: string) => (
                                                        <li
                                                            key={feature}
                                                            className="flex items-start gap-1.5"
                                                        >
                                                            <CheckCircle
                                                                className={cn(
                                                                    'mt-0.5 h-3 w-3 shrink-0',
                                                                    isFeatured
                                                                        ? 'text-primary'
                                                                        : 'text-green-500',
                                                                )}
                                                            />
                                                            <span className="text-muted-foreground">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ))}
                                                {plan.features?.length > 2 && (
                                                    <li className="ml-4.5 text-[10px] text-muted-foreground">
                                                        +
                                                        {plan.features.length -
                                                            2}{' '}
                                                        more features
                                                    </li>
                                                )}
                                            </ul>

                                            <Button
                                                className={cn(
                                                    'mt-2.5 h-8 w-full gap-1.5 text-xs',
                                                    isFeatured
                                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                        : isPractical
                                                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                          : '',
                                                )}
                                                variant={
                                                    isFeatured || isPractical
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() => {
                                                    setIsPaymentModalOpen(
                                                        false,
                                                    );
                                                    router.visit(
                                                        `/student/payment?plan=${plan.id}&token=${token}`,
                                                    );
                                                }}
                                            >
                                                <CreditCard className="h-3.5 w-3.5" />
                                                {isPractical
                                                    ? 'Book Now'
                                                    : 'Get Started'}
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                    </div>

                    {/* ─── Fixed Footer ────────────────────────────────────── */}
                    <div className="shrink-0 border-t bg-muted/30 px-5 py-2.5 text-center">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Continue with free trial later
                            </Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
