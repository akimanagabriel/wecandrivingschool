{{-- resources/views/admin/payments-report.blade.php --}}
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Payments Report</title>

    <style>
        @page {
            size: A4;
            margin: 1.2cm;
        }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 9px;
            color: #000;
        }

        h1 {
            font-size: 14px;
            margin-bottom: 2px;
        }

        .muted {
            color: #666;
            font-size: 8px;
        }

        .header {
            margin-bottom: 10px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }

        .summary {
            margin: 10px 0;
            font-size: 9px;
        }

        .summary span {
            margin-right: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 4px;
            font-weight: 600;
        }

        td {
            padding: 4px;
            border-bottom: 1px solid #ddd;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .status {
            text-transform: capitalize;
        }

        .footer {
            position: fixed;
            bottom: -5px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            border-top: 1px solid #000;
            padding-top: 5px;
        }
    </style>
</head>

<body>

    <!-- Header -->
    <div class="header">
        <h1>WecanDriving School · Payments Report</h1>
        <div class="muted">
            Generated: {{ now()->format('Y-m-d H:i') }} |
            Records: {{ count($payments) }}
        </div>
    </div>

    <!-- Summary -->
    <div class="summary">
        <span><strong>Total Revenue:</strong> {{ number_format($totals['completed'] ?? 0, 0) }} RWF</span>
        <span><strong>Failed:</strong> {{ number_format($totals['failed'] ?? 0, 0) }} RWF</span>
        <span>
            <strong>Success Rate:</strong>
            @php
                $total = ($totals['completed'] ?? 0) + ($totals['failed'] ?? 0);
                $rate = $total > 0 ? round(($totals['completed'] ?? 0) / $total * 100, 1) : 0;
            @endphp
            {{ $rate }}%
        </span>
    </div>

    <!-- Table -->
    <table>
        <thead>
            <tr>
                <th width="5%">Nº</th>
                <th width="25%">Client</th>
                <th width="20%">Plan</th>
                <th width="15%" class="text-right">Amount</th>
                <th width="15%">Method</th>
                <th width="10%">Status</th>
                <th width="10%">Date</th>
            </tr>
        </thead>

        <tbody>
            @forelse($payments as $p)
                <tr>
                    <td class="text-center">{{ $loop->index + 1}}</td>

                    <td>
                        {{ $p['user_name'] }}<br>
                        <span class="muted">{{ $p['user_email'] }}</span>
                    </td>

                    <td>
                        {{ $p['plan_name'] ?? 'Unknown plan' }}
                    </td>

                    <td class="text-right">
                        {{ number_format($p['amount'], 0) }} {{ $p['currency'] }}
                    </td>

                    <td>
                        {{ ucfirst(str_replace('_', ' ', $p['payment_method'])) }}
                    </td>

                    <td class="status">
                        {{ $p['status'] }}
                    </td>

                    <td>
                        {{ $p['paid_at'] ? \Carbon\Carbon::parse($p['paid_at'])->format('Y-m-d') : '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 20px;">
                        No payments found
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Total -->
    @if(count($payments))
        <div class="summary" style="margin-top:8px;">
            <strong>Total Amount:</strong>
            {{ number_format(collect($payments)->sum('amount'), 0) }} RWF
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        WeCan Driving School • Financial Report
    </div>

    <!-- Page Numbers (Dompdf reliable method) -->
    <script type="text/php">
        if (isset($pdf)) {
            $x = 510; // horizontal position
            $y = 800; // vertical position (bottom of page)
    
            $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
            $font = null;
            $size = 8;
            $color = array(0, 0, 0);
    
            $pdf->page_text($x, $y, $text, $font, $size, $color);
        }
    </script>


</body>

</html>