// resources/js/pages/guest/results.tsx
import { useState } from 'react';
import { router, Head } from '@inertiajs/react';
import {
    CheckCircle,
    XCircle,
    Award,
    RotateCcw,
    Home,
    Trophy,
    Target,
    BarChart3,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    TrendingDown,
    Sparkles,
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
import { cn } from '@/lib/utils';

interface Answer {
    question_id: number;
    question_text: string;
    image_path: string | null;
    category: string;
    explanation: string | null;
    is_correct: boolean;
    selected_option: string;
    correct_option: string;
    all_options?: Array<{ id: number; text: string; is_correct: boolean }>;
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
    };
    answers: Answer[];
}

export default function GuestResults({ token, attempt, answers }: Props) {
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(
        null,
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
        router.get(`/shared/quiz/${token}/start`);
    };

    const handleBackToHome = () => {
        window.location.href = '/';
    };

    return (
        <>
            <Head title="Quiz Results" />

            <div className="min-h-screen bg-background py-8">
                <div className="container mx-auto max-w-4xl px-4">
                    {/* ─── Header ───────────────────────────────────────────── */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-foreground">
                            Quiz Results
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review your performance and see where you can
                            improve
                        </p>
                    </div>

                    {/* ─── Score Card ───────────────────────────────────────── */}
                    <Card
                        className={cn(
                            'mb-6 overflow-hidden border-2',
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
                                {passed ? '🎉 You Passed!' : 'Keep Practicing!'}
                            </CardTitle>
                            <CardDescription className="text-lg font-semibold text-foreground">
                                {scoreOutOf20} / {total} • {scoreOutOf100}%
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* ─── Stats Grid ──────────────────────────────── */}
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

                            {/* ─── Progress Bar ────────────────────────────── */}
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
                                            transform: 'translateX(-50%)',
                                        }}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-muted-foreground">
                                                Pass
                                            </span>
                                            <span className="text-[10px] font-bold text-primary">
                                                {passingScoreOutOf20}/{total} (
                                                {passingPercentage}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Score Details ───────────────────────────── */}
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
                                        Passing: {passingScoreOutOf20} / {total}
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

                            {/* ─── Result Message ──────────────────────────── */}
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
                                        You got {correct}/{total} correct! You
                                        passed!
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="mr-2 inline h-4 w-4" />
                                        You got {correct}/{total} correct. You
                                        need {passingScoreOutOf20}/{total} to
                                        pass.
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ─── Detailed Answers ────────────────────────────────── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="h-4 w-4" />
                                Detailed Answers
                            </CardTitle>
                            <CardDescription>
                                {answers.filter((a) => a.is_correct).length} of{' '}
                                {answers.length} correct
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {answers.map((answer, index) => (
                                <div
                                    key={answer.question_id}
                                    className={cn(
                                        'rounded-lg border p-4 transition-all',
                                        answer.is_correct
                                            ? 'border-l-4 border-l-green-500'
                                            : 'border-l-4 border-l-red-500',
                                    )}
                                >
                                    {/* ─── Question Header ──────────────────── */}
                                    <div
                                        className="flex cursor-pointer items-start justify-between"
                                        onClick={() =>
                                            setExpandedQuestion(
                                                expandedQuestion === index
                                                    ? null
                                                    : index,
                                            )
                                        }
                                    >
                                        <div className="flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-medium text-foreground">
                                                    Question {index + 1}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {answer.category ||
                                                        'General'}
                                                </Badge>
                                                {answer.is_correct ? (
                                                    <Badge
                                                        variant="success"
                                                        className="text-xs"
                                                    >
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Correct
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                        Incorrect
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                {answer.question_text}
                                            </p>
                                        </div>
                                        <div className="ml-4 shrink-0">
                                            {expandedQuestion === index ? (
                                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>

                                    {/* ─── Expanded Content ────────────────── */}
                                    {expandedQuestion === index && (
                                        <div className="mt-4 space-y-3 border-t pt-4">
                                            {/* ─── Selected Answer ──────────── */}
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {answer.is_correct ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Your answer:
                                                    </p>
                                                    <p
                                                        className={cn(
                                                            'text-sm font-medium',
                                                            answer.is_correct
                                                                ? 'text-green-600'
                                                                : 'text-red-600',
                                                        )}
                                                    >
                                                        {answer.selected_option ||
                                                            'Not answered'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* ─── Correct Answer ───────────── */}
                                            {!answer.is_correct && (
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Correct answer:
                                                        </p>
                                                        <p className="text-sm font-medium text-green-600">
                                                            {
                                                                answer.correct_option
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ─── Explanation ───────────────── */}
                                            {answer.explanation && (
                                                <div className="mt-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                        Explanation:
                                                    </p>
                                                    <p className="text-sm text-blue-600 dark:text-blue-300">
                                                        {answer.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* ─── Action Buttons ───────────────────────────────────── */}
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Button onClick={handleTryAgain} className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Button
                            onClick={handleBackToHome}
                            variant="outline"
                            className="gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
