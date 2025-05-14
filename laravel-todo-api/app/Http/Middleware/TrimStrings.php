<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TrimStrings
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
        // Trim semua input string untuk menghilangkan spasi di awal dan akhir
        foreach ($request->all() as $key => $value) {
            if (is_string($value)) {
                $request[$key] = trim($value);
            }
        }

        return $next($request);
    }
}
