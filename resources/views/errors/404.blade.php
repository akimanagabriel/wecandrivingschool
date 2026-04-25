{{-- resources/views/errors/404.blade.php --}}
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found | WeCanDrivingSchool</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />
    <style>
        body {
            font-family: 'Instrument Sans', sans-serif;
        }

        .hero-gradient {
            background: linear-gradient(135deg, #1A0D00 0%, #7B3F00 40%, #472500 100%);
        }
    </style>
</head>

<body class="hero-gradient min-h-screen flex items-center justify-center px-4">
    <div class="max-w-2xl w-full text-center">
        <!-- Logo -->
        <div class="mb-8 flex justify-center">
            <div class="bg-white/10 backdrop-blur rounded-full p-4">
                <div class="w-20 h-20 bg-[#F5C518] rounded-full flex items-center justify-center">
                    <span class="text-3xl"></span>
                </div>
            </div>
        </div>

        <!-- Error Code -->
        <h1 class="text-8xl font-black text-[#F5C518] mb-4">404</h1>

        <!-- Message -->
        <h2 class="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p class="text-white/70 text-lg mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a href="javascript:history.back()"
                class="px-6 py-3 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition border border-white/20">
                ← Go Back
            </a>
            <a href="{{ route('home') }}"
                class="px-6 py-3 bg-[#F5C518] text-[#1B2A4A] font-bold rounded-xl hover:bg-[#D4A800] transition shadow-lg">
                Back to Home
            </a>
        </div>

        <!-- Quick Links -->
        <div class="flex flex-wrap gap-4 justify-center text-sm">
            <a href="{{ route('login') }}" class="text-white/60 hover:text-[#F5C518] transition">Login</a>
            <span class="text-white/30">•</span>
            <a href="{{ route('register') }}" class="text-white/60 hover:text-[#F5C518] transition">Register</a>
            <span class="text-white/30">•</span>
            <a href="#" class="text-white/60 hover:text-[#F5C518] transition">Support</a>
        </div>


    </div>
</body>

</html>