// resources/js/pages/public/quiz.tsx
import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Question {
    id: number;
    question_text: string;
    image_path: string | null;
    category: string;
    options: {
        id: number;
        option_text: string;
        image_path: string | null;
    }[];
}

interface Props {
    token: string;
    attempt: {
        id: number;
        totalQuestions: number;
        userName: string;
        startedAt: string;
    };
    questions: Question[];
    savedAnswers: Record<number, number>;
    remainingAttempts: number;
    maxAttempts: number;
}

export default function PublicQuiz({
    token,
    attempt,
    questions,
    savedAnswers,
    remainingAttempts,
    maxAttempts,
}: Props) {
    const [answers, setAnswers] = useState<Record<number, number>>(
        savedAnswers || {},
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20 * 60);
    const [timeUp, setTimeUp] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Timer
    useEffect(() => {
        if (timeLeft <= 0) {
            setTimeUp(true);
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleAnswerSelect = (questionId: number, optionId: number) => {
        // Update local state immediately
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
        setSaveError(null);

        // Auto-save via API
        router.post(
            `/public/quiz/${token}/take/${attempt.id}/save`,
            {
                question_id: questionId,
                option_id: optionId,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Failed to save answer:', errors);
                    setSaveError(
                        'Failed to save your answer. Please try again.',
                    );
                },
            },
        );
    };

    const handleSubmit = () => {
        const answered = Object.keys(answers).length;
        if (answered < questions.length) {
            if (
                !confirm(
                    `You've answered ${answered} out of ${questions.length} questions. Submit anyway?`,
                )
            ) {
                return;
            }
        }

        setIsSubmitting(true);
        router.post(
            `/public/quiz/${token}/take/${attempt.id}/submit`,
            { answers },
            {
                preserveState: false,
                onSuccess: () => setIsSubmitting(false),
                onError: () => setIsSubmitting(false),
            },
        );
    };

    const answeredCount = Object.keys(answers).length;
    const progress =
        questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (!questions || questions.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-medium text-[#1B2A4A]">
                        Loading questions...
                    </p>
                    <p className="text-sm text-gray-500">
                        Please wait a moment
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Public Quiz - WeCanDrivingSchool" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-4xl px-4">
                    {/* Header */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1B2A4A]">
                                Practice Quiz
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <span>
                                    {remainingAttempts} attempts remaining
                                </span>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {attempt.userName}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-sm">
                                {answeredCount} / {questions.length} answered
                            </Badge>
                            <div
                                className={`flex items-center gap-2 text-sm font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}
                            >
                                <Clock className="h-4 w-4" />
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <Progress value={progress} className="mb-6 h-2" />

                    {/* Error message */}
                    {saveError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{saveError}</AlertDescription>
                        </Alert>
                    )}

                    {/* Time Up Alert */}
                    {timeUp && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Time's Up!</AlertTitle>
                            <AlertDescription>
                                Your quiz will be automatically submitted.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Questions */}
                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <Card key={question.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">
                                                Question {index + 1} of{' '}
                                                {questions.length}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500">
                                                {question.category}
                                            </p>
                                        </div>
                                        {answers[question.id] && (
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0"
                                            >
                                                Answered
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-lg font-medium">
                                        {question.question_text}
                                    </p>

                                    {question.image_path && (
                                        <img
                                            src={question.image_path}
                                            alt="Question"
                                            className="mb-4 max-h-48 rounded-lg object-contain"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).style.display = 'none';
                                            }}
                                        />
                                    )}

                                    <RadioGroup
                                        value={
                                            answers[question.id]?.toString() ||
                                            ''
                                        }
                                        onValueChange={(value) =>
                                            handleAnswerSelect(
                                                question.id,
                                                parseInt(value),
                                            )
                                        }
                                        className="space-y-3"
                                    >
                                        {question.options.map((option) => (
                                            <div
                                                key={option.id}
                                                className={`flex items-center space-x-3 rounded-lg border p-4 transition ${
                                                    answers[question.id] ===
                                                    option.id
                                                        ? 'border-[#F5C518] bg-[#FEF3C7]'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <RadioGroupItem
                                                    value={option.id.toString()}
                                                    id={`q${question.id}-o${option.id}`}
                                                />
                                                <Label
                                                    htmlFor={`q${question.id}-o${option.id}`}
                                                    className="flex-1 cursor-pointer text-sm"
                                                >
                                                    {option.option_text}
                                                    {option.image_path && (
                                                        <img
                                                            src={
                                                                option.image_path
                                                            }
                                                            alt="Option"
                                                            className="mt-2 max-h-32 rounded-lg object-contain"
                                                            onError={(e) => {
                                                                (
                                                                    e.target as HTMLImageElement
                                                                ).style.display =
                                                                    'none';
                                                            }}
                                                        />
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="sticky bottom-0 mt-8 border-t bg-white/95 p-4 backdrop-blur-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="text-sm text-gray-500">
                                {answeredCount} of {questions.length} questions
                                answered
                                {answeredCount < questions.length && (
                                    <span className="ml-2 text-yellow-600">
                                        ({questions.length - answeredCount}{' '}
                                        remaining)
                                    </span>
                                )}
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || timeUp}
                            >
                                {isSubmitting
                                    ? 'Submitting...'
                                    : timeUp
                                      ? 'Auto-submitting...'
                                      : 'Submit Quiz'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
