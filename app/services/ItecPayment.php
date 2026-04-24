<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class ItecPayment
{
    private $key;
    private $url;
    public function __construct()
    {
        $this->key = env("ITEC_API_KEY");
        $this->url = env("ITEC_API_URL");
    }

    public function pay($amount, $phone)
    {
        $response = Http::post($this->url . "/api/pay", [
            "amount" => $amount,
            "phone" => $phone,
            "key" => $this->key
        ]);
        return $response;
    }


    public function cashOut($amount, $phone)
    {
        $response = Http::post($this->url . "/api/transfer", [
            "amount" => $amount,
            "phone" => $phone,
            "key" => $this->key
        ]);

        return $response;
    }

}