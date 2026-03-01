<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['super_admin', 'mentor', 'mentee'])],
            'student_id' => ['nullable', 'string', 'max:100'],
            'year_level' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:50'],
            'profile_complete' => ['nullable', 'boolean'],
        ]);

        $user = $this->userRepository->create($data);

        return response()->json(['data' => new UserResource($user)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);
        abort_if(!$user, 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(['super_admin', 'mentor', 'mentee'])],
            'student_id' => ['nullable', 'string', 'max:100'],
            'year_level' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:50'],
            'profile_complete' => ['nullable', 'boolean'],
        ]);

        $updated = $this->userRepository->update($user, $data);

        return response()->json(['data' => new UserResource($updated)]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($request->user()?->id === $id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user = $this->userRepository->findById($id);
        abort_if(!$user, 404);

        $this->userRepository->delete($user);

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);
        abort_if(!$user, 404);

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->password = $data['password'];
        $user->save();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
