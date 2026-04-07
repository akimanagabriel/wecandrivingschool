<?php

namespace App\Services;

use Paypack\Paypack;

class PaypackService
{
    protected $paypack;

    public function __construct()
    {
        $this->paypack = new Paypack();
        $this->paypack->config([
            'client_id' => env('PAYPACK_CLIENT_ID'),
            'client_secret' => env('PAYPACK_CLIENT_SECRET'),
        ]);
    }

    public function cashin($amount, $phone)
    {
        return $this->paypack->cashin([
            "amount" => $amount,
            "phone" => $phone
        ]);
    }

    public function cashout($amount, $phone)
    {
        return $this->paypack->cashout([
            'amount' => $amount,
            'number' => $phone,
        ]);
    }

    public function checkStatus($ref)
    {
        return $this->paypack->transaction($ref);
    }
}