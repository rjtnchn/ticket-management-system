<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    public const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
    public const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
    public const CATEGORIES = ['Hardware', 'Software', 'Network', 'Account', 'Other'];

    protected $fillable = ['title', 'description', 'priority', 'status', 'category'];
}
