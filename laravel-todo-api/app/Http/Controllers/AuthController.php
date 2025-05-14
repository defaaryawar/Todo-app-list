<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create token with refresh token capability
        $token = $user->createToken('auth_token', expiresAt: now()->addMinutes(60));
        $refreshToken = $user->createToken('refresh_token', expiresAt: now()->addDays(30));

        return response()->json([
            'user' => new UserResource($user),
            'access_token' => $token->plainTextToken,
            'refresh_token' => $refreshToken->plainTextToken,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user and create token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        
        // Revoke all previous tokens
        $user->tokens()->delete();
        
        // Create new tokens
        $token = $user->createToken('auth_token', expiresAt: now()->addMinutes(60));
        $refreshToken = $user->createToken('refresh_token', expiresAt: now()->addDays(30));

        return response()->json([
            'user' => new UserResource($user),
            'access_token' => $token->plainTextToken,
            'refresh_token' => $refreshToken->plainTextToken,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Refresh access token using refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $refreshToken = explode('|', $request->refresh_token)[1] ?? $request->refresh_token;
        
        $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($refreshToken);
        
        if (!$tokenModel || $tokenModel->name !== 'refresh_token' || $tokenModel->expires_at < now()) {
            return response()->json([
                'message' => 'Invalid refresh token'
            ], 401);
        }
        
        $user = $tokenModel->tokenable;
        
        // Revoke the used refresh token (rotation)
        $tokenModel->delete();
        
        // Create new tokens
        $token = $user->createToken('auth_token', expiresAt: now()->addMinutes(60));
        $newRefreshToken = $user->createToken('refresh_token', expiresAt: now()->addDays(30));

        return response()->json([
            'access_token' => $token->plainTextToken,
            'refresh_token' => $newRefreshToken->plainTextToken,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user())
        ]);
    }
}