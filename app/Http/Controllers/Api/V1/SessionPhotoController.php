<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSessionPhotoRequest;
use App\Http\Resources\SessionPhotoResource;
use App\Services\SessionPhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SessionPhotoController extends Controller
{
    public function __construct(private SessionPhotoService $service) {}

    public function index(string $ulid): JsonResponse
    {
        $photos = $this->service->getBySession($ulid);
        return response()->json(['data' => SessionPhotoResource::collection($photos->load('session'))]);
    }

    public function store(StoreSessionPhotoRequest $request, string $ulid): JsonResponse
    {
        $photo = $this->service->upload($ulid, $request->file('photo'), $request->user());
        return response()->json(['message' => 'Photo uploaded.', 'data' => new SessionPhotoResource($photo->load('session'))], 201);
    }

    public function download(Request $request, string $ulid, int $id): BinaryFileResponse
    {
        $fileData = $this->service->download($ulid, $id);
        return response()->download($fileData['path'], $fileData['name'], ['Content-Type' => $fileData['mime']]);
    }
}
