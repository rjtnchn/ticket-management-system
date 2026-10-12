<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = $request->user()->tickets()->latest()->paginate(10);

        return Inertia::render('Tickets/Index', ['tickets' => $tickets]);
    }

    public function create()
    {
        return Inertia::render('Tickets/Create', ['options' => $this->options()]);
    }

    public function store(StoreTicketRequest $request)
    {
        $request->user()->tickets()->create($request->validated());

        return redirect()->route('tickets.index')->with('success', 'Ticket created.');
    }

    public function show(Ticket $ticket)
    {
        Gate::authorize('view', $ticket);

        return Inertia::render('Tickets/Show', ['ticket' => $ticket]);
    }

    public function edit(Ticket $ticket)
    {
        Gate::authorize('update', $ticket);

        return Inertia::render('Tickets/Edit', [
            'ticket' => $ticket,
            'options' => $this->options(),
        ]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        Gate::authorize('update', $ticket);

        $ticket->update($request->validated());

        return redirect()->route('tickets.show', $ticket)->with('success', 'Ticket updated.');
    }

    public function destroy(Ticket $ticket)
    {
        Gate::authorize('delete', $ticket);

        $ticket->delete();

        return redirect()->route('tickets.index')->with('success', 'Ticket deleted.');
    }

    private function options(): array
    {
        return [
            'priorities' => Ticket::PRIORITIES,
            'statuses' => Ticket::STATUSES,
            'categories' => Ticket::CATEGORIES,
        ];
    }
}