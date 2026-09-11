import { Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, MessageCircle, Timer } from 'lucide-react';
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
        <div className="grid min-h-screen bg-background lg:grid-cols-2">
            {/* LEFT SIDE — HERO */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0b1c30f4] via-[#0f2540] to-[#0b1c30] p-12 text-white lg:flex">
                {/* Logo */}
                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2 text-lg font-semibold motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in"
                >
                    <AppLogoIcon className="size-8 rounded-2xl fill-white" />
                    {name}
                </Link>

                {/* Hero content */}
                <div className="relative z-10 max-w-xl space-y-8 motion-safe:animate-in motion-safe:delay-150 motion-safe:duration-700 motion-safe:fill-mode-both motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
                    <h1 className="text-4xl leading-tight font-bold">
                        Pass your driving theory test,{' '}
                        <span className="text-[#f5b942]">first time round</span>
                    </h1>

                    <p className="text-base text-slate-300">
                        Practice with hundreds of real exam-style questions,
                        timed quizzes, and instant explanations to help you
                        succeed.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-full bg-gradient-to-r from-[#f5b942] to-[#fcd97a] px-5 py-2 text-sm font-semibold text-[#0b1c30]">
                            400+ questions
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
                            <Timer className="size-4 text-[#f5b942]" />
                            Timed mock exams
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
                            <CheckCircle2 className="size-4 text-[#f5b942]" />
                            Instant explanations
                        </div>
                    </div>
                </div>

                {/* Footer — tagline + contact */}
                <div className="relative z-10 space-y-4">
                    <p className="text-sm font-medium text-[#f5b942]">
                        Confidence since day one.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                        <a
                            href="https://wa.me/250783286489"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 transition-colors hover:text-[#f5b942]"
                        >
                            <MessageCircle className="size-4" />
                            +250 783 286 489
                        </a>
                        <a
                            href="mailto:mutsimbi01@gmail.com"
                            className="flex items-center gap-2 transition-colors hover:text-[#f5b942]"
                        >
                            <Mail className="size-4" />
                            mutsimbi01@gmail.com
                        </a>
                    </div>

                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} {name}
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE — FORM */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md space-y-6">
                    {/* Mobile logo */}
                    <Link
                        href={home()}
                        className="flex justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10" />
                    </Link>

                    {/* Card */}
                    <div className="relative overflow-hidden rounded-[2.5rem] border bg-card p-10 text-card-foreground shadow-xl">
                        {/* <div className="absolute inset-x-8 top-0 h-1 rounded-full bg-gradient-to-r from-[#0b1c30] via-[#f5b942] to-[#0b1c30]" /> */}
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-semibold">{title}</h1>
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>

                        <div className="mt-6">{children}</div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-muted-foreground">
                        By continuing, you agree to our Terms & Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
