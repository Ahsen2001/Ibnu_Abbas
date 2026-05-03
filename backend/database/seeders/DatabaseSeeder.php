<?php

namespace Database\Seeders;

use App\Models\Department;
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
        Department::firstOrCreate(
            ['code' => 'SHAREEA'],
            ['name' => 'Shareea Education', 'description' => 'Academic Islamic studies stream.']
        );

        Department::firstOrCreate(
            ['code' => 'HIFL'],
            ['name' => 'Hifl Program', 'description' => 'Quran memorization and revision stream.']
        );

        User::firstOrCreate(['email' => 'admin@ibnuabbas.test'], [
            'name' => 'System Administrator',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SUPER_ADMIN,
        ]);
    }
}
