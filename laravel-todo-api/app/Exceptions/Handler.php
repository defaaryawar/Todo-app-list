<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
        
        // Customize API responses
        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                if ($e instanceof ValidationException) {
                    return new JsonResponse([
                        'message' => 'The given data was invalid.',
                        'errors' => $e->errors(),
                    ], 422);
                }
                
                if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                    return new JsonResponse([
                        'message' => 'Resource not found.',
                    ], 404);
                }
                
                if ($e instanceof AuthenticationException) {
                    return new JsonResponse([
                        'message' => 'Unauthenticated.',
                    ], 401);
                }
                
                // For production, don't expose detailed error messages
                if (config('app.debug')) {
                    return new JsonResponse([
                        'message' => $e->getMessage(),
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => collect($e->getTrace())->map(fn ($trace) => collect($trace)->forget(['args'])->all())->all(),
                    ], 500);
                }
                
                return new JsonResponse([
                    'message' => 'Server Error',
                ], 500);
            }
            
            return null;
        });
    }
}