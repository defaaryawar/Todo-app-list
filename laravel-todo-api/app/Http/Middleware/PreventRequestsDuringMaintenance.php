<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PreventRequestsDuringMaintenance
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (file_exists(storage_path('framework/maintenance.php'))) {
            return new Response("Beberapa bagian dari aplikasi sedang dalam pemeliharaan.", 503);
        }

        return $next($request);
    }
}
