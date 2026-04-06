<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::with('roles')
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'admin');
            })
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->when($request->role && $request->role !== 'all', fn ($q) => $q->role($request->role))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($u) => [
                'id'             => $u->id,
                'name'           => $u->name,
                'email'          => $u->email,
                'phone'          => $u->phone ?? null,
                'roles'          => $u->getRoleNames(),
                'has_access'     => $u->hasActiveAccess(),
                'is_active'      => $u->is_active,
                'total_attempts' => $u->quizAttempts()->where('is_submitted', true)->count(),
                'pass_rate'      => $u->passRate(),
                'created_at'     => $u->created_at,
            ]);

        return Inertia::render('admin/users/index', [
            'users'   => $users,
            'roles'   => Role::all(['id', 'name']),
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function show(User $user): Response
    {
        $attempts = $user->quizAttempts()
            ->where('is_submitted', true)
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id'         => $a->id,
                'score'      => $a->score,
                'is_passed'  => $a->isPassed(),
                'started_at' => $a->started_at,
                'ended_at'   => $a->ended_at,
            ]);

        return Inertia::render('admin/users/show', [
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'roles'      => $user->getRoleNames(),
                'has_access' => $user->hasActiveAccess(),
                'is_active'  => $user->is_active,
                'pass_rate'  => $user->passRate(),
            ],
            'attempts' => $attempts,
            'payments' => $user->payments()->latest()->get(),
        ]);
    }

    public function toggleAccess(User $user): RedirectResponse
    {
        $user->update(['has_paid_access' => ! $user->has_paid_access]);

        return back()->with('success', 'User access updated.');
    }

    public function assignRole(Request $request, User $user): RedirectResponse
    {
        $request->validate(['role' => 'required|exists:roles,name']);
        $user->syncRoles([$request->role]);

        return back()->with('success', 'Role updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->hasRole('admin'), 403, 'Cannot delete admin users.');
        $user->delete();

        return back()->with('success', 'User deleted.');
    }
}
