// resources/js/pages/public/results.tsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    XCircle,
    Lock,
    ArrowLeft,
    Users,
    Award,
    RefreshCw,
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
} from '@/components/ui/dialog';

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
    const [showAllAnswers, setShowAllAnswers] = useState(false);
    const [isStartingNewQuiz, setIsStartingNewQuiz] = useState(false);

    const passed = attempt.is_passed;
    const isLastAttempt = attempt.attempt_number >= maxAttemptsPerIp;

    // ─── Handle Try Again - Go directly to fresh quiz ───
    const handleTryAgain = () => {
        if (!canTryAgain) return;

        setIsStartingNewQuiz(true);

        // Redirect to access page which will detect completed attempts
        // and create a fresh quiz automatically
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
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#F5C518]"></div>
                    <p className="mt-4 text-lg font-medium text-[#1B2A4A]">
                        Loading results...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Quiz Results - WeCanDrivingSchool" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-4xl px-4">
                    {/* Header */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1B2A4A]">
                                Quiz Results
                            </h1>
                            <p className="text-sm text-gray-500">
                                {attempt.user_name} • Attempt{' '}
                                {attempt.attempt_number} of{' '}
                                {attempt.max_attempts}
                            </p>
                            <p className="text-xs text-gray-400">
                                Completed{' '}
                                {new Date(
                                    attempt.completed_at,
                                ).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-sm">
                                {remainingIpAttempts} attempts remaining
                            </Badge>
                            {hasRemainingAttempts ? (
                                <Badge
                                    variant="outline"
                                    className="border-green-500 text-green-600"
                                >
                                    ✅ {remainingIpAttempts} of{' '}
                                    {maxAttemptsPerIp} left
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="border-red-500 text-red-600"
                                >
                                    ⚠️ No attempts left
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Attempt History */}
                    {attemptHistory.length > 0 && (
                        <Card className="mb-6 bg-gray-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Attempt History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {attemptHistory.map((history, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className={
                                                history.is_passed
                                                    ? 'border-green-500 text-green-600'
                                                    : 'border-red-500 text-red-600'
                                            }
                                        >
                                            Attempt {index + 1}: {history.score}
                                            % {history.is_passed ? '✅' : '❌'}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Score Card */}
                    <Card
                        className={`mb-8 ${passed ? 'border-green-500' : 'border-red-500'}`}
                    >
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                                {passed ? (
                                    <CheckCircle className="h-16 w-16 text-green-500" />
                                ) : (
                                    <XCircle className="h-16 w-16 text-red-500" />
                                )}
                            </div>
                            <CardTitle className="text-3xl font-bold">
                                {passed ? '🎉 You Passed!' : 'Keep Practicing!'}
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Score: {attempt.score}%
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">
                                        {attempt.correct_answers}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Correct
                                    </p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-600">
                                        {attempt.incorrect_answers}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Incorrect
                                    </p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#1B2A4A]">
                                        {attempt.total_questions}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Total
                                    </p>
                                </div>
                            </div>
                            <Progress
                                value={attempt.score}
                                className="mt-4 h-3"
                            />
                            <p className="mt-2 text-center text-sm text-gray-500">
                                {passed
                                    ? 'You passed! 🎉'
                                    : 'You need 70% to pass. Keep practicing!'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="mb-8 flex flex-wrap gap-4">
                        {canTryAgain && (
                            <Button
                                onClick={handleTryAgain}
                                disabled={isStartingNewQuiz}
                                className="gold-gradient font-bold text-[#1B2A4A]"
                            >
                                {isStartingNewQuiz ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-[#1B2A4A]"></div>
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Try Again ({remainingIpAttempts}{' '}
                                        attempts left)
                                    </>
                                )}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setShowAllAnswers(!showAllAnswers)}
                        >
                            {showAllAnswers ? 'Hide Answers' : 'Review Answers'}
                        </Button>
                        <Link href="/">
                            <Button variant="ghost">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Return Home
                            </Button>
                        </Link>
                    </div>

                    {/* Detailed Answers */}
                    {showAllAnswers && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[#1B2A4A]">
                                Detailed Review
                            </h2>
                            {answers.map((answer, index) => (
                                <Card
                                    key={answer.question_id}
                                    className={
                                        answer.is_correct
                                            ? 'border-green-200'
                                            : 'border-red-200'
                                    }
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base">
                                                    Question {index + 1}
                                                </CardTitle>
                                                <CardDescription>
                                                    {answer.category}
                                                </CardDescription>
                                            </div>
                                            {answer.is_correct ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-green-500 text-green-600"
                                                >
                                                    Correct
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="border-red-500 text-red-600"
                                                >
                                                    Incorrect
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 font-medium">
                                            {answer.question_text}
                                        </p>

                                        {answer.image_path && (
                                            <img
                                                src={answer.image_path}
                                                alt="Question"
                                                className="mb-4 max-h-48 rounded-lg object-contain"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).style.display = 'none';
                                                }}
                                            />
                                        )}

                                        <div className="space-y-2">
                                            {answer.all_options.map(
                                                (option) => (
                                                    <div
                                                        key={option.id}
                                                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                                                            option.is_correct
                                                                ? 'border-green-500 bg-green-50'
                                                                : option.text ===
                                                                        answer.selected_option &&
                                                                    !option.is_correct
                                                                  ? 'border-red-500 bg-red-50'
                                                                  : 'border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="flex-1 text-sm">
                                                            {option.text}
                                                        </div>
                                                        {option.is_correct && (
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        )}
                                                        {option.text ===
                                                            answer.selected_option &&
                                                            !option.is_correct && (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {answer.explanation && (
                                            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                                                <p className="font-medium">
                                                    Explanation:
                                                </p>
                                                <p>{answer.explanation}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Upgrade Modal - Show when no attempts left */}
                    {!hasRemainingAttempts && (
                        <Card className="mt-8 border-[#F5C518] bg-[#FEF3C7]">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[#1B2A4A]">
                                            🚀 Ready for Unlimited Practice?
                                        </h3>
                                        <p className="text-sm text-[#1B2A4A]/70">
                                            You've used all {maxAttemptsPerIp}{' '}
                                            free attempts. Upgrade to get
                                            unlimited access to all quizzes!
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            setIsPaymentModalOpen(true)
                                        }
                                        className="gold-gradient shrink-0 font-bold text-[#1B2A4A]"
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Get Full Access
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
            >
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#1B2A4A]">
                            Get Full Access
                        </DialogTitle>
                        <DialogDescription>
                            You've used all your free attempts. Choose a plan to
                            continue practicing unlimited.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {plans &&
                            plans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`cursor-pointer transition hover:shadow-lg ${plan.is_featured ? 'border-[#F5C518]' : ''}`}
                                >
                                    <CardHeader>
                                        {plan.badge_label && (
                                            <span className="inline-block rounded-full bg-[#F5C518] px-3 py-1 text-xs font-bold text-[#1B2A4A]">
                                                {plan.badge_label}
                                            </span>
                                        )}
                                        <CardTitle>{plan.name}</CardTitle>
                                        <CardDescription>
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold text-[#1B2A4A]">
                                            {Number(
                                                plan.amount,
                                            ).toLocaleString()}
                                            <span className="text-sm font-normal text-gray-500">
                                                {' '}
                                                {plan.currency}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {plan.duration_label}
                                        </p>
                                        <ul className="mt-4 space-y-2 text-sm">
                                            {plan.features?.map(
                                                (feature: string) => (
                                                    <li
                                                        key={feature}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        {feature}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                        <Button
                                            className="gold-gradient mt-4 w-full font-bold text-[#1B2A4A]"
                                            onClick={() => {
                                                setIsPaymentModalOpen(false);
                                                // Redirect to payment page with plan
                                                router.visit(
                                                    `/student/payment?plan=${plan.id}&token=${token}`,
                                                );
                                            }}
                                        >
                                            Get Started
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
