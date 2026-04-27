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

        // Check if already in a shared session
        if (Session::get('shared_access_token') === $token) {
            return $next($request);
        }

        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link || !$link->isValid()) {
            abort(403, 'This access link has expired or reached its maximum usage limit.');
        }

        // Increment usage count
        $link->incrementUsage();

        // Create session record
        SharedAccessSession::create([
            'shared_access_link_id' => $link->id,
            'session_id' => Session::getId(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'accessed_at' => now(),
        ]);

        // Store in session that this is a shared access user
        Session::put('shared_access_token', $token);
        Session::put('shared_access_link_id', $link->id);
        Session::put('is_guest_user', true);

        return $next($request);
    }
}