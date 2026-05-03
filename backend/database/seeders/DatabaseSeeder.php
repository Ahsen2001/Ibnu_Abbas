<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = collect([
            [User::ROLE_SUPER_ADMIN, 'Super Admin', 'Full system access.'],
            [User::ROLE_ADMIN_STAFF, 'Admin Staff', 'Administrative operations access.'],
            [User::ROLE_TEACHER, 'Teacher', 'Teacher portal and assigned student access.'],
            [User::ROLE_STUDENT, 'Student', 'Student portal access.'],
            [User::ROLE_APPLICANT, 'Applicant', 'Admission applicant portal access.'],
        ])->mapWithKeys(function (array $role) {
            return [
                $role[0] => Role::firstOrCreate(['slug' => $role[0]], [
                    'name' => $role[1],
                    'description' => $role[2],
                    'is_system' => true,
                ]),
            ];
        });

        Department::firstOrCreate(
            ['code' => 'SHAREEA'],
            ['name' => 'Shareea Education', 'type' => 'shareea', 'description' => 'Academic Islamic studies stream.']
        );

        Department::firstOrCreate(
            ['code' => 'HIFL'],
            ['name' => 'Hifl Program', 'type' => 'hifl', 'description' => 'Quran memorization and revision stream.']
        );

        User::firstOrCreate(['email' => 'admin@ibnuabbas.test'], [
            'name' => 'System Administrator',
            'password' => Hash::make('password'),
            'role_id' => $roles[User::ROLE_SUPER_ADMIN]->id,
        ]);
    }
}
