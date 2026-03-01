<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private UserRepository $userRepository) {}

    public function index(Request $request): JsonResponse
    {
        $users = $this->userRepository->getAllUsers($request->only(['role', 'search', 'per_page']));
        return response()->json(UserResource::collection($users)->response()->getData(true));
    }

    public function mentors(): JsonResponse
    {
        $mentors = $this->userRepository->getMentors();
        return response()->json(['data' => UserResource::collection($mentors)]);
    }
}
