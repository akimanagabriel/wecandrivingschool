<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CheckPaidAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = User::find(Auth::id());

        if (!$user) {
            return redirect()->route('login');
        }

        $this->syncPaidAccessStatus($user);

        if (!$user->hasActiveAccess()) {
            session()->put('url.intended', $request->fullUrl());

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your access has expired. Please purchase a plan to continue.',
                    'code' => 'ACCESS_EXPIRED',
                    'redirect_url' => route('pricing')
                ], 403);
            }

            // Flash error message and redirect to pricing page
            return redirect("/student/payment")
                ->with('error', 'Your access has expired. Please purchase a plan to continue.');
        }

        // Optional: Add access info to request for controllers
        $request->merge([
            'user_has_access' => true,
        ]);

        return $next($request);
    }

    /**
     * Sync the has_paid_access flag with actual payment status
     * This updates the boolean flag without modifying the model structure
     *
     * @param \App\Models\User $user
     * @return void
     */
    protected function syncPaidAccessStatus($user): void
    {
        try {
            // Check if there's an active payment (not expired)
            $hasActivePayment = $user->payments()
                ->where('status', 'completed')
                ->where(function ($query) {
                    $query->whereNull('access_expires_at')
                        ->orWhere('access_expires_at', '>', now());
                })
                ->exists();

            // If has_paid_access flag doesn't match actual payment status, update it
            if ($user->has_paid_access !== $hasActivePayment) {
                $user->update(['has_paid_access' => $hasActivePayment]);

                // Log the change for debugging
                Log::info('User paid access status synced', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'new_status' => $hasActivePayment,
                    'previous_status' => !$hasActivePayment
                ]);
            }
        } catch (\Exception $e) {
            // Don't let middleware fail if status sync fails
            Log::error('Failed to sync paid access status', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
