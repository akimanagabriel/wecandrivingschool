/* eslint-disable react-hooks/immutability */
// resources/js/pages/guest/quiz.tsx
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Question {
    id: number;
    question_text: string;
    image_path: string | null;
    category: string;
    options: Array<{ id: number; option_text: string }>;
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

export default function GuestQuiz({
    token,
    attempt,
    questions,
    savedAnswers,
}: Props) {
    const [answers, setAnswers] =
        useState<Record<number, number>>(savedAnswers);
    const [timeLeft, setTimeLeft] = useState(attempt.remainingSeconds);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleAutoSubmit();

            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const handleAutoSubmit = () => {
        if (isSubmitting) {
            return;
        }

        toast.warning('Time is up! Submitting your quiz...');
        handleSubmit();
    };

    const handleAnswerSelect = (questionId: number, optionId: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

        // Auto-save answer
        router.post(
            `/shared/quiz/${token}/save-answer/${attempt.id}`,
            {
                question_id: questionId,
                option_id: optionId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => toast.error('Failed to save answer'),
            },
        );
    };

    const handleSubmit = () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        router.post(
            `/shared/quiz/${token}/submit/${attempt.id}`,
            { answers: answers },
            {
                onSuccess: () => toast.success('Quiz submitted successfully!'),
                onError: () => {
                    toast.error('Failed to submit quiz');
                    setIsSubmitting(false);
                },
            },
        );
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress =
        (Object.keys(answers).length / attempt.totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="sticky top-0 z-10 bg-white shadow-md">
                <div className="mx-auto max-w-7xl px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Guest Quiz Attempt
                            </h2>
                            <p className="text-sm text-gray-500">
                                {Object.keys(answers).length} of{' '}
                                {attempt.totalQuestions} answered
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-600">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-xs text-gray-500">
                                Time Remaining
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
                {questions.map((question, index) => (
                    <div
                        key={question.id}
                        className="rounded-lg bg-white p-6 shadow-md"
                    >
                        <div className="mb-4">
                            <span className="text-sm font-semibold text-indigo-600">
                                Question {index + 1} of {attempt.totalQuestions}
                            </span>
                            <span className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs">
                                {question.category}
                            </span>
                            <h3 className="mt-2 text-lg font-medium">
                                {question.question_text}
                            </h3>
                        </div>

                        {question.image_path && (
                            <img
                                src={question.image_path}
                                alt="Question illustration"
                                className="mb-4 max-h-48 w-auto rounded-lg"
                            />
                        )}

                        <div className="space-y-3">
                            {question.options.map((option) => (
                                <label
                                    key={option.id}
                                    className={`flex cursor-pointer items-center rounded-lg border p-3 transition ${
                                        answers[question.id] === option.id
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question_${question.id}`}
                                        value={option.id}
                                        checked={
                                            answers[question.id] === option.id
                                        }
                                        onChange={() =>
                                            handleAnswerSelect(
                                                question.id,
                                                option.id,
                                            )
                                        }
                                        className="mr-3"
                                    />
                                    <span className="text-gray-700">
                                        {option.option_text}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-center pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
