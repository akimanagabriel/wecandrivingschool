// resources/js/Pages/welcome.tsx
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    Phone,
    Play,
    Shield,
    Star,
    Trophy,
    Users,
    Car,
    Zap,
    Sparkles,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';
import { PricingPlan } from '@/types/wecan';

interface WelcomeProps {
    canRegister?: boolean;
    plans?: PricingPlan[];
}

export default function Welcome({
    canRegister = true,
    plans = [],
}: WelcomeProps) {
    const { auth } = usePage().props as { auth: { user?: unknown } };

    const stats = [
        { value: '400+', label: 'Practice Questions' },
        { value: '20 min', label: 'Timed Quizzes' },
        { value: '5', label: 'Topic Categories' },
        { value: '70%', label: 'Pass Mark' },
    ];

    const features = [
        {
            icon: BookOpen,
            title: '400+ Exam Questions',
            desc: 'Comprehensive bank covering road signs, traffic rules, vehicle control, road safety and first aid.',
        },
        {
            icon: Clock,
            title: '20-Minute Timer',
            desc: 'Mirrors real exam conditions with a server-enforced countdown — no cheating possible.',
        },
        {
            icon: CheckCircle,
            title: 'Instant Feedback',
            desc: 'See correct and incorrect answers with explanations immediately after every quiz.',
        },
        {
            icon: Shield,
            title: 'Secure & Trusted',
            desc: 'Trusted by hundreds of students preparing for the Rwanda driving theory examination.',
        },
    ];

    const categories = [
        { emoji: '🚸', name: 'Road Signs', count: 80 },
        { emoji: '📋', name: 'Traffic Rules', count: 80 },
        { emoji: '🚗', name: 'Vehicle Control', count: 80 },
        { emoji: '⛑️', name: 'Road Safety', count: 80 },
        { emoji: '🚑', name: 'First Aid', count: 80 },
    ];

    const testimonials = [
        {
            name: 'Jean Bosco M.',
            text: 'Passed first time! The timed quizzes really prepared me for the real test.',
            rating: 5,
        },
        {
            name: 'Amina K.',
            text: 'Excellent questions with clear explanations. I learned so much from the feedback.',
            rating: 5,
        },
        {
            name: 'Patrick N.',
            text: 'Very easy to use. Did 5 practice quizzes and passed the real exam with 85%.',
            rating: 5,
        },
    ];

    return (
        <>
            <Head title="WeCanDrivingSchool — Rwanda's #1 Driving Theory Platform">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800"
                    rel="stylesheet"
                />
                <style>{`
                    :root {
                        --gold: #F5C518; --gold-dark: #D4A800;
                        --gold-light: #FEF3C7; --navy: #1B2A4A;
                        --navy-dark: #0F1C35; --navy-light: #2D4270;
                    }
                    body { font-family: 'Instrument Sans', sans-serif; }
                    .gold-gradient { background: linear-gradient(135deg, #F5C518 0%, #D4A800 100%); }
                    .hero-gradient { background: linear-gradient(135deg, #1A0D00 0%, #7B3F00 40%, #472500 100%); }
                    .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
                    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(27,42,74,0.15); }
                    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                    .float { animation: float 3s ease-in-out infinite; }
                    @keyframes pulse-gold { 0%,100%{box-shadow:0 0 0 0 rgba(245,197,24,0.4)} 50%{box-shadow:0 0 0 12px rgba(245,197,24,0)} }
                    .pulse-gold { animation: pulse-gold 2s infinite; }
                    .plan-card { transition: transform 0.25s, box-shadow 0.25s; }
                    .plan-card:hover { transform: translateY(-6px); }
                    .plan-featured { box-shadow: 0 0 0 3px #F5C518, 0 24px 48px rgba(245,197,24,0.25); }
                    .plan-featured:hover { box-shadow: 0 0 0 3px #D4A800, 0 32px 60px rgba(245,197,24,0.35); }
                `}</style>
            </Head>

            <div className="min-h-screen bg-white text-[#1B2A4A]">
                {/* ── NAV ── */}
                <nav className="sticky top-0 z-50 border-b border-[#1B2A4A]/10 bg-white/95 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                            <img
                                src="/app-logo.jpeg"
                                alt="WeCanDrivingSchool"
                                className="h-12 w-12 rounded-full object-cover shadow"
                                onError={(e) => {
                                    (
                                        e.target as HTMLImageElement
                                    ).style.display = 'none';
                                }}
                            />
                            <div>
                                <p className="text-sm leading-tight font-bold text-[#1B2A4A]">
                                    We Can
                                </p>
                                <p className="text-xs leading-tight font-semibold text-[#F5C518]">
                                    DRIVING SCHOOL
                                </p>
                            </div>
                        </div>
                        <div className="hidden items-center gap-8 md:flex">
                            {[
                                'features',
                                'pricing',
                                'categories',
                                'testimonials',
                                'contact',
                            ].map((id) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className="text-sm font-medium text-[#1B2A4A]/70 capitalize transition hover:text-[#1B2A4A]"
                                >
                                    {id}
                                </a>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link href={dashboard()}>
                                    <button className="gold-gradient rounded-lg px-5 py-2 text-sm font-semibold text-[#1B2A4A] shadow transition hover:opacity-90">
                                        Go to Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()}>
                                        <button className="rounded-lg border border-[#1B2A4A]/20 px-5 py-2 text-sm font-medium text-[#1B2A4A] transition hover:border-[#1B2A4A]/40 hover:bg-[#1B2A4A]/5">
                                            Log in
                                        </button>
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()}>
                                            <button className="gold-gradient rounded-lg px-5 py-2 text-sm font-semibold text-[#1B2A4A] shadow-md transition hover:opacity-90">
                                                Get Started Free
                                            </button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section className="hero-gradient relative overflow-hidden px-6 py-24 text-white lg:py-32">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#F5C518]/10 blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#F5C518]/5 blur-3xl" />
                    </div>
                    <div className="relative mx-auto max-w-7xl">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <h1 className="mb-6 text-4xl leading-tight font-extrabold lg:text-6xl">
                                    Pass Your
                                    <span className="block text-[#F5C518]">
                                        Driving Theory
                                    </span>
                                    Test First Time
                                </h1>
                                <p className="mb-8 text-lg text-white/70 lg:text-xl">
                                    WeCanDrivingSchool prepares you with 400+
                                    exam-style questions, 20-minute timed
                                    quizzes, and instant answer explanations —
                                    everything you need to ace the Rwanda
                                    driving theory test.
                                </p>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    {canRegister && (
                                        <Link href={register()}>
                                            <button className="pulse-gold gold-gradient flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-[#1B2A4A] shadow-lg transition hover:opacity-90">
                                                <Play className="h-5 w-5" />{' '}
                                                Start Practicing Free
                                            </button>
                                        </Link>
                                    )}
                                    <Link href={login()}>
                                        <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                                            I have an account →
                                        </button>
                                    </Link>
                                </div>
                                <div className="mt-8 flex items-center gap-6 text-sm text-white/50">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle className="h-4 w-4 text-[#F5C518]" />{' '}
                                        Free trial access available
                                    </span>
                                </div>
                            </div>
                            <div className="relative flex items-center justify-center">
                                <div className="float relative flex h-72 w-72 items-center justify-center lg:h-96 lg:w-96">
                                    <div className="absolute inset-0 rounded-full bg-[#F5C518]/20 blur-2xl" />
                                    <div className="absolute inset-4 rounded-full border-2 border-[#F5C518]/20" />
                                    <div className="absolute inset-8 rounded-full border border-[#F5C518]/10" />
                                    <img
                                        src="/app-logo.jpeg"
                                        alt="WeCanDrivingSchool"
                                        className="relative z-10 h-52 w-52 rounded-full object-cover shadow-2xl ring-4 ring-[#F5C518]/50 lg:h-64 lg:w-64"
                                        onError={(e) => {
                                            const el =
                                                e.target as HTMLImageElement;
                                            el.style.display = 'none';
                                            el.nextElementSibling?.classList.remove(
                                                'hidden',
                                            );
                                        }}
                                    />
                                    <div className="relative z-10 hidden h-52 w-52 items-center justify-center rounded-full bg-[#F5C518] shadow-2xl lg:h-64 lg:w-64">
                                        <span className="text-7xl">🚗</span>
                                    </div>
                                </div>
                                <div className="absolute top-8 -left-4 rounded-xl bg-white p-3 shadow-xl lg:-left-8">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5C518]">
                                            <Trophy className="h-4 w-4 text-[#1B2A4A]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#1B2A4A]">
                                                400+
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Questions
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-4 bottom-8 rounded-xl bg-white p-3 shadow-xl lg:-right-8">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                                            <Users className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#1B2A4A]">
                                                500+
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Students
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-8 -right-4 rounded-xl bg-white p-3 shadow-xl lg:-right-12">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#1B2A4A]">
                                                95%
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Pass Rate
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── STATS BAR ── */}
                <section className="border-y border-[#1B2A4A]/10 bg-[#F5C518]">
                    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <p className="text-3xl font-extrabold text-[#1B2A4A]">
                                    {s.value}
                                </p>
                                <p className="mt-1 text-sm font-medium text-[#1B2A4A]/70">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section id="features" className="px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-14 text-center">
                            <span className="mb-3 inline-block rounded-full bg-[#FEF3C7] px-4 py-1.5 text-sm font-semibold text-[#D4A800]">
                                Why Choose Us
                            </span>
                            <h2 className="text-3xl font-extrabold text-[#1B2A4A] lg:text-4xl">
                                Everything you need to pass
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#1B2A4A]/60">
                                WeCanDrivingSchool is built specifically for
                                Rwanda's driving theory test requirements.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((f) => (
                                <div
                                    key={f.title}
                                    className="card-hover rounded-2xl border border-[#1B2A4A]/8 bg-white p-6 shadow-sm"
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3C7]">
                                        <f.icon className="h-6 w-6 text-[#D4A800]" />
                                    </div>
                                    <h3 className="mb-2 font-bold text-[#1B2A4A]">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-[#1B2A4A]/60">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="bg-[#F8FAFF] px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-14 text-center">
                            <span className="mb-3 inline-block rounded-full bg-[#FEF3C7] px-4 py-1.5 text-sm font-semibold text-[#D4A800]">
                                How It Works
                            </span>
                            <h2 className="text-3xl font-extrabold text-[#1B2A4A] lg:text-4xl">
                                Ready in 3 simple steps
                            </h2>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    step: '01',
                                    title: 'Create your account',
                                    desc: 'Register for free in under 2 minutes. No credit card required to get started.',
                                    icon: '📝',
                                },
                                {
                                    step: '02',
                                    title: 'Choose your plan',
                                    desc: 'Pick the plan that fits your schedule and pay via MTN MoMo or Airtel Money.',
                                    icon: '💳',
                                },
                                {
                                    step: '03',
                                    title: 'Practice & pass',
                                    desc: 'Take unlimited timed quizzes and review answers with explanations after each attempt.',
                                    icon: '🏆',
                                },
                            ].map((item, i) => (
                                <div
                                    key={item.step}
                                    className="relative text-center"
                                >
                                    {i < 2 && (
                                        <div
                                            className="absolute top-8 left-1/2 hidden w-full -translate-y-1/2 border-t-2 border-dashed border-[#F5C518]/50 md:block"
                                            style={{ left: '60%' }}
                                        />
                                    )}
                                    <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B2A4A] text-3xl shadow-lg">
                                        {item.icon}
                                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#F5C518] text-[10px] font-extrabold text-[#1B2A4A]">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-[#1B2A4A]">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-[#1B2A4A]/60">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section id="pricing" className="px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-14 text-center">
                            <span className="mb-3 inline-block rounded-full bg-[#FEF3C7] px-4 py-1.5 text-sm font-semibold text-[#D4A800]">
                                Pricing Plans
                            </span>
                            <h2 className="text-3xl font-extrabold text-[#1B2A4A] lg:text-4xl">
                                Choose your access plan
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-lg text-[#1B2A4A]/60">
                                Pay via MTN MoMo or Airtel Money. Every plan
                                gives you full access to all quiz categories.
                            </p>
                        </div>

                        {plans.length === 0 ? (
                            /* Fallback if no plans loaded */
                            <div className="mx-auto max-w-sm rounded-3xl border-2 border-[#F5C518] bg-white p-8 text-center shadow-2xl">
                                <div className="mb-2 text-5xl font-extrabold text-[#1B2A4A]">
                                    5,000
                                </div>
                                <div className="mb-6 text-lg font-medium text-[#1B2A4A]/50">
                                    RWF / month
                                </div>
                                <ul className="mb-8 space-y-3 text-left text-sm">
                                    {[
                                        'Unlimited quiz attempts',
                                        '400+ question bank',
                                        'Instant results & explanations',
                                        'Progress tracking dashboard',
                                        'MTN MoMo & Airtel Money',
                                    ].map((f) => (
                                        <li
                                            key={f}
                                            className="flex items-center gap-2 text-[#1B2A4A]/80"
                                        >
                                            <CheckCircle className="h-4 w-4 shrink-0 text-[#F5C518]" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {canRegister ? (
                                    <Link href={register()}>
                                        <button className="gold-gradient w-full rounded-xl py-3.5 text-base font-bold text-[#1B2A4A] shadow-lg transition hover:opacity-90">
                                            Get Started Today
                                        </button>
                                    </Link>
                                ) : (
                                    <Link href={login()}>
                                        <button className="gold-gradient w-full rounded-xl py-3.5 text-base font-bold text-[#1B2A4A] shadow-lg transition hover:opacity-90">
                                            Log In to Access
                                        </button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div
                                className={[
                                    'mx-auto grid gap-6',
                                    plans.length === 1
                                        ? 'max-w-sm'
                                        : plans.length === 2
                                          ? 'max-w-2xl grid-cols-1 sm:grid-cols-2'
                                          : plans.length === 3
                                            ? 'max-w-4xl grid-cols-1 sm:grid-cols-3'
                                            : plans.length === 4
                                              ? 'max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                                              : 'max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                                ].join(' ')}
                            >
                                {plans.map((plan) => {
                                    const isPractical = plan.amount >= 100000;
                                    const isHighEnd =
                                        plan.amount >= 4000 && !isPractical;
                                    return (
                                        <div
                                            key={plan.id}
                                            className={[
                                                'plan-card relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white',
                                                plan.is_featured
                                                    ? 'plan-featured border-[#F5C518]'
                                                    : isPractical
                                                      ? 'border-[#1B2A4A]/30 shadow-lg'
                                                      : 'border-[#1B2A4A]/10 shadow-sm',
                                                isPractical && plans.length >= 3
                                                    ? 'sm:col-span-2 lg:col-span-1'
                                                    : '',
                                            ].join(' ')}
                                        >
                                            {/* Top accent bar */}
                                            <div
                                                className={[
                                                    'h-1.5 w-full',
                                                    plan.is_featured
                                                        ? 'bg-[#F5C518]'
                                                        : isPractical
                                                          ? 'bg-[#1B2A4A]'
                                                          : isHighEnd
                                                            ? 'bg-amber-400'
                                                            : 'bg-[#1B2A4A]/20',
                                                ].join(' ')}
                                            />

                                            {/* Badge */}
                                            {plan.badge_label && (
                                                <div className="absolute top-5 right-5">
                                                    <span
                                                        className={[
                                                            'rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase',
                                                            plan.is_featured
                                                                ? 'bg-[#F5C518] text-[#1B2A4A]'
                                                                : isPractical
                                                                  ? 'bg-[#1B2A4A] text-white'
                                                                  : 'bg-[#FEF3C7] text-[#D4A800]',
                                                        ].join(' ')}
                                                    >
                                                        {plan.badge_label}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex flex-1 flex-col p-7">
                                                {/* Plan icon */}
                                                <div
                                                    className={[
                                                        'mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl',
                                                        plan.is_featured
                                                            ? 'bg-[#FEF3C7]'
                                                            : isPractical
                                                              ? 'bg-[#1B2A4A]/10'
                                                              : 'bg-[#F8FAFF]',
                                                    ].join(' ')}
                                                >
                                                    {isPractical ? (
                                                        <Car className="h-5 w-5 text-[#1B2A4A]" />
                                                    ) : isHighEnd ? (
                                                        <Star className="h-5 w-5 text-amber-500" />
                                                    ) : plan.amount >= 2500 ? (
                                                        <Zap className="h-5 w-5 text-blue-500" />
                                                    ) : (
                                                        <Sparkles className="h-5 w-5 text-[#D4A800]" />
                                                    )}
                                                </div>

                                                {/* Name + description */}
                                                <h3 className="mb-1 pr-20 text-lg leading-tight font-extrabold text-[#1B2A4A]">
                                                    {plan.name}
                                                </h3>
                                                {plan.description && (
                                                    <p className="mb-5 text-sm leading-relaxed text-[#1B2A4A]/55">
                                                        {plan.description}
                                                    </p>
                                                )}

                                                {/* Price */}
                                                <div className="mb-6">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-extrabold text-[#1B2A4A] tabular-nums">
                                                            {Number(
                                                                plan.amount,
                                                            ).toLocaleString()}
                                                        </span>
                                                        <span className="text-base font-semibold text-[#1B2A4A]/50">
                                                            {plan.currency}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-sm text-[#1B2A4A]/40">
                                                        {plan.duration_label}{' '}
                                                        access
                                                    </p>
                                                </div>

                                                {/* Features */}
                                                {plan.features &&
                                                    plan.features.length >
                                                        0 && (
                                                        <ul className="mb-8 flex-1 space-y-2.5">
                                                            {plan.features.map(
                                                                (f) => (
                                                                    <li
                                                                        key={f}
                                                                        className="flex items-start gap-2.5 text-sm text-[#1B2A4A]/75"
                                                                    >
                                                                        <CheckCircle
                                                                            className={[
                                                                                'mt-0.5 h-4 w-4 shrink-0',
                                                                                plan.is_featured
                                                                                    ? 'text-[#D4A800]'
                                                                                    : isPractical
                                                                                      ? 'text-[#1B2A4A]'
                                                                                      : 'text-emerald-500',
                                                                            ].join(
                                                                                ' ',
                                                                            )}
                                                                        />
                                                                        {f}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    )}

                                                {/* CTA */}
                                                <div className="mt-auto">
                                                    {canRegister ? (
                                                        <Link href={register()}>
                                                            <button
                                                                className={[
                                                                    'w-full rounded-xl py-3.5 text-sm font-bold transition',
                                                                    plan.is_featured
                                                                        ? 'gold-gradient text-[#1B2A4A] shadow-lg hover:opacity-90'
                                                                        : isPractical
                                                                          ? 'bg-[#1B2A4A] text-white hover:bg-[#2D4270]'
                                                                          : 'border-2 border-[#1B2A4A]/20 text-[#1B2A4A] hover:border-[#1B2A4A]/50 hover:bg-[#1B2A4A]/5',
                                                                ].join(' ')}
                                                            >
                                                                {isPractical
                                                                    ? 'Book Practical Lessons'
                                                                    : 'Get Started'}
                                                            </button>
                                                        </Link>
                                                    ) : (
                                                        <Link href={login()}>
                                                            <button
                                                                className={[
                                                                    'w-full rounded-xl py-3.5 text-sm font-bold transition',
                                                                    plan.is_featured
                                                                        ? 'gold-gradient text-[#1B2A4A] shadow-lg hover:opacity-90'
                                                                        : 'border-2 border-[#1B2A4A]/20 text-[#1B2A4A] hover:border-[#1B2A4A]/50',
                                                                ].join(' ')}
                                                            >
                                                                Log In to Access
                                                            </button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <p className="mt-8 text-center text-sm text-[#1B2A4A]/40">
                            Pay via MTN Mobile Money · Airtel Money · Secure &
                            encrypted
                        </p>
                    </div>
                </section>

                {/* ── CATEGORIES ── */}
                <section id="categories" className="bg-[#F8FAFF] px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-14 text-center">
                            <span className="mb-3 inline-block rounded-full bg-[#FEF3C7] px-4 py-1.5 text-sm font-semibold text-[#D4A800]">
                                Quiz Categories
                            </span>
                            <h2 className="text-3xl font-extrabold text-[#1B2A4A] lg:text-4xl">
                                5 categories, 80 questions each
                            </h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {categories.map((cat) => (
                                <div
                                    key={cat.name}
                                    className="card-hover group flex flex-col items-center gap-3 rounded-2xl border border-[#1B2A4A]/8 bg-white p-6 text-center shadow-sm"
                                >
                                    <span className="text-4xl transition-transform group-hover:scale-110">
                                        {cat.emoji}
                                    </span>
                                    <div>
                                        <p className="font-bold text-[#1B2A4A]">
                                            {cat.name}
                                        </p>
                                        <p className="mt-1 text-sm text-[#1B2A4A]/50">
                                            {cat.count} questions
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section
                    id="testimonials"
                    className="hero-gradient px-6 py-20 text-white"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-14 text-center">
                            <span className="mb-3 inline-block rounded-full border border-[#F5C518]/30 bg-[#F5C518]/10 px-4 py-1.5 text-sm font-semibold text-[#F5C518]">
                                Student Reviews
                            </span>
                            <h2 className="text-3xl font-extrabold lg:text-4xl">
                                What our students say
                            </h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {testimonials.map((t) => (
                                <div
                                    key={t.name}
                                    className="card-hover rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                                >
                                    <div className="mb-4 flex gap-1">
                                        {Array.from({ length: t.rating }).map(
                                            (_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4 fill-[#F5C518] text-[#F5C518]"
                                                />
                                            ),
                                        )}
                                    </div>
                                    <p className="mb-4 text-sm leading-relaxed text-white/80">
                                        "{t.text}"
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5C518] text-xs font-bold text-[#1B2A4A]">
                                            {t.name[0]}
                                        </div>
                                        <span className="text-sm font-semibold text-white/90">
                                            {t.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CONTACT ── */}
                <section
                    id="contact"
                    className="bg-[#1B2A4A] px-6 py-16 text-white"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-10 md:grid-cols-2">
                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <img
                                        src="/app-logo.jpeg"
                                        alt="WeCanDrivingSchool"
                                        className="h-14 w-14 rounded-full object-cover shadow"
                                        onError={(e) => {
                                            (
                                                e.target as HTMLImageElement
                                            ).style.display = 'none';
                                        }}
                                    />
                                    <div>
                                        <p className="text-lg font-bold">
                                            We Can
                                        </p>
                                        <p className="text-sm font-semibold text-[#F5C518]">
                                            DRIVING SCHOOL
                                        </p>
                                    </div>
                                </div>
                                <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/60">
                                    Rwanda's leading online driving theory
                                    practice platform. Helping students pass
                                    their driving theory test with confidence
                                    since day one.
                                </p>
                                <div className="space-y-3">
                                    <a
                                        href="tel:+250783286489"
                                        className="flex items-center gap-3 text-sm text-white/70 transition hover:text-[#F5C518]"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5C518]/10">
                                            <Phone className="h-4 w-4 text-[#F5C518]" />
                                        </div>
                                        +250 783 286 489
                                    </a>
                                    <a
                                        href="mailto:mutsimbi01@gmail.com"
                                        className="flex items-center gap-3 text-sm text-white/70 transition hover:text-[#F5C518]"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5C518]/10">
                                            <Mail className="h-4 w-4 text-[#F5C518]" />
                                        </div>
                                        mutsimbi01@gmail.com
                                    </a>
                                    <div className="flex items-center gap-3 text-sm text-white/70">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5C518]/10">
                                            <MapPin className="h-4 w-4 text-[#F5C518]" />
                                        </div>
                                        Kigali, Rwanda
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <h3 className="mb-2 text-xl font-bold">
                                    Ready to get your licence?
                                </h3>
                                <p className="mb-6 text-sm text-white/60">
                                    Join hundreds of students who passed with
                                    WeCanDrivingSchool.
                                </p>
                                {canRegister && (
                                    <Link href={register()}>
                                        <button className="gold-gradient mx-auto block rounded-xl px-8 py-3.5 font-bold text-[#1B2A4A] shadow-lg transition hover:opacity-90">
                                            Create Free Account →
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="border-t border-white/10 bg-[#0F1C35] px-6 py-6 text-center text-xs text-white/30">
                    © {new Date().getFullYear()} WeCanDrivingSchool — Kigali,
                    Rwanda. All rights reserved.
                </footer>
            </div>
        </>
    );
}
