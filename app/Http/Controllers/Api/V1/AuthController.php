<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterMenteeRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterMenteeRequest $request): JsonResponse
    {
        $user = $this->authService->registerMentee($request->validated());
        return response()->json(['message' => 'Registration successful. Awaiting mentor approval.', 'user' => new UserResource($user)], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login($request->validated());
        return response()->json(['message' => 'Login successful.', 'user' => new UserResource($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user()->load('mentor'))]);
    }
}
