// ── Shared page props extension ───────────────────────────────────────────────
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import type { Auth } from './auth';

export type WeCanPageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T &
    InertiaPageProps & {
        name: string;
        auth: Auth;
        userRoles: string[];
        userPermissions: string[];
        hasAccess: boolean;
        flash: { success?: string; error?: string };
        sidebarOpen: boolean;
    };

// ── Quiz ─────────────────────────────────────────────────────────────────────

export type QuizOption = {
    id: number;
    option_text: string;
};

export type QuizOptionReview = {
    id: number;
    text: string;
    is_correct: boolean;
};

export type QuizQuestion = {
    id: number;
    question_text: string;
    image_path: string | null;
    category: string;
    options: QuizOption[];
};

export type QuizAttemptMeta = {
    id: number;
    remainingSeconds: number;
    totalQuestions: number;
};

export type QuizResultAttempt = {
    id: number;
    score: number;
    correct_answers: number;
    incorrect_answers: number;
    total_questions: number;
    is_passed: boolean;
    started_at: string;
    ended_at: string;
    is_timed_out: boolean;
};

export type AnswerReview = {
    question_id: number;
    question_text: string;
    image_path: string | null;
    category: string;
    explanation: string | null;
    explanation_audio_url: string | null;
    is_correct: boolean;
    selected_option: string | null;
    correct_option: string | null;
    all_options: QuizOptionReview[];
};

export type RecentAttempt = {
    id: number;
    score: number;
    correct_answers: number;
    incorrect_answers: number;
    total_questions: number;
    is_passed: boolean;
    started_at: string;
    ended_at: string;
};

// ── Payments ─────────────────────────────────────────────────────────────────

export type PaymentRecord = {
    id: number;
    amount: number;
    currency: string;
    payment_method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transaction_id: string | null;
    reference: string | null;
    paid_at: string | null;
    expires_at: string | null;
    created_at: string;
};

// ── Admin ────────────────────────────────────────────────────────────────────

export type AdminStats = {
    totalStudents: number;
    totalQuestions: number;
    totalAttempts: number;
    totalRevenue: number;
    passRate: number;
};

export type PaginatedData<T> = {
    data: T[];
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

export type AdminQuestionRow = {
    id: number;
    question_text: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    is_active: boolean;
    options_count: number;
};

export type AdminUserRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    roles: string[];
    has_access: boolean;
    is_active: boolean;
    total_attempts: number;
    pass_rate: number;
    created_at: string;
};

export type AdminPaymentRow = {
    id: number;
    user_name: string;
    user_email: string;
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
    transaction_id: string | null;
    paid_at: string | null;
    expires_at: string | null;
};

export interface PricingPlan {
    id: number;
    name: string;
    description: string;
    amount: number;
    currency: string;
    duration_days: number;
    duration_label: string;
    features: string[];
    badge_label: string | null;
    is_featured: boolean;
    is_active: boolean;
}
