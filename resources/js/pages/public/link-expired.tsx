// resources/js/pages/public/link-expired.tsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Lock,
    AlertTriangle,
    Clock,
    Users,
    RefreshCw,
    CheckCircle,
    XCircle,
    Home,
    ArrowRight,
    Award,
    Star,
    CreditCard,
    Target,
    Trophy,
    Sparkles,
    Mail,
    Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PricingPlan {
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
}

interface LinkData {
    id: number;
    name: string;
    max_attempts: number;
    used_count: number;
    remaining: number;
}

interface Props {
    token: string;
    message: string;
    code: string;
    showPaymentModal: boolean;
    plans: PricingPlan[];
    link: LinkData | null;
    attemptsCount?: number;
    maxAttemptsPerIp?: number;
    existingAttempt?: any;
}

export default function LinkExpired({
    token,
    message,
    code,
    showPaymentModal,
    plans,
    link,
    attemptsCount = 0,
    maxAttemptsPerIp = 2,
}: Props) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] =
        useState(showPaymentModal);

    const getIcon = () => {
        switch (code) {
            case 'expired':
                return <Clock className="h-14 w-14 text-red-500" />;
            case 'already_used':
                return <Users className="h-14 w-14 text-orange-500" />;
            case 'max_attempts_reached':
                return <RefreshCw className="h-14 w-14 text-orange-500" />;
            default:
                return <AlertTriangle className="h-14 w-14 text-yellow-500" />;
        }
    };

    const getTitle = () => {
        switch (code) {
            case 'expired':
                return 'Link Expired';
            case 'already_used':
                return 'Already Used';
            case 'max_attempts_reached':
                return 'Maximum Attempts Reached';
            default:
                return 'Access Denied';
        }
    };

    const getDescription = () => {
        switch (code) {
            case 'expired':
                return 'This quiz link has expired. Purchase access to continue practicing.';
            case 'already_used':
                return 'You have already used this link. Purchase access to continue practicing.';
            case 'max_attempts_reached':
                return `You've used all ${maxAttemptsPerIp} free attempts. Purchase access to continue practicing unlimited.`;
            default:
                return message;
        }
    };

    return (
        <>
            <Head title="Access Restricted - WeCanDrivingSchool" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B2A4A] to-[#0F1C35] p-4">
                <Card className="w-full max-w-md overflow-hidden border-0 shadow-2xl">
                    {/* ─── Top Accent Bar ──────────────────────────────────── */}
                    <div
                        className={cn(
                            'h-1.5 w-full',
                            code === 'expired'
                                ? 'bg-red-500'
                                : code === 'max_attempts_reached'
                                  ? 'bg-orange-500'
                                  : 'bg-yellow-500',
                        )}
                    />

                    <CardHeader className="pb-2 text-center">
                        <div
                            className={cn(
                                'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full',
                                code === 'expired'
                                    ? 'bg-red-100'
                                    : code === 'max_attempts_reached'
                                      ? 'bg-orange-100'
                                      : 'bg-yellow-100',
                            )}
                        >
                            {getIcon()}
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {getTitle()}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {getDescription()}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* ─── Attempt Info ────────────────────────────────── */}
                        {link && (
                            <div className="rounded-lg bg-muted/50 p-4 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Quiz
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {link.name || 'Practice Quiz'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Attempts Used
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {attemptsCount} / {maxAttemptsPerIp}
                                        </p>
                                    </div>
                                </div>
                                {attemptsCount >= maxAttemptsPerIp && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span>All attempts used</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Action Buttons ─────────────────────────────── */}
                        <div className="space-y-3">
                            <Button
                                className="w-full gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                                onClick={() => setIsPaymentModalOpen(true)}
                            >
                                <Lock className="h-4 w-4" />
                                Purchase Full Access
                                <ArrowRight className="h-4 w-4" />
                            </Button>

                            <Link href="/">
                                <Button
                                    variant="ghost"
                                    className="w-full gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Home className="h-4 w-4" />
                                    Return to Home
                                </Button>
                            </Link>
                        </div>

                        {/* ─── Contact Support ────────────────────────────── */}
                        <div className="pt-2 text-center">
                            <p className="text-xs text-muted-foreground">
                                Need help?{' '}
                                <a
                                    href="mailto:support@wecandriving.rw"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Contact Support
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ─── Single Column Scrollable Payment Modal ────────────────── */}
            <Dialog
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
            >
                <DialogContent className="flex max-h-[85vh] max-w-md flex-col overflow-hidden p-0">
                    {/* ─── Fixed Header ────────────────────────────────────── */}
                    <div className="shrink-0 border-b bg-muted/30 px-5 py-3.5">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                <Award className="h-5 w-5 text-primary" />
                                Get Full Access
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Choose a plan to continue practicing unlimited.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* ─── Scrollable Content ────────────────────────────── */}
                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {plans &&
                            plans.map((plan) => {
                                const isPractical = plan.amount >= 100000;
                                const isFeatured = plan.is_featured;

                                return (
                                    <Card
                                        key={plan.id}
                                        className={cn(
                                            'relative transition-all hover:shadow-md',
                                            isFeatured
                                                ? 'border-2 border-primary shadow-sm'
                                                : 'border-border hover:border-primary/30',
                                        )}
                                    >
                                        {/* ─── Badge ────────────────────────────── */}
                                        {(isFeatured || plan.badge_label) && (
                                            <div className="absolute -top-2.5 right-3">
                                                <Badge
                                                    className={cn(
                                                        'px-2.5 py-0.5 text-[10px] font-semibold',
                                                        isFeatured
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-amber-500 text-white',
                                                    )}
                                                >
                                                    {isFeatured ? (
                                                        <>
                                                            <Star className="mr-1 h-2.5 w-2.5 fill-current" />
                                                            Best Value
                                                        </>
                                                    ) : plan.badge_label ===
                                                      'Most Popular' ? (
                                                        <>
                                                            <Trophy className="mr-1 h-2.5 w-2.5" />
                                                            Popular
                                                        </>
                                                    ) : plan.badge_label ===
                                                      'Includes Practical' ? (
                                                        <>
                                                            <Target className="mr-1 h-2.5 w-2.5" />
                                                            Practical
                                                        </>
                                                    ) : (
                                                        plan.badge_label
                                                    )}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* ─── Card Content ────────────────────── */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate text-sm font-semibold">
                                                        {plan.name}
                                                    </h4>
                                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                                        {plan.description}
                                                    </p>
                                                </div>
                                                <div className="ml-3 shrink-0 text-right">
                                                    <p className="text-lg font-extrabold tracking-tight text-foreground">
                                                        {Number(
                                                            plan.amount,
                                                        ).toLocaleString()}
                                                        <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                                                            {plan.currency}
                                                        </span>
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {plan.duration_label}
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator className="my-2.5" />

                                            <ul className="space-y-1 text-xs">
                                                {plan.features
                                                    ?.slice(0, 3)
                                                    .map((feature: string) => (
                                                        <li
                                                            key={feature}
                                                            className="flex items-start gap-1.5"
                                                        >
                                                            <CheckCircle
                                                                className={cn(
                                                                    'mt-0.5 h-3 w-3 shrink-0',
                                                                    isFeatured
                                                                        ? 'text-primary'
                                                                        : 'text-green-500',
                                                                )}
                                                            />
                                                            <span className="truncate text-muted-foreground">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ))}
                                                {plan.features?.length > 3 && (
                                                    <li className="ml-4.5 text-[10px] text-muted-foreground">
                                                        +
                                                        {plan.features.length -
                                                            3}{' '}
                                                        more features
                                                    </li>
                                                )}
                                            </ul>

                                            <Button
                                                className={cn(
                                                    'mt-2.5 h-8 w-full gap-1.5 text-xs',
                                                    isFeatured
                                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                        : isPractical
                                                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                          : '',
                                                )}
                                                variant={
                                                    isFeatured || isPractical
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() => {
                                                    setIsPaymentModalOpen(
                                                        false,
                                                    );
                                                    router.post(
                                                        '/public/quiz/payment/initiate',
                                                        {
                                                            token,
                                                            plan_id: plan.id,
                                                        },
                                                    );
                                                }}
                                            >
                                                <CreditCard className="h-3.5 w-3.5" />
                                                {isPractical
                                                    ? 'Book Now'
                                                    : 'Get Started'}
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                    </div>

                    {/* ─── Fixed Footer ────────────────────────────────────── */}
                    <div className="shrink-0 border-t bg-muted/30 px-5 py-2.5 text-center">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Continue with free trial later
                            </Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
