// resources/js/pages/public/quiz.tsx
import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';
import {
    AlertTriangle,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock,
    LayoutGrid,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Question {
    id: number;
    question_text: string;
    image_path: string | null;
    category: string;
    options: Array<{
        id: number;
        option_text: string;
        image_path: string | null;
    }>;
}

interface Props {
    token: string;
    attempt: {
        id: number;
        remainingSeconds: number;
        totalQuestions: number;
    };
    questions: Question[];
    savedAnswers: Record<number, number>;
}

// ── Helper function to get correct image URL ──────────────────────────────
const getImageUrl = (path: string | null): string | null => {
    if (!path) return null;

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (path.startsWith('storage/')) {
        return '/' + path;
    }

    if (path.startsWith('/')) {
        return path;
    }

    return '/storage/' + path;
};

// ── Isolated Countdown Timer ───────────────────────────────────────────────
const CountdownTimer = memo(
    ({
        initialSeconds,
        onExpire,
    }: {
        initialSeconds: number;
        onExpire: () => void;
    }) => {
        const [timeLeft, setTimeLeft] = useState(initialSeconds);
        const hasExpired = useRef(false);

        useEffect(() => {
            if (timeLeft <= 0) {
                if (!hasExpired.current) {
                    hasExpired.current = true;
                    onExpire();
                }
                return;
            }

            const id = setInterval(() => {
                setTimeLeft((t) => {
                    if (t <= 1) {
                        clearInterval(id);
                        if (!hasExpired.current) {
                            hasExpired.current = true;
                            onExpire();
                        }
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);

            return () => clearInterval(id);
        }, [onExpire, timeLeft]);

        const fmt = (s: number) =>
            `${Math.floor(s / 60)
                .toString()
                .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
        const timerColor =
            timeLeft <= 60
                ? 'text-red-500 animate-pulse'
                : timeLeft <= 300
                  ? 'text-yellow-500'
                  : 'text-foreground';

        return (
            <div
                className={cn(
                    'flex items-center gap-1.5 text-lg font-bold tabular-nums',
                    timerColor,
                )}
            >
                <Clock className="h-5 w-5" />
                {fmt(timeLeft)}
            </div>
        );
    },
);
CountdownTimer.displayName = 'CountdownTimer';

export default function PublicQuiz({
    token,
    attempt,
    questions,
    savedAnswers,
}: Props) {
    const [answers, setAnswers] = useState<Record<number, number>>(
        savedAnswers ?? {},
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showMobileGrid, setShowMobileGrid] = useState(false);
    const debounce = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    const totalQuestions = attempt.totalQuestions;
    const current = questions[currentIndex];
    const answered = Object.keys(answers).length;
    const progress =
        totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    // ── Save answer using axios ─────────────────────────────────────────────
    const saveAnswer = useCallback(
        async (qid: number, oid: number) => {
            // Clear any existing debounce for this question
            clearTimeout(debounce.current[qid]);

            debounce.current[qid] = setTimeout(async () => {
                try {
                    await axios.post(
                        `/public/quiz/${token}/take/${attempt.id}/save`,
                        { question_id: qid, option_id: oid },
                        {
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest',
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                            },
                        },
                    );
                    // Optional: show success toast (but we don't want to spam)
                    // toast.success('Answer saved');
                } catch (error) {
                    console.error('Failed to save answer:', error);
                    toast.error(
                        'Failed to save your answer. Please try again.',
                    );
                }
            }, 400);
        },
        [token, attempt.id],
    );

    const selectAnswer = useCallback(
        (qid: number, oid: number) => {
            setAnswers((prev) => ({ ...prev, [qid]: oid }));
            saveAnswer(qid, oid);
        },
        [saveAnswer],
    );

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(() => {
        if (submitting) return;
        setSubmitting(true);
        router.post(
            `/public/quiz/${token}/take/${attempt.id}/submit`,
            { answers },
            {
                preserveState: false,
                onSuccess: () => toast.success('Quiz submitted successfully!'),
                onError: () => {
                    toast.error('Failed to submit quiz. Please try again.');
                    setSubmitting(false);
                },
            },
        );
    }, [token, attempt.id, answers, submitting]);

    const handleAutoSubmit = useCallback(() => {
        toast.warning('Time is up! Submitting your quiz…');
        handleSubmit();
    }, [handleSubmit]);

    // ── Keyboard Navigation ───────────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showConfirm || showMobileGrid) return;

            if (e.key === 'ArrowLeft') {
                setCurrentIndex((i) => Math.max(0, i - 1));
            } else if (e.key === 'ArrowRight') {
                setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1));
            } else if (
                ['1', '2', '3', '4', 'a', 'b', 'c', 'd'].includes(
                    e.key.toLowerCase(),
                )
            ) {
                const map: Record<string, number> = {
                    '1': 0,
                    a: 0,
                    '2': 1,
                    b: 1,
                    '3': 2,
                    c: 2,
                    '4': 3,
                    d: 3,
                };
                const optIndex = map[e.key.toLowerCase()];
                const targetOption = current?.options[optIndex];
                if (targetOption) {
                    selectAnswer(current.id, targetOption.id);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        currentIndex,
        questions,
        showConfirm,
        showMobileGrid,
        selectAnswer,
        totalQuestions,
        current,
    ]);

    // ── Render Grid ──────────────────────────────────────────────────────────
    const renderGrid = () => (
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6 lg:grid-cols-5">
            {questions.map((q, i) => {
                const isAns = !!answers[q.id];
                const isCur = i === currentIndex;
                return (
                    <button
                        key={q.id}
                        onClick={() => {
                            setCurrentIndex(i);
                            setShowMobileGrid(false);
                        }}
                        className={cn(
                            'aspect-square rounded-md text-xs font-semibold transition hover:scale-105 active:scale-95',
                            isCur &&
                                'ring-2 ring-primary ring-offset-1 dark:ring-offset-background',
                            isAns
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/70',
                        )}
                    >
                        {i + 1}
                    </button>
                );
            })}
        </div>
    );

    if (!current) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading…</p>
            </div>
        );
    }

    const questionImageUrl = getImageUrl(current.image_path);

    return (
        <>
            <Head title="Practice Quiz - WeCanDrivingSchool" />
            <div className="flex min-h-screen flex-col bg-background md:bg-muted/20">
                <header className="sticky top-0 z-40 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <span className="hidden text-lg font-semibold text-primary md:block">
                                WeCanDrivingSchool
                            </span>
                            <span className="hidden text-muted-foreground md:block">
                                ·
                            </span>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    Question {currentIndex + 1} of{' '}
                                    {totalQuestions}
                                </span>
                                <span className="text-xs text-muted-foreground md:hidden">
                                    {answered} completed
                                </span>
                            </div>
                        </div>

                        <CountdownTimer
                            initialSeconds={attempt.remainingSeconds}
                            onExpire={handleAutoSubmit}
                        />

                        <Button
                            size="sm"
                            className="hidden shadow-sm transition hover:shadow md:flex"
                            onClick={() => setShowConfirm(true)}
                            disabled={submitting}
                        >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            {submitting ? 'Submitting…' : 'Submit Quiz'}
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="flex border-primary/20 text-primary hover:bg-primary/10 md:hidden"
                            onClick={() => setShowMobileGrid(true)}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="h-1 w-full bg-muted/50">
                        <div
                            className="h-1 bg-primary/80 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 py-6 pb-24 md:py-8 md:pb-8 lg:flex-row">
                    <div className="flex-1 animate-in duration-300 fade-in slide-in-from-bottom-2">
                        <Card className="border-muted shadow-sm md:shadow-md">
                            <CardContent className="p-5 md:p-8">
                                <div className="mb-5 flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-primary/10 px-3 py-1 font-medium text-primary transition-colors hover:bg-primary/20"
                                    >
                                        Question {currentIndex + 1}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="px-3 py-1 font-medium"
                                    >
                                        {current.category}
                                    </Badge>
                                </div>

                                <h2 className="mb-8 text-xl leading-relaxed font-bold text-foreground md:text-2xl">
                                    {current.question_text}
                                </h2>

                                {questionImageUrl && (
                                    <div className="mb-6 flex justify-center">
                                        <img
                                            src={questionImageUrl}
                                            alt="Question illustration"
                                            className="max-h-64 w-auto rounded-xl border border-muted object-contain shadow-sm"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {current.options.map((opt, i) => {
                                        const selected =
                                            answers[current.id] === opt.id;
                                        const optionImageUrl = getImageUrl(
                                            opt.image_path,
                                        );
                                        const hasText =
                                            opt.option_text?.trim()?.length > 0;
                                        const hasImage = !!optionImageUrl;

                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() =>
                                                    selectAnswer(
                                                        current.id,
                                                        opt.id,
                                                    )
                                                }
                                                className={cn(
                                                    'group relative flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left text-[15px] font-medium transition-all duration-200 ease-in-out',
                                                    selected
                                                        ? 'scale-[1.01] border-primary bg-primary/5 text-primary shadow-sm'
                                                        : 'border-muted bg-background hover:border-primary/40 hover:bg-muted/30 active:scale-[0.99]',
                                                    !hasText &&
                                                        hasImage &&
                                                        'justify-center',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-200',
                                                        selected
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-muted-foreground/30 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary',
                                                        !hasText && 'sr-only',
                                                    )}
                                                >
                                                    {labels[i]}
                                                </span>

                                                <div className="flex flex-1 items-center gap-4">
                                                    {hasText && (
                                                        <span className="leading-snug">
                                                            {opt.option_text}
                                                        </span>
                                                    )}
                                                    {hasImage && (
                                                        <div
                                                            className={cn(
                                                                'flex-shrink-0',
                                                                !hasText &&
                                                                    'mx-auto',
                                                            )}
                                                        >
                                                            <img
                                                                src={
                                                                    optionImageUrl
                                                                }
                                                                alt={`Option ${labels[i]}`}
                                                                className={cn(
                                                                    'rounded-lg border object-contain transition-all',
                                                                    selected
                                                                        ? 'border-primary shadow-md'
                                                                        : 'border-muted group-hover:border-primary/40',
                                                                    hasText
                                                                        ? 'h-16 w-16'
                                                                        : 'h-32 w-auto max-w-full',
                                                                )}
                                                                loading="lazy"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    (
                                                                        e.target as HTMLImageElement
                                                                    ).style.display =
                                                                        'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex items-center justify-between">
                            <Button
                                variant="outline"
                                className="h-12 px-6 shadow-sm disabled:opacity-50"
                                onClick={() =>
                                    setCurrentIndex((i) => Math.max(0, i - 1))
                                }
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" />{' '}
                                Previous
                            </Button>

                            <span className="hidden text-sm font-medium text-muted-foreground md:inline-block">
                                Keyboard: Use{' '}
                                <kbd className="mx-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                                    ←
                                </kbd>{' '}
                                <kbd className="mx-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                                    →
                                </kbd>{' '}
                                to navigate
                            </span>

                            <Button
                                className="h-12 px-6 shadow-sm disabled:opacity-50"
                                onClick={() =>
                                    setCurrentIndex((i) =>
                                        Math.min(totalQuestions - 1, i + 1),
                                    )
                                }
                                disabled={currentIndex === totalQuestions - 1}
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <aside className="hidden w-64 shrink-0 lg:block">
                        <Card className="sticky top-24 border-muted shadow-sm">
                            <CardContent className="p-5">
                                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    <LayoutGrid className="h-4 w-4" />
                                    Question Grid
                                </h3>

                                {renderGrid()}

                                <div className="mt-5 space-y-2 rounded-lg border border-muted/50 bg-muted/30 p-3 text-sm text-foreground">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-3 w-3 rounded-full bg-primary" />
                                            <span>Answered</span>
                                        </div>
                                        <span className="font-semibold">
                                            {answered}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block h-3 w-3 rounded-full border border-muted-foreground/20 bg-muted" />
                                            <span>Unanswered</span>
                                        </div>
                                        <span className="font-semibold">
                                            {totalQuestions - answered}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="mt-6 w-full shadow-sm"
                                    size="lg"
                                    onClick={() => setShowConfirm(true)}
                                    disabled={submitting}
                                >
                                    <CheckSquare className="mr-2 h-5 w-5" />
                                    Submit Quiz
                                </Button>
                            </CardContent>
                        </Card>
                    </aside>
                </main>

                <div className="fixed right-0 bottom-0 left-0 z-40 border-t bg-background p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden">
                    <Button
                        className="w-full text-base font-semibold shadow"
                        size="lg"
                        onClick={() => setShowConfirm(true)}
                        disabled={submitting}
                    >
                        <CheckSquare className="mr-2 h-5 w-5" />
                        {submitting ? 'Submitting…' : 'Submit Quiz Now'}
                    </Button>
                </div>

                {showMobileGrid && (
                    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
                        <div
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setShowMobileGrid(false)}
                        />
                        <div className="relative isolate w-full animate-in rounded-t-2xl border-t bg-background px-6 py-6 pb-12 shadow-2xl slide-in-from-bottom">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                    <LayoutGrid className="h-5 w-5 text-primary" />
                                    Navigate Questions
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="-mr-2 rounded-full"
                                    onClick={() => setShowMobileGrid(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="mb-6 max-h-[50vh] overflow-y-auto px-1 py-1">
                                {renderGrid()}
                            </div>
                            <div className="flex items-center justify-around rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-primary shadow-sm" />
                                    {answered} Answered
                                </div>
                                <div className="h-6 w-px bg-border" />
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full border border-muted-foreground/30 bg-muted shadow-sm" />
                                    {totalQuestions - answered} Left
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 px-4 backdrop-blur-sm duration-200 zoom-in-95 fade-in">
                        <Card className="w-full max-w-sm border-muted shadow-2xl">
                            <CardContent className="p-6">
                                <div className="mb-5 flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                        <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-bold">
                                        Ready to submit?
                                    </h3>
                                </div>

                                <div className="mb-6 space-y-3">
                                    <p className="text-[15px] leading-relaxed text-muted-foreground">
                                        You have answered{' '}
                                        <strong className="text-foreground">
                                            {answered}
                                        </strong>{' '}
                                        of{' '}
                                        <strong className="text-foreground">
                                            {totalQuestions}
                                        </strong>{' '}
                                        questions.
                                    </p>
                                    {answered < totalQuestions && (
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                                            <p className="flex items-start gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-400">
                                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                                <span>
                                                    {totalQuestions - answered}{' '}
                                                    unanswered questions will be
                                                    marked incorrect.
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 font-semibold"
                                        onClick={() => setShowConfirm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 font-semibold"
                                        onClick={() => {
                                            setShowConfirm(false);
                                            handleSubmit();
                                        }}
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? 'Submitting…'
                                            : 'Submit Quiz'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
