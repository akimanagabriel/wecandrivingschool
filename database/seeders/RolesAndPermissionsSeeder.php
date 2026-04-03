<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'take quiz', 'view results', 'access paid content',
            'manage quizzes', 'manage questions', 'manage users',
            'view student results', 'view payments', 'manage payments',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $student = Role::firstOrCreate(['name' => 'student']);
        $student->syncPermissions(['take quiz', 'view results', 'access paid content']);

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions($permissions);
    }
}
