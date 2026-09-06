<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@site.com'],
            [
                'name' => 'Admin WeCanDriving',
                'password' => Hash::make('admin@12345'),
                'is_active' => true,
                'has_paid_access' => true,
            ]
        );
        $admin->assignRole('admin');

        // Demo students
        $students = [
            ['name' => 'Alice Uwimana',  'email' => 'alice@example.com'],
            ['name' => 'Bob Habimana',   'email' => 'bob@example.com'],
            ['name' => 'Claire Mukasa',  'email' => 'claire@example.com'],
        ];

        foreach ($students as $s) {
            $user = User::firstOrCreate(
                ['email' => $s['email']],
                [
                    'name' => $s['name'],
                    'password' => Hash::make('Student@12345'),
                    'is_active' => true,
                    'has_paid_access' => true,
                ]
            );
            $user->assignRole('student');
        }
    }
}
