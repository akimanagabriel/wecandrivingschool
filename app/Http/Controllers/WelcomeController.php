<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use App\Models\PublicQuizLink;
use Illuminate\Http\Request;
use Laravel\Fortify\Features;

class WelcomeController extends Controller
{
    public function index()
    {
        $pricingPlans = PricingPlan::active()->get();

        // ─── Get or create a single reusable public quiz link ───
        $publicQuizLink = PublicQuizLink::firstOrCreate(
            ['name' => 'Free Trial - Public Access'],
            [
                'description' => 'Free trial quiz - 2 attempts per IP',
                'max_attempts' => 999,
                'expires_at' => now()->addYears(10),
                'is_active' => true,
                'metadata' => [
                    'attempts_per_ip' => 2, // ← Each IP gets 2 attempts
                ],
            ]
        );

        return inertia('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'plans' => $pricingPlans,
            'featuredPlan' => $pricingPlans->firstWhere('is_featured', true),
            'publicQuizUrl' => $publicQuizLink->getFullUrl(),
        ]);
    }
}
