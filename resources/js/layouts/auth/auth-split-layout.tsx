import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="grid min-h-screen bg-white lg:grid-cols-2">
            {/* LEFT SIDE - HERO */}
            <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#2b1a12] via-[#3a2418] to-[#1f120d] p-12 text-white lg:flex">
                {/* Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff_1px,_transparent_1px)] bg-[size:20px_20px] opacity-20" />

                {/* Logo */}
                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2 text-lg font-semibold"
                >
                    <AppLogoIcon className="size-8 fill-white" />
                    {name}
                </Link>

                {/* Hero Content */}
                <div className="relative z-10 max-w-xl space-y-6">
                    <h1 className="text-4xl leading-tight font-bold">
                        Pass Your{' '}
                        <span className="text-yellow-400">Driving Theory</span>{' '}
                        Test First Time
                    </h1>

                    <p className="text-base text-slate-300">
                        Practice with hundreds of real exam-style questions,
                        timed quizzes, and instant explanations to help you
                        succeed.
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur">
                            400+ Questions
                        </div>
                        <div className="rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur">
                            Timed Exams
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-sm text-slate-400">
                    © {new Date().getFullYear()} {name}
                </p>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md space-y-6">
                    {/* Mobile Logo */}
                    <Link
                        href={home()}
                        className="flex justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10" />
                    </Link>

                    {/* Card */}
                    <div className="rounded-2xl border bg-white p-8 shadow-xl">
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-semibold">{title}</h1>
                            <p className="text-sm text-gray-500">
                                {description}
                            </p>
                        </div>

                        <div className="mt-6">{children}</div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400">
                        By continuing, you agree to our Terms & Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
