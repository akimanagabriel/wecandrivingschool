<?php

namespace App\Http\Middleware;

use App\Models\SharedAccessLink;
use App\Models\SharedAccessSession;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class HandleSharedAccess
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->route('token');

        if (!$token) {
            return $next($request);
        }

        // Use the Laravel session ID to track guest access, without relying on a separate guest cookie.
        $guestSessionId = Session::getId();

        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link) {
            abort(403, 'This access link has expired or reached its maximum usage limit.');
        }

        $hasExistingGuestAccess = Session::get('shared_access_token') === $token;

        if (!$link->is_active) {
            abort(403, 'This access link has expired or reached its maximum usage limit.');
        }

        if (!$hasExistingGuestAccess) {
            if (($link->expires_at && $link->expires_at->isPast()) || $link->used_count >= $link->max_uses) {
                abort(403, 'This access link has expired or reached its maximum usage limit.');
            }
        }

        if (!$hasExistingGuestAccess) {
            $link->incrementUsage();
            Session::put('shared_access_token', $token);
        }

        // Always ensure a session record exists for stats (history)
        SharedAccessSession::updateOrCreate(
            [
                'shared_access_link_id' => $link->id,
                'session_id' => $guestSessionId,
            ],
            [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'accessed_at' => now(),
            ]
        );

        // Store other flags
        Session::put('shared_access_link_id', $link->id);
        Session::put('is_guest_user', true);

        return $next($request);
    }
}