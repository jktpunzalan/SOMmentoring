<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MentorMenteeResource;
use App\Models\MentorMentee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMenteeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'mentor_id' => ['nullable', 'integer'],
            'status' => ['nullable', 'in:approved,pending,rejected'],
            'year_level' => ['nullable', 'string', 'max:50'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $query = MentorMentee::with(['mentor', 'mentee']);

        if (!empty($filters['mentor_id'])) {
            $query->where('mentor_id', (int) $filters['mentor_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['year_level'])) {
            $query->whereHas('mentee', fn ($q) => $q->where('year_level', $filters['year_level']));
        }

        if (!empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            $query->whereHas('mentee', fn ($q) => $q->where('name', 'like', $term)->orWhere('email', 'like', $term));
        }

        $records = $query->orderBy('created_at', 'desc')->get();

        return response()->json(MentorMenteeResource::collection($records)->response()->getData(true));
    }
}
