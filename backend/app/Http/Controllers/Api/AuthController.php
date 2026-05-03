<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $otpCode = (string) random_int(100000, 999999);

        $role = Role::firstOrCreate(['slug' => User::ROLE_APPLICANT], [
            'name' => 'Applicant',
            'description' => 'Admission applicant account.',
            'is_system' => true,
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'role_id' => $role->id,
            'password' => Hash::make($data['password']),
            'preferred_locale' => $data['preferred_locale'] ?? 'en',
            'otp_code' => Hash::make($otpCode),
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        $this->sendOtp($user, $otpCode);

        return response()->json([
            'message' => 'Registration successful. Please verify the OTP sent to your email.',
            'user' => $user->load('role'),
            'token' => $user->createToken('spa')->plainTextToken,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();
        $user = User::with('role')->where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['This account is not active.'],
            ]);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('spa')->plainTextToken,
        ]);
    }

    public function verifyOtp(VerifyOtpRequest $request)
    {
        $user = User::where('email', $request->validated('email'))->firstOrFail();

        if (! $user->otp_code || ! $user->otp_expires_at || now()->greaterThan($user->otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp_code' => ['The OTP has expired. Please request a new code.'],
            ]);
        }

        if (! Hash::check($request->validated('otp_code'), $user->otp_code)) {
            throw ValidationException::withMessages([
                'otp_code' => ['The OTP code is invalid.'],
            ]);
        }

        $user->update([
            'email_verified_at' => now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user->fresh()->load('role'),
        ]);
    }

    public function resendOtp(ForgotPasswordRequest $request)
    {
        $user = User::where('email', $request->validated('email'))->firstOrFail();
        $otpCode = (string) random_int(100000, 999999);

        $user->update([
            'otp_code' => Hash::make($otpCode),
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        $this->sendOtp($user, $otpCode);

        return response()->json([
            'message' => 'A new OTP has been sent to your email.',
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $email = $request->validated('email');
        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        Mail::raw(
            "Use this password reset token for IBNU ABBAS Arabic College: {$token}",
            fn ($message) => $message->to($email)->subject('Password reset token')
        );

        return response()->json([
            'message' => 'Password reset instructions have been sent to your email.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $data = $request->validated();
        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (! $record || now()->subMinutes(60)->greaterThan($record->created_at) || ! Hash::check($data['token'], $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['The password reset token is invalid or expired.'],
            ]);
        }

        User::where('email', $data['email'])->update([
            'password' => Hash::make($data['password']),
        ]);

        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json([
            'message' => 'Password has been reset successfully.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('role', 'student', 'teacher'));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    private function sendOtp(User $user, string $otpCode): void
    {
        Mail::raw(
            "Your IBNU ABBAS Arabic College verification OTP is {$otpCode}. This code expires in 10 minutes.",
            fn ($message) => $message->to($user->email)->subject('Verify your account')
        );
    }
}
