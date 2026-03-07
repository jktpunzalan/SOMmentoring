<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __construct(private UserRepository $userRepository) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('local')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('private/avatars', 'local');
        }

        $updated = $this->userRepository->update($user, $data);
        return response()->json(['message' => 'Profile updated.', 'data' => new UserResource($updated)]);
    }

    public function serveAvatar(Request $request, string $filename)
    {
        $filename = basename($filename);
        abort_if($filename === '' || str_contains($filename, '..'), 404);

        $path = 'private/avatars/' . $filename;
        abort_if(!Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }
}
