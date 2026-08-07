// resources/js/Pages/welcome.tsx
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
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
    ChevronLeft,
    ChevronRight,
    Pause,
    Play as PlayIcon,
    FileText,
    TrafficCone,
    Gauge,
    LifeBuoy,
    Ambulance,
    PenTool,
    CreditCard,
    Award,
    Menu,
    X,
    ArrowRight,
    MapPin as MapPinIcon,
    CarFront,
    Truck,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';
import { PricingPlan } from '@/types/wecan';

interface WelcomeProps {
    canRegister?: boolean;
    plans?: PricingPlan[];
    publicQuizUrl?: string;
}

// ── Car images from Unsplash (free to use) ──
const carImages = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80',
        alt: 'Red sports car on road',
        title: 'Learn to Drive with Confidence',
        subtitle: 'Professional driving lessons tailored to your pace',
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&q=80',
        alt: 'White car on city street',
        title: 'Master the Road Rules',
        subtitle: 'Comprehensive theory and practical training',
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80',
        alt: 'Classic car side view',
        title: 'Pass Your Test First Time',
        subtitle: 'Expert instructors with proven success rates',
    },
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
        alt: 'Luxury car on road',
        title: 'Safe & Comfortable Vehicles',
        subtitle: 'Modern cars with dual controls for safety',
    },
    {
        id: 5,
        url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80',
        alt: 'Car driving on mountain road',
        title: 'Flexible Scheduling',
        subtitle: 'Book lessons that fit your busy lifestyle',
    },
];

// ── Gallery images for the car display section ──
const galleryCars = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&q=80',
        alt: 'Modern sedan',
        label: 'Sedan',
        icon: CarFront,
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80',
        alt: 'SUV on road',
        label: 'SUV',
        icon: Truck,
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80',
        alt: 'Classic car',
        label: 'Classic',
        icon: Car,
    },
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80',
        alt: 'Electric car',
        label: 'Electric',
        icon: Zap,
    },
];

export default function Welcome({
    canRegister = true,
    plans = [],
    publicQuizUrl = '',
}: WelcomeProps) {
    const { auth } = usePage().props as { auth: { user?: unknown } };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // ── Carousel state ──
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const slideInterval = useRef<NodeJS.Timeout | null>(null);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) => (prev - 1 + carImages.length) % carImages.length,
        );
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // ── Auto-slide effect ──
    useEffect(() => {
        if (isPaused) {
            if (slideInterval.current) {
                clearInterval(slideInterval.current);
                slideInterval.current = null;
            }
            return;
        }

        slideInterval.current = setInterval(nextSlide, 5000);

        return () => {
            if (slideInterval.current) {
                clearInterval(slideInterval.current);
                slideInterval.current = null;
            }
        };
    }, [isPaused]);

    // ── Stats ──
    const stats = [
        { value: '400+', label: 'Practice Questions', icon: FileText },
        { value: '20 min', label: 'Timed Quizzes', icon: Clock },
        { value: '5', label: 'Topic Categories', icon: BookOpen },
        { value: '70%', label: 'Pass Mark', icon: Award },
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
        {
            icon: TrafficCone,
            name: 'Road Signs',
            count: 80,
            color: 'text-red-500',
        },
        {
            icon: FileText,
            name: 'Traffic Rules',
            count: 80,
            color: 'text-blue-500',
        },
        {
            icon: Gauge,
            name: 'Vehicle Control',
            count: 80,
            color: 'text-green-500',
        },
        {
            icon: LifeBuoy,
            name: 'Road Safety',
            count: 80,
            color: 'text-orange-500',
        },
        {
            icon: Ambulance,
            name: 'First Aid',
            count: 80,
            color: 'text-red-600',
        },
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

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Categories', href: '#categories' },
        { label: 'Testimonials', href: '#testimonials' },
        { label: 'Contact', href: '#contact' },
    ];

    const steps = [
        {
            step: '01',
            title: 'Create your account',
            desc: 'Register for free in under 2 minutes. No credit card required to get started.',
            icon: PenTool,
        },
        {
            step: '02',
            title: 'Choose your plan',
            desc: 'Pick the plan that fits your schedule and pay via MTN MoMo or Airtel Money.',
            icon: CreditCard,
        },
        {
            step: '03',
            title: 'Practice & pass',
            desc: 'Take unlimited timed quizzes and review answers with explanations after each attempt.',
            icon: Award,
        },
    ];

    return (
        <>
            <Head title="WeCanDrivingSchool — Rwanda's #1 Driving Theory Platform">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900"
                    rel="stylesheet"
                />
                <style>{`
                    :root {
                        --gold: #F5C518;
                        --gold-dark: #D4A800;
                        --gold-light: #FEF3C7;
                        --navy: #1B2A4A;
                        --navy-dark: #0F1C35;
                        --navy-light: #2D4270;
                    }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .gold-gradient {
                        background: linear-gradient(135deg, #F5C518 0%, #D4A800 100%);
                    }
                    .hero-gradient {
                        background: linear-gradient(135deg, #1A0D00 0%, #7B3F00 40%, #472500 100%);
                    }
                    .card-hover {
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .card-hover:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 20px 40px rgba(27, 42, 74, 0.15);
                    }
                    @keyframes float {
                        0%,
                        100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-8px);
                        }
                    }
                    .float {
                        animation: float 3s ease-in-out infinite;
                    }
                    @keyframes pulse-gold {
                        0%,
                        100% {
                            box-shadow: 0 0 0 0 rgba(245, 197, 24, 0.4);
                        }
                        50% {
                            box-shadow: 0 0 0 12px rgba(245, 197, 24, 0);
                        }
                    }
                    .pulse-gold {
                        animation: pulse-gold 2s infinite;
                    }
                    .plan-card {
                        transition: transform 0.25s, box-shadow 0.25s;
                    }
                    .plan-card:hover {
                        transform: translateY(-6px);
                    }
                    .plan-featured {
                        box-shadow: 0 0 0 3px #F5C518, 0 24px 48px rgba(245, 197, 24, 0.25);
                    }
                    .plan-featured:hover {
                        box-shadow: 0 0 0 3px #D4A800, 0 32px 60px rgba(245, 197, 24, 0.35);
                    }
                    
                    /* ── Carousel Styles ── */
                    .carousel-slide {
                        transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
                    }
                    .carousel-dot {
                        transition: all 0.3s ease;
                    }
                    .carousel-dot:hover {
                        transform: scale(1.2);
                    }
                    
                    /* ── Gallery overlay ── */
                    .gallery-card {
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .gallery-card:hover {
                        transform: scale(1.03) translateY(-6px);
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                    }
                    .gallery-card .overlay {
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                    .gallery-card:hover .overlay {
                        opacity: 1;
                    }
                    
                    /* ── Mobile Menu ── */
                    .mobile-menu-enter {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    .mobile-menu-enter-active {
                        opacity: 1;
                        transform: translateY(0);
                        transition: opacity 0.2s, transform 0.2s;
                    }
                    .mobile-menu-exit {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .mobile-menu-exit-active {
                        opacity: 0;
                        transform: translateY(-10px);
                        transition: opacity 0.2s, transform 0.2s;
                    }
                `}</style>
            </Head>

            <div className="min-h-screen bg-white font-sans text-[#1B2A4A]">
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
                                <p className="text-sm leading-tight font-bold tracking-tight text-[#1B2A4A]">
                                    We Can
                                </p>
                                <p className="text-xs leading-tight font-semibold tracking-wide text-[#F5C518]">
                                    DRIVING SCHOOL
                                </p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center gap-8 md:flex">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-medium text-[#1B2A4A]/70 transition hover:text-[#1B2A4A]"
                                >
                                    {link.label}
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
                                    <Link
                                        href={login()}
                                        className="hidden sm:block"
                                    >
                                        <button className="rounded-lg border border-[#1B2A4A]/20 px-5 py-2 text-sm font-medium text-[#1B2A4A] transition hover:border-[#1B2A4A]/40 hover:bg-[#1B2A4A]/5">
                                            Log in
                                        </button>
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()}>
                                            <button className="gold-gradient rounded-lg px-5 py-2 text-sm font-semibold text-[#1B2A4A] shadow-md transition hover:opacity-90">
                                                Get Started
                                            </button>
                                        </Link>
                                    )}
                                </>
                            )}
                            {/* Mobile menu toggle */}
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="ml-2 rounded-lg p-2 text-[#1B2A4A] hover:bg-[#1B2A4A]/5 md:hidden"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Mobile Menu ── */}
                    {mobileMenuOpen && (
                        <div className="border-t border-[#1B2A4A]/10 bg-white px-6 py-4 md:hidden">
                            <div className="flex flex-col gap-3">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="text-sm font-medium text-[#1B2A4A]/70 transition hover:text-[#1B2A4A]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                {!auth?.user && (
                                    <>
                                        <hr className="border-[#1B2A4A]/10" />
                                        <Link href={login()}>
                                            <button className="w-full rounded-lg border border-[#1B2A4A]/20 px-5 py-2 text-sm font-medium text-[#1B2A4A] transition hover:border-[#1B2A4A]/40 hover:bg-[#1B2A4A]/5">
                                                Log in
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* ── HERO with Car Slider ── */}
                <section className="relative overflow-hidden bg-[#0F1C35]">
                    <div className="relative h-[600px] md:h-[700px] lg:h-[800px]">
                        {carImages.map((image, index) => (
                            <div
                                key={image.id}
                                className={`absolute inset-0 transition-all duration-1000 ${
                                    index === currentSlide
                                        ? 'scale-100 opacity-100'
                                        : 'scale-105 opacity-0'
                                }`}
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url(${image.url})`,
                                        backgroundPosition: 'center 30%',
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                </div>

                                <div className="relative z-10 flex h-full items-center">
                                    <div className="mx-auto w-full max-w-7xl px-6">
                                        <div className="max-w-2xl">
                                            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
                                                {image.title}
                                            </h1>
                                            <p className="mb-8 text-lg font-medium text-white/70 md:text-xl">
                                                {image.subtitle}
                                            </p>
                                            <div className="flex flex-col gap-4 sm:flex-row">
                                                {/* ── START PRACTICING BUTTON ── */}
                                                {auth?.user ? (
                                                    <Link href={dashboard()}>
                                                        <button className="pulse-gold gold-gradient flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-[#1B2A4A] shadow-lg transition hover:opacity-90">
                                                            <Play className="h-5 w-5" />{' '}
                                                            Go to Dashboard
                                                        </button>
                                                    </Link>
                                                ) : publicQuizUrl ? (
                                                    <a
                                                        href={publicQuizUrl}
                                                        className="pulse-gold gold-gradient inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-[#1B2A4A] shadow-lg transition hover:scale-105 hover:opacity-90"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Play className="h-5 w-5" />{' '}
                                                        Start Practicing Free
                                                    </a>
                                                ) : (
                                                    <Link href={register()}>
                                                        <button className="pulse-gold gold-gradient flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-[#1B2A4A] shadow-lg transition hover:opacity-90">
                                                            <Play className="h-5 w-5" />{' '}
                                                            Start Practicing
                                                            Free
                                                        </button>
                                                    </Link>
                                                )}

                                                <Link href={login()}>
                                                    <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                                                        I have an account
                                                        <ArrowRight className="h-5 w-5" />
                                                    </button>
                                                </Link>
                                            </div>
                                            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/50">
                                                <span className="flex items-center gap-1.5">
                                                    <CheckCircle className="h-4 w-4 text-[#F5C518]" />{' '}
                                                    Free trial access available
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Users className="h-4 w-4 text-[#F5C518]" />{' '}
                                                    2 attempts per person
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* ── Carousel Controls ── */}
                        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-4">
                            <button
                                onClick={prevSlide}
                                className="pointer-events-auto rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition hover:scale-110 hover:bg-black/70"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="pointer-events-auto rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition hover:scale-110 hover:bg-black/70"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </div>

                        {/* ── Carousel Dots ── */}
                        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
                            {carImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`carousel-dot h-3 rounded-full transition-all ${
                                        index === currentSlide
                                            ? 'w-10 bg-[#F5C518]'
                                            : 'w-3 bg-white/40 hover:bg-white/60'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className="ml-2 rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
                                aria-label={
                                    isPaused
                                        ? 'Play slideshow'
                                        : 'Pause slideshow'
                                }
                            >
                                {isPaused ? (
                                    <PlayIcon className="h-4 w-4" />
                                ) : (
                                    <Pause className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        <div className="absolute top-6 right-6 z-20 hidden rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm md:block">
                            {currentSlide + 1} / {carImages.length}
                        </div>
                    </div>
                </section>

                {/* ── Car Gallery Section ── */}
                <section className="bg-[#F8FAFF] px-6 py-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center">
                            <span className="mb-3 inline-block rounded-full bg-[#FEF3C7] px-4 py-1.5 text-sm font-semibold text-[#D4A800]">
                                Our Fleet
                            </span>
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#1B2A4A] lg:text-4xl">
                                Learn in Modern, Safe Vehicles
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-[#1B2A4A]/60">
                                All our cars are equipped with dual controls for
                                maximum safety during your lessons.
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {galleryCars.map((car) => {
                                const Icon = car.icon;
                                return (
                                    <div
                                        key={car.id}
                                        className="gallery-card group relative overflow-hidden rounded-2xl shadow-lg"
                                    >
                                        <img
                                            src={car.url}
                                            alt={car.alt}
                                            className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="overlay absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6">
                                            <div className="transform transition-transform duration-300 group-hover:translate-y-0">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5C518] px-3 py-1 text-xs font-bold text-[#1B2A4A]">
                                                    <Icon className="h-3 w-3" />
                                                    {car.label}
                                                </span>
                                                <p className="mt-2 text-sm font-medium text-white">
                                                    Dual controls • AC • GPS
                                                    tracking
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── STATS BAR ── */}
                <section className="border-y border-[#1B2A4A]/10 bg-[#F5C518]">
                    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
                        {stats.map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="text-center">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1B2A4A]/10">
                                        <Icon className="h-5 w-5 text-[#1B2A4A]" />
                                    </div>
                                    <p className="text-3xl font-extrabold tracking-tight text-[#1B2A4A]">
                                        {s.value}
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-[#1B2A4A]/70">
                                        {s.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section id="features" className="px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-14 text-center">
                            <span className="mb-3 inline-block rounded-full bg-[#FEF3C7] px-4 py-1.5 text-sm font-semibold text-[#D4A800]">
                                Why Choose Us
                            </span>
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#1B2A4A] lg:text-4xl">
                                Everything you need to pass
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-[#1B2A4A]/60">
                                WeCanDrivingSchool is built specifically for
                                Rwanda's driving theory test requirements.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((f) => {
                                const Icon = f.icon;
                                return (
                                    <div
                                        key={f.title}
                                        className="card-hover rounded-2xl border border-[#1B2A4A]/8 bg-white p-6 shadow-sm"
                                    >
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3C7]">
                                            <Icon className="h-6 w-6 text-[#D4A800]" />
                                        </div>
                                        <h3 className="mb-2 font-bold text-[#1B2A4A]">
                                            {f.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed font-medium text-[#1B2A4A]/60">
                                            {f.desc}
                                        </p>
                                    </div>
                                );
                            })}
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
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#1B2A4A] lg:text-4xl">
                                Ready in 3 simple steps
                            </h2>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {steps.map((item, i) => {
                                const Icon = item.icon;
                                return (
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
                                        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B2A4A] shadow-lg">
                                            <Icon className="h-7 w-7 text-white" />
                                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#F5C518] text-[10px] font-extrabold text-[#1B2A4A]">
                                                {item.step}
                                            </span>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-[#1B2A4A]">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed font-medium text-[#1B2A4A]/60">
                                            {item.desc}
                                        </p>
                                    </div>
                                );
                            })}
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
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#1B2A4A] lg:text-4xl">
                                Choose your access plan
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-[#1B2A4A]/60">
                                Pay via MTN MoMo or Airtel Money. Every plan
                                gives you full access to all quiz categories.
                            </p>
                        </div>

                        {plans.length === 0 ? (
                            <div className="mx-auto max-w-sm rounded-3xl border-2 border-[#F5C518] bg-white p-8 text-center shadow-2xl">
                                <div className="mb-2 text-5xl font-extrabold tracking-tight text-[#1B2A4A]">
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
                                            className="flex items-center gap-2 font-medium text-[#1B2A4A]/80"
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
                                    const PlanIcon = isPractical
                                        ? Car
                                        : isHighEnd
                                          ? Star
                                          : Zap;
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
                                                <div
                                                    className={[
                                                        'mb-4 flex h-11 w-11 items-center justify-center rounded-xl',
                                                        plan.is_featured
                                                            ? 'bg-[#FEF3C7]'
                                                            : isPractical
                                                              ? 'bg-[#1B2A4A]/10'
                                                              : 'bg-[#F8FAFF]',
                                                    ].join(' ')}
                                                >
                                                    <PlanIcon
                                                        className={[
                                                            'h-5 w-5',
                                                            plan.is_featured
                                                                ? 'text-[#D4A800]'
                                                                : isPractical
                                                                  ? 'text-[#1B2A4A]'
                                                                  : isHighEnd
                                                                    ? 'text-amber-500'
                                                                    : 'text-blue-500',
                                                        ].join(' ')}
                                                    />
                                                </div>

                                                <h3 className="mb-1 pr-20 text-lg leading-tight font-extrabold text-[#1B2A4A]">
                                                    {plan.name}
                                                </h3>
                                                {plan.description && (
                                                    <p className="mb-5 text-sm leading-relaxed font-medium text-[#1B2A4A]/55">
                                                        {plan.description}
                                                    </p>
                                                )}

                                                <div className="mb-6">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-extrabold tracking-tight text-[#1B2A4A] tabular-nums">
                                                            {Number(
                                                                plan.amount,
                                                            ).toLocaleString()}
                                                        </span>
                                                        <span className="text-base font-semibold text-[#1B2A4A]/50">
                                                            {plan.currency}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-sm font-medium text-[#1B2A4A]/40">
                                                        {plan.duration_label}{' '}
                                                        access
                                                    </p>
                                                </div>

                                                {plan.features &&
                                                    plan.features.length >
                                                        0 && (
                                                        <ul className="mb-8 flex-1 space-y-2.5">
                                                            {plan.features.map(
                                                                (f) => (
                                                                    <li
                                                                        key={f}
                                                                        className="flex items-start gap-2.5 text-sm font-medium text-[#1B2A4A]/75"
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

                        <p className="mt-8 text-center text-sm font-medium text-[#1B2A4A]/40">
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
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#1B2A4A] lg:text-4xl">
                                5 categories, 80 questions each
                            </h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <div
                                        key={cat.name}
                                        className="card-hover group flex flex-col items-center gap-3 rounded-2xl border border-[#1B2A4A]/8 bg-white p-6 text-center shadow-sm"
                                    >
                                        <div className="rounded-xl bg-[#FEF3C7] p-3 transition-transform group-hover:scale-110">
                                            <Icon
                                                className={`h-8 w-8 ${cat.color}`}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1B2A4A]">
                                                {cat.name}
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-[#1B2A4A]/50">
                                                {cat.count} questions
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
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
                            <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
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
                                    <p className="mb-4 text-sm leading-relaxed font-medium text-white/80">
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
                                        <p className="text-lg font-bold tracking-tight">
                                            We Can
                                        </p>
                                        <p className="text-sm font-semibold tracking-wide text-[#F5C518]">
                                            DRIVING SCHOOL
                                        </p>
                                    </div>
                                </div>
                                <p className="mb-6 max-w-sm text-sm leading-relaxed font-medium text-white/60">
                                    Rwanda's leading online driving theory
                                    practice platform. Helping students pass
                                    their driving theory test with confidence
                                    since day one.
                                </p>
                                <div className="space-y-3">
                                    <a
                                        href="tel:+250783286489"
                                        className="flex items-center gap-3 text-sm font-medium text-white/70 transition hover:text-[#F5C518]"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5C518]/10">
                                            <Phone className="h-4 w-4 text-[#F5C518]" />
                                        </div>
                                        +250 783 286 489
                                    </a>
                                    <a
                                        href="mailto:mutsimbi01@gmail.com"
                                        className="flex items-center gap-3 text-sm font-medium text-white/70 transition hover:text-[#F5C518]"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5C518]/10">
                                            <Mail className="h-4 w-4 text-[#F5C518]" />
                                        </div>
                                        mutsimbi01@gmail.com
                                    </a>
                                    <div className="flex items-center gap-3 text-sm font-medium text-white/70">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5C518]/10">
                                            <MapPinIcon className="h-4 w-4 text-[#F5C518]" />
                                        </div>
                                        Kigali, Rwanda
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <h3 className="mb-2 text-xl font-bold tracking-tight">
                                    Ready to get your licence?
                                </h3>
                                <p className="mb-6 text-sm font-medium text-white/60">
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
                <footer className="border-t border-white/10 bg-[#0F1C35] px-6 py-6 text-center text-xs font-medium text-white/30">
                    © {new Date().getFullYear()} WeCanDrivingSchool — Kigali,
                    Rwanda. All rights reserved.
                </footer>
            </div>
        </>
    );
}
