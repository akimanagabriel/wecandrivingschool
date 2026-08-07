// resources/js/pages/public/enter-details.tsx
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { User, Mail, ArrowRight, Shield, Users, Award } from 'lucide-react';
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
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF3C7]">
                            <User className="h-10 w-10 text-[#D4A800]" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-[#1B2A4A]">
                            Enter Your Details
                        </CardTitle>
                        <CardDescription>
                            Please provide your name to start the quiz
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Attempt Info */}
                        <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Quiz:</span>
                                <span className="font-medium">
                                    {link.name || 'Practice Quiz'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Attempts:</span>
                                <Badge variant="outline" className="font-medium">
                                    {attemptsUsed} of {maxAttempts} used
                                </Badge>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                                <div 
                                    className="h-2 rounded-full bg-[#F5C518] transition-all duration-500"
                                    style={{ width: `${(attemptsUsed / maxAttempts) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-1">
                                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-medium">
                                    Full Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-medium">
                                    Email Address (Optional)
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400">
                                    We'll use this to send you your results.
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                                <div className="flex items-start gap-2">
                                    <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div>
                                        <p className="font-medium">
                                            Privacy Protected
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            Your information is securely stored.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || !name.trim()}
                                className="gold-gradient w-full font-bold text-[#1B2A4A]"
                            >
                                {isSubmitting ? (
                                    'Starting Quiz...'
                                ) : (
                                    <>
                                        Start Attempt {attemptsUsed + 1} of {maxAttempts}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}