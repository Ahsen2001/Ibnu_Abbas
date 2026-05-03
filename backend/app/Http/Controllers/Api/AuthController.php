<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:30'],
            'preferred_locale' => ['nullable', Rule::in(['en', 'ta', 'ar'])],
        ]);

        $role = Role::firstOrCreate(['slug' => User::ROLE_APPLICANT], [
            'name' => 'Applicant',
            'description' => 'Admission applicant account.',
            'is_system' => true,
        ]);

        $user = User::create([
            ...$data,
            'role_id' => $role->id,
            'password' => Hash::make($data['password']),
            'preferred_locale' => $data['preferred_locale'] ?? 'en',
        ]);

        return response()->json([
            'user' => $user->load('role'),
            'token' => $user->createToken('spa')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return response()->json([
            'user' => $user->load('role'),
            'token' => $user->createToken('spa')->plainTextToken,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('role'));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }
}
