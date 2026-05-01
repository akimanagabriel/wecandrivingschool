// resources/js/pages/guest/results.tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { CheckCircle, XCircle, Award, RotateCcw, Home } from 'lucide-react';

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

    const handleTryAgain = () => {
        router.get(`/shared/quiz/${token}/start`);
    };

    const handleBackToHome = () => {
        window.location.href = '/';
    };

    return (
        <>
            <Head title="Quiz Results" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-4xl px-4">
                    {/* Results Summary Card */}
                    <div className="mb-6 rounded-lg bg-white p-6 text-center shadow-md">
                        <h1 className="mb-4 text-2xl font-bold">
                            Quiz Results
                        </h1>

                        <div
                            className={`mb-4 inline-block rounded-full px-6 py-3 text-2xl font-bold ${
                                attempt.is_passed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {attempt.is_passed ? '✓ PASSED!' : '✗ Not Passed'}
                        </div>

                        <div className="mb-2 text-6xl font-bold text-indigo-600">
                            {attempt.score}%
                        </div>

                        <div className="mb-6 text-sm text-gray-500">
                            You answered {attempt.correct_answers} out of{' '}
                            {attempt.total_questions} correctly
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {attempt.correct_answers}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Correct Answers
                                </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="text-2xl font-bold text-red-600">
                                    {attempt.incorrect_answers}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Incorrect Answers
                                </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="text-2xl font-bold text-blue-600">
                                    {attempt.total_questions}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Total Questions
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Answers */}
                    <div className="overflow-hidden rounded-lg bg-white shadow-md">
                        <h2 className="border-b p-4 text-xl font-bold">
                            Detailed Answers
                        </h2>

                        {answers.map((answer, index) => (
                            <div
                                key={answer.question_id}
                                className="border-b last:border-b-0"
                            >
                                <div
                                    className="flex cursor-pointer items-start justify-between p-4 hover:bg-gray-50"
                                    onClick={() =>
                                        setExpandedQuestion(
                                            expandedQuestion === index
                                                ? null
                                                : index,
                                        )
                                    }
                                >
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="text-sm text-gray-500">
                                                Question {index + 1}
                                            </span>
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                                                {answer.category}
                                            </span>
                                        </div>
                                        <p className="font-medium">
                                            {answer.question_text}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        {answer.is_correct ? (
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-500" />
                                        )}
                                    </div>
                                </div>

                                {expandedQuestion === index && (
                                    <div className="bg-gray-50 px-4 pt-0 pb-4">
                                        <div className="mt-2 rounded border bg-white p-3">
                                            <p className="mb-2 text-sm">
                                                <span className="font-semibold">
                                                    Your answer:
                                                </span>{' '}
                                                <span
                                                    className={
                                                        answer.is_correct
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {answer.selected_option ||
                                                        'Not answered'}
                                                </span>
                                            </p>
                                            {!answer.is_correct && (
                                                <p className="mb-2 text-sm">
                                                    <span className="font-semibold text-green-600">
                                                        Correct answer:
                                                    </span>{' '}
                                                    {answer.correct_option}
                                                </p>
                                            )}
                                            {answer.explanation && (
                                                <div className="mt-3 border-t pt-3">
                                                    <p className="mb-1 text-sm font-semibold">
                                                        Explanation:
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {answer.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={handleTryAgain}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Try Again
                        </button>
                        <button
                            onClick={handleBackToHome}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50"
                        >
                            <Home className="h-4 w-4" />
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
