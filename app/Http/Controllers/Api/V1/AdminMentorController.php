<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminMentorController extends Controller
{
    public function index(): JsonResponse
    {
        $mentors = User::where('role', 'mentor')->orderBy('name')->get();
        return response()->json(['data' => UserResource::collection($mentors)]);
    }
}
