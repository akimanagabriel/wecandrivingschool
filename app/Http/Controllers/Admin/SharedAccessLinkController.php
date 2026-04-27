<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SharedAccessLink;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SharedAccessLinkController extends Controller
{
    public function index(Request $request): Response
    {
        $links = SharedAccessLink::with('creator')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('token', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(20)
            ->through(fn($link) => [
                'id' => $link->id,
                'name' => $link->name,
                'token' => $link->token,
                'max_uses' => $link->max_uses,
                'used_count' => $link->used_count,
                'remaining_uses' => $link->getRemainingUses(),
                'expires_at' => $link->expires_at,
                'is_active' => $link->is_active,
                'is_valid' => $link->isValid(),
                'created_by' => $link->creator?->name,
                'created_at' => $link->created_at,
                'last_used_at' => $link->last_used_at,
                'url' => $link->getFullUrl(),
            ]);

        return Inertia::render('admin/shared-links/index', [
            'links' => $links,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'max_uses' => 'required|integer|min:1|max:10000',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $link = SharedAccessLink::create([
            'name' => $validated['name'] ?? 'Untitled Link',
            'max_uses' => $validated['max_uses'],
            'expires_at' => $validated['expires_at'] ?? null,
            'created_by' => $request->user()->id,
            'is_active' => true,
        ]);

        return back()->with('success', 'Access link created successfully. URL: ' . $link->getFullUrl());
    }

    public function update(Request $request, SharedAccessLink $sharedAccessLink)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'max_uses' => 'required|integer|min:1|max:10000',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $sharedAccessLink->update($validated);

        return back()->with('success', 'Access link updated successfully.');
    }

    public function destroy(SharedAccessLink $sharedAccessLink)
    {
        $sharedAccessLink->delete();

        return back()->with('success', 'Access link deleted successfully.');
    }

    public function toggleActive(SharedAccessLink $sharedAccessLink)
    {
        $sharedAccessLink->update(['is_active' => !$sharedAccessLink->is_active]);

        return back()->with('success', 'Link status updated.');
    }

    public function regenerateToken(SharedAccessLink $sharedAccessLink)
    {
        $sharedAccessLink->update(['token' => \Illuminate\Support\Str::random(32)]);

        return back()->with('success', 'New link generated: ' . $sharedAccessLink->getFullUrl());
    }

    public function stats(SharedAccessLink $sharedAccessLink)
    {
        $sessions = $sharedAccessLink->sessions()
            ->with('quizAttempt')
            ->latest()
            ->get()
            ->map(fn($session) => [
                'accessed_at' => $session->accessed_at,
                'ip_address' => $session->ip_address,
                'score' => $session->quizAttempt?->score,
                'is_passed' => $session->quizAttempt?->isPassed(),
            ]);

        return Inertia::render('admin/shared-links/stats', [
            'link' => [
                'id' => $sharedAccessLink->id,
                'name' => $sharedAccessLink->name,
                'token' => $sharedAccessLink->token,
                'max_uses' => $sharedAccessLink->max_uses,
                'used_count' => $sharedAccessLink->used_count,
                'remaining_uses' => $sharedAccessLink->getRemainingUses(),
                'expires_at' => $sharedAccessLink->expires_at,
                'url' => $sharedAccessLink->getFullUrl(),
            ],
            'sessions' => $sessions,
            'total_attempts' => $sessions->whereNotNull('score')->count(),
            'average_score' => $sessions->whereNotNull('score')->avg('score'),
            'pass_rate' => $sessions->where('is_passed', true)->count() > 0
                ? round($sessions->where('is_passed', true)->count() / max(1, $sessions->whereNotNull('score')->count()) * 100, 1)
                : 0,
        ]);
    }
}