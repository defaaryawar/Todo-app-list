<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Todo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'status',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeDueDateBetween($query, $dates)
{
    if (is_string($dates)) {
        $dates = explode(',', $dates);
    }
    
    if (count($dates) === 2) {
        return $query->whereBetween('due_date', $dates);
    }
    
    return $query;
}
}