<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use Illuminate\Http\Request;
use Laravel\Fortify\Features;

class WelcomeController extends Controller
{
    public function index()
    {
        $pricingPlans = PricingPlan::active()->get();

        return inertia('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'plans' => $pricingPlans,
            'featuredPlan' => $pricingPlans->firstWhere('is_featured', true),
        ]);
    }
}
