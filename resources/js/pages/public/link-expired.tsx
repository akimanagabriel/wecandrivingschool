// resources/js/pages/public/link-expired.tsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Lock, AlertTriangle, Clock, Users, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(showPaymentModal);

    const getIcon = () => {
        switch (code) {
            case 'expired':
                return <Clock className="h-16 w-16 text-red-500" />;
            case 'already_used':
                return <Users className="h-16 w-16 text-orange-500" />;
            case 'max_attempts_reached':
                return <RefreshCw className="h-16 w-16 text-orange-500" />;
            default:
                return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
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

    return (
        <>
            <Head title="Link Expired - WeCanDrivingSchool" />

            <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#0F1C35] flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
                            {getIcon()}
                        </div>
                        <CardTitle className="text-3xl font-bold text-[#1B2A4A]">{getTitle()}</CardTitle>
                        <CardDescription className="text-base">{message}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {link && (
                            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500">Link Name</p>
                                        <p className="font-medium">{link.name || 'Untitled Link'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Your Attempts</p>
                                        <p className="font-medium">{attemptsCount} / {maxAttemptsPerIp}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Button
                                className="w-full gold-gradient text-[#1B2A4A] font-bold"
                                onClick={() => setIsPaymentModalOpen(true)}
                            >
                                <Lock className="mr-2 h-4 w-4" />
                                Purchase Full Access
                            </Button>

                            <div className="text-center text-sm text-gray-500">
                                <Link href="/" className="text-[#F5C518] hover:underline">
                                    Return to Home
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#1B2A4A]">
                            Get Full Access
                        </DialogTitle>
                        <DialogDescription>
                            You've used your free attempts. Choose a plan to continue practicing.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 md:grid-cols-3 mt-4">
                        {plans.map((plan) => (
                            <Card key={plan.id} className={`cursor-pointer transition hover:shadow-lg ${plan.is_featured ? 'border-[#F5C518]' : ''}`}>
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-[#1B2A4A]">
                                        {Number(plan.amount).toLocaleString()}
                                        <span className="text-sm font-normal text-gray-500"> {plan.currency}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">{plan.duration_label}</p>
                                    <ul className="mt-4 space-y-2 text-sm">
                                        {plan.features?.map((feature: string) => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className="mt-4 w-full gold-gradient text-[#1B2A4A] font-bold"
                                        onClick={() => {
                                            setIsPaymentModalOpen(false);
                                            router.post('/public/quiz/payment/initiate', {
                                                token,
                                                plan_id: plan.id,
                                            });
                                        }}
                                    >
                                        Get Started
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}