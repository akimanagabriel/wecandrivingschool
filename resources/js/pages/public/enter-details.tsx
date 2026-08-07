// resources/js/pages/public/enter-details.tsx
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    User,
    Mail,
    ArrowRight,
    Shield,
    Users,
    Award,
    Lock,
    CheckCircle,
    AlertCircle,
    Sparkles,
    GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Props {
    token: string;
    link: {
        id: number;
        name: string;
        remaining_attempts: number;
        max_attempts: number;
        attempts_used?: number;
        max_attempts_per_ip?: number;
    };
}

export default function EnterDetails({ token, link }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

    const attemptsUsed = link.attempts_used || 0;
    const maxAttempts = link.max_attempts_per_ip || 2;
    const remainingAttempts = maxAttempts - attemptsUsed;
    const isFirstAttempt = attemptsUsed === 0;
    const progress = (attemptsUsed / maxAttempts) * 100;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(
            `/public/quiz/${token}/details`,
            { name, email },
            {
                preserveState: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Enter Your Details - WeCanDrivingSchool" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B2A4A] to-[#0F1C35] p-4">
                <Card className="w-full max-w-md overflow-hidden border-0 shadow-2xl">
                    {/* ─── Top Accent Bar ──────────────────────────────────── */}
                    <div
                        className={cn(
                            'h-1 w-full',
                            remainingAttempts > 0
                                ? 'bg-primary'
                                : 'bg-orange-500',
                        )}
                    />

                    <CardHeader className="pb-2 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            {isFirstAttempt ? (
                                <User className="h-10 w-10 text-primary" />
                            ) : (
                                <GraduationCap className="h-10 w-10 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {isFirstAttempt
                                ? 'Enter Your Details'
                                : 'Ready for Another Attempt?'}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {isFirstAttempt
                                ? 'Please provide your name to start the quiz'
                                : `You have ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* ─── Attempt Info Card ───────────────────────────── */}
                        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Quiz
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    {link.name || 'Practice Quiz'}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Attempts
                                    </span>
                                </div>
                                <Badge
                                    variant={
                                        remainingAttempts > 0
                                            ? 'outline'
                                            : 'destructive'
                                    }
                                    className="font-medium"
                                >
                                    {attemptsUsed} of {maxAttempts} used
                                </Badge>
                            </div>

                            <div className="space-y-1.5">
                                <Progress value={progress} className="h-2" />
                                <p className="text-center text-xs text-muted-foreground">
                                    {remainingAttempts} attempt
                                    {remainingAttempts !== 1 ? 's' : ''}{' '}
                                    remaining
                                </p>
                            </div>
                        </div>

                        {/* ─── Form ────────────────────────────────────────── */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Full Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className="pl-10"
                                        placeholder="Enter your full name"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
                                    Email Address{' '}
                                    <span className="text-muted-foreground">
                                        (Optional)
                                    </span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="pl-10"
                                        placeholder="Enter your email (optional)"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {errors.email}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    We'll send your results and special offers
                                    to this email.
                                </p>
                            </div>

                            {/* ─── Privacy Notice ──────────────────────────── */}
                            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                                <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                                <div>
                                    <p className="font-medium text-inherit">
                                        Privacy Protected
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400/70">
                                        Your information is securely stored and
                                        will not be shared with third parties.
                                    </p>
                                </div>
                            </div>

                            {/* ─── Submit Button ───────────────────────────── */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || !name.trim()}
                                className="w-full gap-2 font-semibold"
                                size="lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        Starting Quiz...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Start Attempt {attemptsUsed + 1} of{' '}
                                        {maxAttempts}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            {/* ─── Footer Note ────────────────────────────── */}
                            <p className="text-center text-[10px] text-muted-foreground">
                                By continuing, you agree to our{' '}
                                <a
                                    href="/terms"
                                    className="text-primary hover:underline"
                                >
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a
                                    href="/privacy"
                                    className="text-primary hover:underline"
                                >
                                    Privacy Policy
                                </a>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
