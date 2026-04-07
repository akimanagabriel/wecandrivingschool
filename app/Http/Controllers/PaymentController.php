<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PaypackService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('student/payment', [
            'hasAccess' => $user->hasActiveAccess(),
            'payments' => $user->payments()->latest()->get()->map(fn($p) => [
                'id' => $p->id,
                'amount' => $p->amount,
                'currency' => $p->currency,
                'payment_method' => $p->payment_method,
                'status' => $p->status,
                'paid_at' => $p->paid_at,
                'expires_at' => $p->access_expires_at,
            ]),
        ]);

    }

    public function initiateMomo(Request $request, PaypackService $paypackService): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => [
                'required',
                'string',
                'regex:/^(078|079|073|072)[0-9]{7}$/'
            ],
            'payment_method' => 'required|in:mtn_momo,airtel_money',
        ]);

        $amount = (int) config('wecan.access_price', 5000);
        $reference = 'WECAN-' . strtoupper(Str::random(8));

        $payment = Payment::create([
            'user_id' => $request->user()->id,
            'amount' => $amount,
            'currency' => 'RWF',
            'payment_method' => $validated['payment_method'],
            'status' => 'pending',
            'reference' => $reference,
            'access_duration_days' => 30,
            'metadata' => [
                'phone' => $validated['phone'],
                'initiated' => now()->toISOString(),
            ],
        ]);

        try {
            //  FIX: always use validated phone
            $response = $paypackService->cashin($amount, $validated['phone']);

            //  FIX: stdClass safe access
            $ref = $response->ref ?? $response->data->ref ?? null;

            if (!$ref) {
                $payment->update([
                    'status' => 'failed',
                    'metadata' => array_merge($payment->metadata ?? [], [
                        'paypack_response' => $response,
                    ]),
                ]);

                return back()->withErrors([
                    'payment' => 'Failed to initiate mobile money payment.',
                ]);
            }

            $payment->update([
                'transaction_id' => $ref,
                'metadata' => array_merge($payment->metadata ?? [], [
                    'paypack_response' => $response,
                ]),
            ]);

        } catch (\Exception $e) {
            $payment->update([
                'status' => 'failed',
                'metadata' => array_merge($payment->metadata ?? [], [
                    'error' => $e->getMessage(),
                ]),
            ]);

            return back()->withErrors([
                'payment' => 'Something went wrong while processing payment.',
            ]);
        }

        return redirect()->route('student.payment.success', $payment->id);
    }



    public function success(Payment $payment): Response
    {
        abort_if($payment->user_id !== auth()->id(), 403);

        return Inertia::render('student/payment-success', [
            'payment' => [
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'expires_at' => $payment->access_expires_at,
            ],
        ]);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private function confirmPayment(Payment $payment, string $txId): void
    {
        // Prevent double processing (VERY IMPORTANT)
        if ($payment->status === 'completed') {
            return;
        }

        $expiresAt = now()->addDays($payment->access_duration_days);

        $payment->update([
            'status' => 'completed',
            'transaction_id' => $txId,
            'paid_at' => now(),
            'access_expires_at' => $expiresAt,
        ]);

        // Safe update (avoid overwriting entire user row blindly)
        $payment->user()->update([
            'has_paid_access' => true,
        ]);
    }
}
