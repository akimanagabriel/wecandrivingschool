import { Head, router } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';
import type { WeCanPageProps } from '@/types/wecan';

type Props = WeCanPageProps<{
    payment: {
        amount: number;
        currency: string;
        payment_method: string;
        status: string;
        expires_at: string | null;
    };
}>;

export default function PaymentSuccess({ payment }: Props) {
    return (
        <AuthLayout title="Payment Successful!" description="Thank you for your purchase. Your access is now active.">
            <Head title="Payment Successful" />
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold">You're all set!</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your WeCanDrivingSchool access is now active.
                    </p>

                    <div className="mt-6 space-y-2 rounded-xl bg-muted p-4 text-left text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-semibold">
                                {Number(payment.amount).toLocaleString()} {payment.currency}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Method</span>
                            <span className="capitalize">{payment.payment_method?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-semibold capitalize text-green-600">{payment.status}</span>
                        </div>
                        {payment.expires_at && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Access Until</span>
                                <span>{new Date(payment.expires_at).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    <Button
                        className="mt-6 w-full"
                        onClick={() => router.visit('/student/dashboard')}
                    >
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
