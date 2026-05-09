<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return User::with('role')
            ->when($request->query('role'), fn ($query, $role) => $query->whereHas('role', fn ($roleQuery) => $roleQuery->where('slug', $role)))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate((int) $request->query('per_page', 20));
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['preferred_locale'] = $data['preferred_locale'] ?? 'en';
        $data['status'] = $data['status'] ?? 'active';

        $user = User::create($data);

        return response()->json($user->load('role'), 201);
    }

    public function show(User $user)
    {
        return $user->load('role', 'student', 'teacher');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return $user->fresh()->load('role');
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->is($user)) {
            abort(422, 'You cannot delete your own account.');
        }

        $user->delete();

        return response()->noContent();
    }
}
