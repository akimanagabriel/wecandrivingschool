<?php

namespace App\Http\Controllers;

use App\Models\Payment;
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
            'payments'  => $user->payments()->latest()->get()->map(fn ($p) => [
                'id'             => $p->id,
                'amount'         => $p->amount,
                'currency'       => $p->currency,
                'payment_method' => $p->payment_method,
                'status'         => $p->status,
                'paid_at'        => $p->paid_at,
                'expires_at'     => $p->access_expires_at,
            ]),
        ]);
    }

    public function initiateMomo(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone'          => 'required|string|min:10|max:15',
            'payment_method' => 'required|in:mtn_momo,airtel_money',
        ]);

        $amount    = (int) config('wecan.access_price', 5000);
        $reference = 'WECAN-' . strtoupper(Str::random(8));

        $payment = Payment::create([
            'user_id'              => $request->user()->id,
            'amount'               => $amount,
            'currency'             => 'RWF',
            'payment_method'       => $validated['payment_method'],
            'status'               => 'pending',
            'reference'            => $reference,
            'access_duration_days' => 30,
            'metadata'             => [
                'phone'     => $validated['phone'],
                'initiated' => now()->toISOString(),
            ],
        ]);

        // Simulate success — replace with real MoMo API in production
        $this->confirmPayment($payment, 'SIM-' . strtoupper(Str::random(12)));

        return redirect()->route('student.payment.success', $payment->id);
    }

    public function initiateStripe(Request $request): mixed
    {
        $amount    = (float) config('wecan.access_price_usd', 5);
        $reference = 'WECAN-STRIPE-' . strtoupper(Str::random(8));

        $payment = Payment::create([
            'user_id'              => $request->user()->id,
            'amount'               => $amount,
            'currency'             => 'USD',
            'payment_method'       => 'stripe',
            'status'               => 'pending',
            'reference'            => $reference,
            'access_duration_days' => 30,
        ]);

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items'           => [[
                'price_data' => [
                    'currency'     => 'usd',
                    'product_data' => ['name' => 'WeCanDrivingSchool – 30-day Access'],
                    'unit_amount'  => (int) ($amount * 100),
                ],
                'quantity' => 1,
            ]],
            'mode'        => 'payment',
            'success_url' => route('student.payment.stripe.callback') . '?ref=' . $reference . '&session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'  => route('student.payment'),
        ]);

        return Inertia::location($session->url);
    }

    public function stripeCallback(Request $request): RedirectResponse
    {
        $payment = Payment::where('reference', $request->ref)->firstOrFail();

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
        $session = \Stripe\Checkout\Session::retrieve($request->session_id);

        if ($session->payment_status === 'paid') {
            $this->confirmPayment($payment, $session->payment_intent);
        }

        return redirect()->route('student.payment.success', $payment->id);
    }

    public function success(Payment $payment): Response
    {
        abort_if($payment->user_id !== auth()->id(), 403);

        return Inertia::render('student/payment-success', [
            'payment' => [
                'amount'         => $payment->amount,
                'currency'       => $payment->currency,
                'payment_method' => $payment->payment_method,
                'status'         => $payment->status,
                'expires_at'     => $payment->access_expires_at,
            ],
        ]);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private function confirmPayment(Payment $payment, string $txId): void
    {
        $expiresAt = now()->addDays($payment->access_duration_days);

        $payment->update([
            'status'            => 'completed',
            'transaction_id'    => $txId,
            'paid_at'           => now(),
            'access_expires_at' => $expiresAt,
        ]);

        $payment->user()->update(['has_paid_access' => true]);
    }
}
