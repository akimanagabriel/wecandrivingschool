<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name'        => config('app.name'),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'auth'        => [
                'user' => $user,
            ],
            // ── WeCanDrivingSchool additions ────────────────────────────────
            'userRoles'       => $user ? $user->getRoleNames() : [],
            'userPermissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
            'hasAccess'       => $user ? $user->hasActiveAccess() : false,
            'flash'           => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
