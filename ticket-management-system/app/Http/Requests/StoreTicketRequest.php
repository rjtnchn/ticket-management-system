<?php

namespace App\Http\Requests;

use App\Models\Ticket;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'priority' => ['required', Rule::in(Ticket::PRIORITIES)],
            'status' => ['required', Rule::in(Ticket::STATUSES)],
            'category' => ['required', Rule::in(Ticket::CATEGORIES)],
        ];
    }
}