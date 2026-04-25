<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PricingPlan;
use App\Services\ItecPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'plans'     => PricingPlan::active()->get()->map(fn ($p) => [
                'id'             => $p->id,
                'name'           => $p->name,
                'description'    => $p->description,
                'amount'         => $p->amount,
                'currency'       => $p->currency,
                'duration_days'  => $p->duration_days,
                'duration_label' => $p->duration_label,
                'features'       => $p->features ?? [],
                'badge_label'    => $p->badge_label,
                'is_featured'    => $p->is_featured,
            ]),
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

    public function initiateMomo(Request $request, ItecPayment $itecPayment): RedirectResponse
    {
        $validated = $request->validate([
            'phone'          => ['required', 'string', 'regex:/^(078|079|073|072)[0-9]{7}$/'],
            'payment_method' => 'required|in:mtn_momo,airtel_money',
            'plan_id'        => 'required|exists:pricing_plans,id',
        ]);

        /** @var PricingPlan $plan */
        $plan = PricingPlan::findOrFail($validated['plan_id']);
        abort_unless($plan->is_active, 422, 'This plan is no longer available.');

        $reference = 'WECAN-' . strtoupper(Str::random(8));

        $payment = Payment::create([
            'user_id'              => $request->user()->id,
            'amount'               => $plan->amount,
            'currency'             => $plan->currency,
            'payment_method'       => $validated['payment_method'],
            'status'               => 'pending',
            'reference'            => $reference,
            'access_duration_days' => $plan->duration_days,
            'metadata'             => [
                'phone'     => $validated['phone'],
                'plan_id'   => $plan->id,
                'plan_name' => $plan->name,
                'initiated' => now()->toISOString(),
            ],
        ]);

        try {
            $response = $itecPayment->pay($plan->amount, $validated['phone']);
            $transId  = $itecPayment->extractTransactionId($response);

            if (! $transId) {
                // ITEC returned a failure response (e.g. status 400 Unauthorized)
                $errorMsg = $itecPayment->extractErrorMessage($response);

                $payment->update([
                    'status'   => 'failed',
                    'metadata' => array_merge($payment->metadata ?? [], [
                        'itec_response' => $response->json(),
                    ]),
                ]);

                return back()->withErrors(['payment' => $errorMsg]);
            }

            $payment->update([
                'transaction_id' => $transId,
                'metadata'       => array_merge($payment->metadata ?? [], [
                    'itec_response' => $response->json(),
                ]),
            ]);

            // update payment status
            $this->confirmPayment($payment, $transId);

        } catch (\Exception $e) {
            $payment->update([
                'status'   => 'failed',
                'metadata' => array_merge($payment->metadata ?? [], ['error' => $e->getMessage()]),
            ]);

            return back()->withErrors(['payment' => 'Something went wrong while processing your payment. Please try again.']);
        }

        return redirect()->route('student.payment.success', $payment->id);
    }

    public function success(Payment $payment): Response
    {
        abort_if($payment->user_id !== Auth::id(), 403);

        return Inertia::render('student/payment-success', [
            'payment' => [
                'amount'         => $payment->amount,
                'currency'       => $payment->currency,
                'payment_method' => $payment->payment_method,
                'status'         => $payment->status,
                'expires_at'     => $payment->access_expires_at,
                'transaction_id' => $payment->transaction_id,
                'plan_name'      => $payment->metadata['plan_name'] ?? null,
            ],
        ]);
    }

    /**
     * Called by a webhook or background job once ITEC confirms payment.
     * Mark as completed and activate user access.
     */
    public function webhook(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'transID' => 'required|string',
            'status'  => 'required|string',
        ]);

        $payment = Payment::where('transaction_id', $request->transID)->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->status === 'completed') {
            return response()->json(['message' => 'Already processed']);
        }

        if (strtolower($request->status) === 'successful') {
            $this->confirmPayment($payment, $request->transID);
        } else {
            $payment->update(['status' => 'failed']);
        }

        return response()->json(['message' => 'OK']);
    }

    /** Mark a payment as completed and grant user access. */
    private function confirmPayment(Payment $payment, string $txId): void
    {
        if ($payment->status === 'completed') return;

        $payment->update([
            'status'            => 'completed',
            'transaction_id'    => $txId,
            'paid_at'           => now(),
            'access_expires_at' => now()->addDays($payment->access_duration_days),
        ]);

        $payment->user()->update(['has_paid_access' => true]);
    }
}
