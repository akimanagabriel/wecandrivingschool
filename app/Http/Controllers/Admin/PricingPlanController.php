<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PricingPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PricingPlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/pricing-plans/index', [
            'plans' => PricingPlan::orderBy('sort_order')->get()->map(fn ($p) => [
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
                'is_active'      => $p->is_active,
                'sort_order'     => $p->sort_order,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePlan($request);
        $validated['sort_order'] = PricingPlan::max('sort_order') + 1;

        PricingPlan::create($validated);

        return back()->with('success', 'Plan created successfully.');
    }

    public function update(Request $request, PricingPlan $pricingPlan): RedirectResponse
    {
        $validated = $this->validatePlan($request);
        $pricingPlan->update($validated);

        return back()->with('success', 'Plan updated successfully.');
    }

    public function destroy(PricingPlan $pricingPlan): RedirectResponse
    {
        $pricingPlan->delete();

        return back()->with('success', 'Plan deleted.');
    }

    public function toggleActive(PricingPlan $pricingPlan): RedirectResponse
    {
        $pricingPlan->update(['is_active' => ! $pricingPlan->is_active]);

        return back()->with('success', 'Plan status updated.');
    }

    private function validatePlan(Request $request): array
    {
        return $request->validate([
            'name'           => 'required|string|max:100',
            'description'    => 'nullable|string|max:500',
            'amount'         => 'required|integer|min:1',
            'currency'       => 'required|string|max:10',
            'duration_days'  => 'required|integer|min:1|max:365',
            'duration_label' => 'required|string|max:50',
            'features'       => 'nullable|array',
            'features.*'     => 'string|max:200',
            'badge_label'    => 'nullable|string|max:50',
            'is_featured'    => 'boolean',
            'is_active'      => 'boolean',
        ]);
    }
}
