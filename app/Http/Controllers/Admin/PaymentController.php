<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $payments = Payment::with('user')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->method, fn ($q) => $q->where('payment_method', $request->method))
            ->when($request->search, fn ($q) => $q->whereHas('user', fn ($u) =>
                $u->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($p) => [
                'id'             => $p->id,
                'user_name'      => $p->user->name,
                'user_email'     => $p->user->email,
                'amount'         => $p->amount,
                'currency'       => $p->currency,
                'payment_method' => $p->payment_method,
                'status'         => $p->status,
                'transaction_id' => $p->transaction_id,
                'paid_at'        => $p->paid_at,
                'expires_at'     => $p->access_expires_at,
            ]);

        $totals = [
            'total'     => Payment::where('status', 'completed')->sum('amount'),
            'thisMonth' => Payment::where('status', 'completed')->whereMonth('paid_at', now()->month)->sum('amount'),
            'pending'   => Payment::where('status', 'pending')->count(),
        ];

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'totals'   => $totals,
            'filters'  => $request->only(['search', 'status', 'method']),
        ]);
    }

    public function refund(Payment $payment): RedirectResponse
    {
        abort_if($payment->status !== 'completed', 422, 'Only completed payments can be refunded.');

        $payment->update(['status' => 'refunded']);

        $user           = $payment->user;
        $hasOtherActive = $user->payments()
            ->where('id', '!=', $payment->id)
            ->where('status', 'completed')
            ->where(fn ($q) => $q->whereNull('access_expires_at')->orWhere('access_expires_at', '>', now()))
            ->exists();

        if (! $hasOtherActive) {
            $user->update(['has_paid_access' => false]);
        }

        return back()->with('success', 'Payment refunded.');
    }
}
