<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ItecPayment
{
    private string $key;
    private string $url;

    public function __construct()
    {
        $this->key = config('services.itec.api_key', env('ITEC_API_KEY', ''));
        $this->url = rtrim(config('services.itec.api_url', env('ITEC_API_URL', '')), '/');
    }

    /**
     * Initiate a mobile money payment (cashin / collect).
     *
     * Success shape: { "status": 200, "data": { "amount": 10, "transID": "uuid" } }
     * Failure shape: { "status": 400, "data": { "message": "Unauthorized" } }
     */
    public function pay(int $amount, string $phone): Response
    {
        try {
            return Http::timeout(30)->post("{$this->url}/api/pay", [
                'amount' => $amount,
                'phone'  => $phone,
                'key'    => $this->key,
            ]);
        } catch (\Exception $e) {
            Log::error('ItecPayment::pay failed', ['phone' => $phone, 'amount' => $amount, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /** Transfer money out (cashout / disbursement). */
    public function cashOut(int $amount, string $phone): Response
    {
        try {
            return Http::timeout(30)->post("{$this->url}/api/transfer", [
                'amount' => $amount,
                'phone'  => $phone,
                'key'    => $this->key,
            ]);
        } catch (\Exception $e) {
            Log::error('ItecPayment::cashOut failed', ['phone' => $phone, 'amount' => $amount, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /** Extract transaction ID from a successful response, or null. */
    public function extractTransactionId(Response $response): ?string
    {
        if (! $response->successful()) return null;
        $body = $response->json();
        if (isset($body['status']) && (int) $body['status'] === 200) {
            return $body['data']['transID'] ?? $body['data']['ref'] ?? null;
        }
        return null;
    }

    /** Extract human-readable error message from a failed response. */
    
    public function extractErrorMessage(Response $response): string
    {
        $body = $response->json();
        return $body['data']['message'] ?? $body['message'] ?? 'Payment failed. Please try again.';
    }
}
