<?php

namespace App\Http\Controllers;

use App\Models\Payment;
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
            'payments' => $user->payments()->latest()->get()->map(fn($p) => [
                'id'             => $p->id,
                'amount'         => $p->amount,
                'currency'       => $p->currency,
                'payment_method' => $p->payment_method,
                'status'         => $p->status,
                'transaction_id' => $p->transaction_id,
                'reference'      => $p->reference,
                'paid_at'        => $p->paid_at,
                'expires_at'     => $p->access_expires_at,
                'created_at'     => $p->created_at,
            ]),
        ]);

    }

    public function initiateMomo(Request $request, ItecPayment $itecPayment): RedirectResponse
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

        try {
            $rawResponse = $itecPayment->pay($amount, $validated['phone']);
            $body = $rawResponse->json(); // Automatically decodes JSON to array

            // If it's not JSON, we'll get null or the raw body if we use json()
            // Let's ensure we have a fallback if the API returns non-JSON errors
            if (!$body && $rawResponse->failed()) {
                $errorMessage = "Gateway Error: " . ($rawResponse->body() ?: "Status Code " . $rawResponse->status());
                throw new \Exception($errorMessage);
            }

            $apiStatus  = $body['status'] ?? null;
            $apiData    = $body['data']   ?? [];

            if ($apiStatus === 200) {
                $transId = $apiData['transID'] ?? null;

                $payment->update([
                    'status'             => "completed",
                    'transaction_id'     => $transId,
                    'paid_at'            => now()->toDateTimeLocalString(),
                    'access_expires_at'  => now()->addDays($payment->access_duration_days),
                    'metadata'           => array_merge($payment->metadata ?? [], [
                        'gateway_response' => $body,
                        'gateway_amount'   => $apiData['amount'] ?? null,
                    ]),
                ]);

                return redirect()
                    ->route('student.payment.success', $payment->id)
                    ->with('success', 'Payment initiated! Check your phone for the MoMo prompt.');
            }

            // Error path from API
            $gatewayMessage = $apiData['message'] ?? 'Payment gateway error (Status: ' . ($apiStatus ?? 'unknown') . ')';

            $payment->update([
                'status'   => 'failed',
                'metadata' => array_merge($payment->metadata ?? [], [
                    'gateway_response' => $body,
                    'gateway_error'    => $gatewayMessage,
                ]),
            ]);

            return back()
                ->with('error', $gatewayMessage)
                ->withErrors(['payment' => $gatewayMessage]);

        } catch (\Exception $e) {
            $payment->update([
                'status'   => 'failed',
                'metadata' => array_merge($payment->metadata ?? [], [
                    'error' => $e->getMessage(),
                ]),
            ]);

            return back()
                ->with('error', 'Connection Error: ' . $e->getMessage())
                ->withErrors(['payment' => $e->getMessage()]);
        }
    }



    public function success(Payment $payment): Response
    {
        abort_if($payment->user_id !== Auth::user()->id, 403);

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
