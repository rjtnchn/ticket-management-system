# Ticket Management System - Implementation Guide

## Overview
This guide will walk you through building a complete Ticket Management System using Laravel 12 + Inertia.js + React. Follow each step in order and commit after completing each major feature.

---

## PHASE 1: Setup Laravel Breeze with Inertia + React

### Step 1.1: Install Laravel Breeze with Inertia Stack
**What we're doing:** Installing authentication scaffolding with Inertia.js and React.

**Commands to run:**
```bash
cd laravel
php artisan breeze:install react
```

**When prompted, select:**
- Stack: `React with Inertia`
- Dark mode support: `no` (or your preference)
- TypeScript: `no` (keep it simple)
- PHPUnit: `yes`

**What this does:**
- Installs Inertia.js adapter for Laravel
- Sets up React as the frontend framework
- Creates authentication views (Login, Register, Dashboard)
- Configures Tailwind CSS
- Adds `HandleInertiaRequests` middleware

### Step 1.2: Install Dependencies and Build Assets
**Commands to run:**
```bash
npm install
npm run build
```

**What this does:**
- Installs React, Inertia.js, Tailwind CSS, and all frontend dependencies
- Builds frontend assets for production

### Step 1.3: Run Migrations
**Command to run:**
```bash
php artisan migrate
```

**What this does:**
- Creates `users`, `password_reset_tokens`, `sessions`, `cache`, and `jobs` tables
- Sets up authentication infrastructure

### Step 1.4: Test the Installation
**Command to run:**
```bash
php artisan serve
```

**Then visit:** `http://localhost:8000`

**What to check:**
- Register a new account
- Log in with the account
- Access the dashboard at `/dashboard`
- Log out

**Git commit:**
```bash
git add .
git commit -m "feat: install Laravel Breeze with Inertia React stack

- Installed Laravel Breeze with React and Inertia.js
- Set up authentication scaffolding (register, login, logout)
- Configured Tailwind CSS for styling
- Built frontend assets
- Ran initial migrations for users and auth tables"
```

---

## PHASE 2: Create Ticket Model and Migration

### Step 2.1: Generate Ticket Model, Migration, and Controller
**Command to run:**
```bash
php artisan make:model Ticket -mcr
```

**What this does:**
- Creates `app/Models/Ticket.php` model
- Creates migration file in `database/migrations/`
- Creates `TicketController` with resourceful methods

### Step 2.2: Edit the Ticket Migration
**File to edit:** `database/migrations/XXXX_XX_XX_XXXXXX_create_tickets_table.php`

**What to add in the `up()` method:**
```php
Schema::create('tickets', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('title', 255);
    $table->text('description');
    $table->enum('priority', ['Low', 'Medium', 'High', 'Urgent']);
    $table->enum('status', ['Open', 'In Progress', 'Resolved', 'Closed'])->default('Open');
    $table->string('category'); // Hardware, Software, Network, Account, Other
    $table->timestamps();
});
```

**Explanation:**
- `id`: Auto-incrementing primary key
- `user_id`: Foreign key linking to the users table, cascades on delete
- `title`: Required string (5-255 characters, validated in Form Request)
- `description`: Text field for detailed ticket information
- `priority`: Enum with 4 levels (Low, Medium, High, Urgent)
- `status`: Enum with 4 states, defaults to 'Open'
- `category`: String for ticket category
- `timestamps`: Automatically managed created_at and updated_at

### Step 2.3: Define the Ticket Model
**File to edit:** `app/Models/Ticket.php`

**What to add:**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Using $fillable protects against mass assignment vulnerabilities.
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'priority',
        'status',
        'category',
    ];

    /**
     * Define the relationship: A ticket belongs to a user.
     * This allows us to access $ticket->user to get the owner.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

**Explanation:**
- `$fillable`: Whitelist of attributes that can be mass-assigned (security feature)
- `user()` relationship: Links each ticket to its owner

### Step 2.4: Update User Model
**File to edit:** `app/Models/User.php`

**What to add (inside the User class):**
```php
/**
 * Define the relationship: A user has many tickets.
 * This allows us to access $user->tickets to get all their tickets.
 */
public function tickets()
{
    return $this->hasMany(Ticket::class);
}
```

### Step 2.5: Run the Migration
**Command to run:**
```bash
php artisan migrate
```

**What this does:**
- Creates the `tickets` table in the database with all specified columns

**Git commit:**
```bash
git add .
git commit -m "feat: create Ticket model and migration

- Generated Ticket model with mass-assignment protection
- Created tickets table migration with:
  * user_id foreign key with cascade delete
  * title (string, 255 max)
  * description (text)
  * priority enum (Low, Medium, High, Urgent)
  * status enum (Open, In Progress, Resolved, Closed) default Open
  * category (string)
  * timestamps
- Defined User-Ticket relationships (one-to-many)
- Created TicketController resource controller"
```

---

## PHASE 3: Create Form Request Classes for Validation

### Step 3.1: Generate Form Request Classes
**Commands to run:**
```bash
php artisan make:request StoreTicketRequest
php artisan make:request UpdateTicketRequest
```

**What this does:**
- Creates validation classes in `app/Http/Requests/`
- Separates validation logic from controllers (clean architecture)

### Step 3.2: Edit StoreTicketRequest
**File to edit:** `app/Http/Requests/StoreTicketRequest.php`

**Replace entire content with:**
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Return true because we handle authorization in the controller/policy.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * These rules ensure data integrity before saving to the database.
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
            'status' => ['required', Rule::in(['Open', 'In Progress', 'Resolved', 'Closed'])],
            'category' => ['required', 'string', Rule::in(['Hardware', 'Software', 'Network', 'Account', 'Other'])],
        ];
    }

    /**
     * Custom error messages for better user experience.
     */
    public function messages(): array
    {
        return [
            'title.min' => 'The title must be at least 5 characters.',
            'description.min' => 'The description must be at least 10 characters.',
            'priority.in' => 'Please select a valid priority level.',
            'status.in' => 'Please select a valid status.',
            'category.in' => 'Please select a valid category.',
        ];
    }
}
```

**Explanation:**
- `authorize()`: Returns true (authorization handled by Policy)
- `rules()`: Defines validation rules for each field
- `Rule::in()`: Ensures values match exactly the enum values in the database
- `messages()`: Custom error messages for better UX

### Step 3.3: Edit UpdateTicketRequest
**File to edit:** `app/Http/Requests/UpdateTicketRequest.php`

**Replace entire content with:**
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules for updating a ticket.
     * Same rules as store, but applied during updates.
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
            'status' => ['required', Rule::in(['Open', 'In Progress', 'Resolved', 'Closed'])],
            'category' => ['required', 'string', Rule::in(['Hardware', 'Software', 'Network', 'Account', 'Other'])],
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'title.min' => 'The title must be at least 5 characters.',
            'description.min' => 'The description must be at least 10 characters.',
            'priority.in' => 'Please select a valid priority level.',
            'status.in' => 'Please select a valid status.',
            'category.in' => 'Please select a valid category.',
        ];
    }
}
```

**Git commit:**
```bash
git add .
git commit -m "feat: add Form Request validation classes

- Created StoreTicketRequest with validation rules:
  * title: required, string, 5-255 chars
  * description: required, string, min 10 chars
  * priority: required, must be Low|Medium|High|Urgent
  * status: required, must be Open|In Progress|Resolved|Closed
  * category: required, must be Hardware|Software|Network|Account|Other
- Created UpdateTicketRequest with same validation rules
- Added custom error messages for better UX
- Used Rule::in() for enum validation to match database constraints"
```

---

## PHASE 4: Create Ticket Policy for Authorization

### Step 4.1: Generate Ticket Policy
**Command to run:**
```bash
php artisan make:policy TicketPolicy --model=Ticket
```

**What this does:**
- Creates `app/Policies/TicketPolicy.php`
- Automatically includes common policy methods

### Step 4.2: Edit the Ticket Policy
**File to edit:** `app/Policies/TicketPolicy.php`

**Replace the content with:**
```php
<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Determine if the user can view the ticket.
     * Only the ticket owner can view their own ticket.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->id === $ticket->user_id;
    }

    /**
     * Determine if the user can update the ticket.
     * Only the ticket owner can update their own ticket.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        return $user->id === $ticket->user_id;
    }

    /**
     * Determine if the user can delete the ticket.
     * Only the ticket owner can delete their own ticket.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->id === $ticket->user_id;
    }
}
```

**Explanation:**
- Each method checks if the authenticated user's ID matches the ticket's user_id
- Returns boolean: true = authorized, false = 403 Forbidden
- Laravel automatically discovers this policy because of naming convention (TicketPolicy for Ticket model)

**Git commit:**
```bash
git add .
git commit -m "feat: add TicketPolicy for authorization

- Created TicketPolicy to restrict ticket access to owners only
- Implemented view() method: only owner can view
- Implemented update() method: only owner can edit
- Implemented delete() method: only owner can delete
- Policy prevents users from accessing other users' tickets via URL manipulation
- Laravel auto-discovers policy via naming convention"
```

---

## PHASE 5: Implement Ticket Controller

### Step 5.1: Edit TicketController
**File to edit:** `app/Http/Controllers/TicketController.php`

**Replace entire content with:**
```php
<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display a paginated list of the authenticated user's tickets.
     * GET /tickets
     */
    public function index(Request $request)
    {
        // Get only the current user's tickets, paginated (10 per page)
        $tickets = $request->user()
            ->tickets()
            ->latest() // Most recent first
            ->paginate(10);

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Show the form for creating a new ticket.
     * GET /tickets/create
     */
    public function create()
    {
        return Inertia::render('Tickets/Create');
    }

    /**
     * Store a newly created ticket in the database.
     * POST /tickets
     */
    public function store(StoreTicketRequest $request)
    {
        // Validation happens automatically via StoreTicketRequest
        // Create ticket and automatically set user_id to current user
        $request->user()->tickets()->create($request->validated());

        // Redirect back to tickets list with success message
        return redirect()->route('tickets.index')
            ->with('success', 'Ticket created successfully.');
    }

    /**
     * Display the specified ticket.
     * GET /tickets/{ticket}
     */
    public function show(Ticket $ticket)
    {
        // Authorization check: ensure user owns this ticket
        $this->authorize('view', $ticket);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Show the form for editing the specified ticket.
     * GET /tickets/{ticket}/edit
     */
    public function edit(Ticket $ticket)
    {
        // Authorization check: ensure user owns this ticket
        $this->authorize('update', $ticket);

        return Inertia::render('Tickets/Edit', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Update the specified ticket in the database.
     * PUT/PATCH /tickets/{ticket}
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        // Authorization check: ensure user owns this ticket
        $this->authorize('update', $ticket);

        // Update the ticket with validated data
        $ticket->update($request->validated());

        // Redirect back to tickets list with success message
        return redirect()->route('tickets.index')
            ->with('success', 'Ticket updated successfully.');
    }

    /**
     * Remove the specified ticket from the database.
     * DELETE /tickets/{ticket}
     */
    public function destroy(Ticket $ticket)
    {
        // Authorization check: ensure user owns this ticket
        $this->authorize('delete', $ticket);

        // Delete the ticket
        $ticket->delete();

        // Redirect back to tickets list with success message
        return redirect()->route('tickets.index')
            ->with('success', 'Ticket deleted successfully.');
    }
}
```

**Explanation:**
- `index()`: Shows paginated list of user's tickets (10 per page)
- `create()`: Renders the create form
- `store()`: Validates and saves new ticket, sets user_id automatically
- `show()`: Displays single ticket details with authorization check
- `edit()`: Renders edit form with authorization check
- `update()`: Validates and updates ticket with authorization check
- `destroy()`: Deletes ticket with authorization check
- `$this->authorize()`: Calls the TicketPolicy methods
- `->with('success', ...)`: Flash message shared via Inertia

### Step 5.2: Configure Flash Messages in Inertia Middleware
**File to edit:** `app/Http/Middleware/HandleInertiaRequests.php`

**Find the `share()` method and update it:**
```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
        ],
        // Share flash messages with all Inertia pages
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
        ],
    ];
}
```

**Explanation:**
- Flash messages are now available in all React components via `usePage().props.flash`
- Using closures `fn()` ensures messages are only retrieved once per request

**Git commit:**
```bash
git add .
git commit -m "feat: implement TicketController with full CRUD

- Implemented index() method: paginated list of user's tickets (10/page)
- Implemented create() method: render ticket creation form
- Implemented store() method: validate and save new ticket
- Implemented show() method: display single ticket with authorization
- Implemented edit() method: render edit form with authorization
- Implemented update() method: validate and update ticket with authorization
- Implemented destroy() method: delete ticket with authorization
- Set user_id automatically from auth()->user() (never from form input)
- Added authorization checks using TicketPolicy
- Configured flash messages in HandleInertiaRequests middleware
- All methods use Inertia::render() for SPA experience"
```

---

## PHASE 6: Define Routes

### Step 6.1: Add Ticket Routes
**File to edit:** `routes/web.php`

**Add these routes (after the existing dashboard route):**
```php
use App\Http\Controllers\TicketController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Ticket resource routes - all protected by auth middleware
    Route::resource('tickets', TicketController::class);
});
```

**What this creates:**
```
GET       /tickets              index    tickets.index
GET       /tickets/create       create   tickets.create
POST      /tickets              store    tickets.store
GET       /tickets/{ticket}     show     tickets.show
GET       /tickets/{ticket}/edit edit    tickets.edit
PUT/PATCH /tickets/{ticket}     update   tickets.update
DELETE    /tickets/{ticket}     destroy  tickets.destroy
```

**Explanation:**
- `Route::resource()`: Automatically creates all 7 RESTful routes
- All routes are inside `auth` middleware group (login required)
- Unauthenticated users are redirected to `/login`

**You can verify routes by running:**
```bash
php artisan route:list --name=tickets
```

**Git commit:**
```bash
git add .
git commit -m "feat: add ticket resource routes

- Added Route::resource('tickets', TicketController::class)
- All 7 RESTful routes created (index, create, store, show, edit, update, destroy)
- Routes protected by auth middleware (login required)
- Routes have named identifiers (tickets.index, tickets.create, etc.)
- Unauthenticated users redirected to login page"
```

---

## PHASE 7: Create React Components for Tickets

Now we'll create the frontend views using React and Inertia.js. All components will use Tailwind CSS and the `useForm` hook.

### Step 7.1: Create Tickets Index Page
**File to create:** `resources/js/Pages/Tickets/Index.jsx`

**Content:**
```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

/**
 * Tickets Index Page
 * Displays a paginated list of the user's tickets.
 * Shows priority badges, status badges, and action buttons.
 */
export default function Index({ tickets }) {
    /**
     * Get color classes for priority badges
     */
    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'bg-gray-100 text-gray-800',
            'Medium': 'bg-blue-100 text-blue-800',
            'High': 'bg-orange-100 text-orange-800',
            'Urgent': 'bg-red-100 text-red-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    /**
     * Get color classes for status badges
     */
    const getStatusColor = (status) => {
        const colors = {
            'Open': 'bg-green-100 text-green-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Resolved': 'bg-blue-100 text-blue-800',
            'Closed': 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        My Tickets
                    </h2>
                    <Link
                        href={route('tickets.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Create New Ticket
                    </Link>
                </div>
            }
        >
            <Head title="My Tickets" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Empty state when no tickets */}
                    {tickets.data.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12 text-center">
                            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No tickets</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new ticket.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('tickets.create')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
                                >
                                    Create New Ticket
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop view: table layout */}
                            <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tickets.data.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {ticket.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{ticket.category}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route('tickets.show', ticket.id)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('tickets.edit', ticket.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile view: stacked cards */}
                            <div className="md:hidden space-y-4">
                                {tickets.data.map((ticket) => (
                                    <div key={ticket.id} className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {ticket.title}
                                            </h3>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span className="font-medium mr-2">Category:</span>
                                                {ticket.category}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('tickets.show', ticket.id)}
                                                className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                href={route('tickets.edit', ticket.id)}
                                                className="flex-1 text-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {tickets.links.length > 3 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {tickets.prev_page_url && (
                                            <Link
                                                href={tickets.prev_page_url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {tickets.next_page_url && (
                                            <Link
                                                href={tickets.next_page_url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{tickets.from}</span> to{' '}
                                                <span className="font-medium">{tickets.to}</span> of{' '}
                                                <span className="font-medium">{tickets.total}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                {tickets.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            link.active
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

**Explanation:**
- Desktop view: Table layout with all ticket information
- Mobile view: Stacked cards that work on small screens
- Color-coded badges for priority (gray/blue/orange/red) and status
- Pagination component with Previous/Next buttons
- Empty state with friendly message when no tickets exist
- Responsive design using Tailwind's breakpoint classes (md:, sm:)

**Git commit:**
```bash
git add .
git commit -m "feat: create Tickets Index page component

- Built responsive Tickets/Index.jsx with desktop table and mobile cards
- Implemented color-coded priority badges (Low/Medium/High/Urgent)
- Implemented color-coded status badges (Open/In Progress/Resolved/Closed)
- Added pagination component supporting 10 tickets per page
- Created empty state with friendly message and CTA
- Added View and Edit action buttons for each ticket
- Fully responsive layout using Tailwind CSS breakpoints"
```

### Step 7.2: Create Tickets Create Page
**File to create:** `resources/js/Pages/Tickets/Create.jsx`

**Content:**
```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

/**
 * Tickets Create Page
 * Form to create a new support ticket.
 * Uses Inertia's useForm hook for validation and processing state.
 */
export default function Create() {
    // Initialize form with default values using Inertia's useForm hook
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        category: 'Other',
    });

    /**
     * Handle form submission
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        // Post to the store route
        post(route('tickets.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Create New Ticket
                    </h2>
                    <Link
                        href={route('tickets.index')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Tickets
                    </Link>
                </div>
            }
        >
            <Head title="Create Ticket" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Title Field */}
                            <div>
                                <InputLabel htmlFor="title" value="Title *" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Brief description of the issue"
                                />
                                <InputError message={errors.title} className="mt-2" />
                                <p className="mt-1 text-sm text-gray-500">
                                    5-255 characters
                                </p>
                            </div>

                            {/* Description Field */}
                            <div>
                                <InputLabel htmlFor="description" value="Description *" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    rows="6"
                                    placeholder="Detailed description of the issue..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                                <p className="mt-1 text-sm text-gray-500">
                                    At least 10 characters
                                </p>
                            </div>

                            {/* Category Field */}
                            <div>
                                <InputLabel htmlFor="category" value="Category *" />
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                >
                                    <option value="Hardware">Hardware</option>
                                    <option value="Software">Software</option>
                                    <option value="Network">Network</option>
                                    <option value="Account">Account</option>
                                    <option value="Other">Other</option>
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* Priority Field */}
                            <div>
                                <InputLabel htmlFor="priority" value="Priority *" />
                                <select
                                    id="priority"
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                                <InputError message={errors.priority} className="mt-2" />
                            </div>

                            {/* Status Field */}
                            <div>
                                <InputLabel htmlFor="status" value="Status *" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('tickets.index')}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Ticket'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

**Explanation:**
- `useForm()` hook manages form state, validation errors, and submission
- `processing` state automatically disables button during submission
- Inline validation errors appear under each field without page reload
- Form persists input values if validation fails
- Default values set (Medium priority, Open status, Other category)
- Clean two-column layout with proper labels and helper text

**Git commit:**
```bash
git add .
git commit -m "feat: create Tickets Create page component

- Built Tickets/Create.jsx form with all required fields
- Implemented useForm hook for state management and validation
- Added inline error display under each invalid field
- Disabled submit button while processing (prevents double submission)
- Set sensible defaults (Medium priority, Open status, Other category)
- Form persists input on validation failure (no data loss)
- Added field hints (character limits, requirements)
- Cancel button returns to tickets list"
```

### Step 7.3: Create Tickets Show Page
**File to create:** `resources/js/Pages/Tickets/Show.jsx`

**Content:**
```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Tickets Show Page
 * Displays full details of a single ticket.
 * Includes Edit and Delete actions with confirmation.
 */
export default function Show({ ticket }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    /**
     * Get color classes for priority badges
     */
    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'bg-gray-100 text-gray-800',
            'Medium': 'bg-blue-100 text-blue-800',
            'High': 'bg-orange-100 text-orange-800',
            'Urgent': 'bg-red-100 text-red-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    /**
     * Get color classes for status badges
     */
    const getStatusColor = (status) => {
        const colors = {
            'Open': 'bg-green-100 text-green-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Resolved': 'bg-blue-100 text-blue-800',
            'Closed': 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    /**
     * Handle ticket deletion
     */
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('tickets.destroy', ticket.id), {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Ticket Details
                    </h2>
                    <Link
                        href={route('tickets.index')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Tickets
                    </Link>
                </div>
            }
        >
            <Head title={`Ticket: ${ticket.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {ticket.title}
                                </h3>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                    Priority: {ticket.priority}
                                </span>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                    Status: {ticket.status}
                                </span>
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Category: {ticket.category}
                                </span>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                    Description
                                </h4>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {ticket.description}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="border-t border-gray-200 pt-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(ticket.created_at).toLocaleString()}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(ticket.updated_at).toLocaleString()}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Action Buttons */}
                            <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-3">
                                <Link
                                    href={route('tickets.edit', ticket.id)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Edit Ticket
                                </Link>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Delete Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete this ticket? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
```

**Explanation:**
- Displays all ticket details in a clean, readable layout
- Color-coded badges for priority, status, and category
- Shows created and updated timestamps
- Edit button links to edit page
- Delete button opens confirmation modal (prevents accidental deletion)
- `router.delete()` sends DELETE request without full page reload
- Responsive layout works on all screen sizes

**Git commit:**
```bash
git add .
git commit -m "feat: create Tickets Show page component

- Built Tickets/Show.jsx to display full ticket details
- Implemented color-coded badges for priority, status, and category
- Added created_at and updated_at timestamps display
- Created delete confirmation modal to prevent accidental deletion
- Implemented Delete action using router.delete() for SPA experience
- Added Edit button linking to edit page
- Responsive layout with clean typography using Tailwind prose classes"
```

### Step 7.4: Create Tickets Edit Page
**File to create:** `resources/js/Pages/Tickets/Edit.jsx`

**Content:**
```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

/**
 * Tickets Edit Page
 * Form to edit an existing support ticket.
 * Pre-filled with current ticket data using useForm hook.
 */
export default function Edit({ ticket }) {
    // Initialize form with current ticket values
    const { data, setData, put, processing, errors } = useForm({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: ticket.category,
    });

    /**
     * Handle form submission
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        // PUT request to the update route
        put(route('tickets.update', ticket.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit Ticket
                    </h2>
                    <Link
                        href={route('tickets.show', ticket.id)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Ticket
                    </Link>
                </div>
            }
        >
            <Head title="Edit Ticket" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Title Field */}
                            <div>
                                <InputLabel htmlFor="title" value="Title *" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Brief description of the issue"
                                />
                                <InputError message={errors.title} className="mt-2" />
                                <p className="mt-1 text-sm text-gray-500">
                                    5-255 characters
                                </p>
                            </div>

                            {/* Description Field */}
                            <div>
                                <InputLabel htmlFor="description" value="Description *" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    rows="6"
                                    placeholder="Detailed description of the issue..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                                <p className="mt-1 text-sm text-gray-500">
                                    At least 10 characters
                                </p>
                            </div>

                            {/* Category Field */}
                            <div>
                                <InputLabel htmlFor="category" value="Category *" />
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                >
                                    <option value="Hardware">Hardware</option>
                                    <option value="Software">Software</option>
                                    <option value="Network">Network</option>
                                    <option value="Account">Account</option>
                                    <option value="Other">Other</option>
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* Priority Field */}
                            <div>
                                <InputLabel htmlFor="priority" value="Priority *" />
                                <select
                                    id="priority"
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                                <InputError message={errors.priority} className="mt-2" />
                            </div>

                            {/* Status Field */}
                            <div>
                                <InputLabel htmlFor="status" value="Status *" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('tickets.show', ticket.id)}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Ticket'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

**Explanation:**
- Form pre-filled with existing ticket data using `useForm()`
- `put()` method sends PUT request to update route
- Identical validation and error handling as Create page
- Processing state disables button during submission
- Cancel button returns to ticket details page
- All changes saved without page reload (SPA experience)

**Git commit:**
```bash
git add .
git commit -m "feat: create Tickets Edit page component

- Built Tickets/Edit.jsx form pre-filled with existing data
- Implemented useForm hook with PUT method for updates
- Form fields pre-populated with current ticket values
- Same validation and error handling as Create form
- Disabled submit button during processing
- Cancel button returns to ticket show page
- SPA experience maintained through Inertia navigation"
```

---

## PHASE 8: Add Flash Message Component

### Step 8.1: Create Flash Message Component
**File to create:** `resources/js/Components/FlashMessage.jsx`

**Content:**
```jsx
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

/**
 * Flash Message Component
 * Displays success/error messages from the server.
 * Auto-dismisses after 5 seconds or can be manually closed.
 */
export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(null);
    const [type, setType] = useState(null);

    useEffect(() => {
        if (flash.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        }

        // Auto-dismiss after 5 seconds
        if (flash.success || flash.error) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || !message) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-fade-in-down">
            <div
                className={`rounded-lg shadow-lg p-4 ${
                    type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                }`}
            >
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {type === 'success' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        ) : (
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                        )}
                    </div>
                    <div className="ml-3 flex-1">
                        <p
                            className={`text-sm font-medium ${
                                type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}
                        >
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => setVisible(false)}
                            className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                type === 'success'
                                    ? 'text-green-500 hover:text-green-600 focus:ring-green-500'
                                    : 'text-red-500 hover:text-red-600 focus:ring-red-500'
                            }`}
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

**Explanation:**
- Reads flash messages from Inertia shared props
- Auto-dismisses after 5 seconds
- Can be manually closed with X button
- Different colors for success (green) and error (red)
- Fixed position at top-right corner
- Accessible with keyboard focus management

### Step 8.2: Add FlashMessage to Layout
**File to edit:** `resources/js/Layouts/AuthenticatedLayout.jsx`

**Add the import at the top:**
```jsx
import FlashMessage from '@/Components/FlashMessage';
```

**Add the component inside the layout (find the return statement and add after the header):**
```jsx
return (
    <div className="min-h-screen bg-gray-100">
        <FlashMessage />
        {/* ...rest of the layout... */}
```

**Git commit:**
```bash
git add .
git commit -m "feat: add flash message component

- Created FlashMessage.jsx component for success/error notifications
- Auto-dismisses after 5 seconds
- Manual close button with accessible controls
- Color-coded for success (green) and error (red)
- Fixed positioning at top-right corner with smooth animation
- Integrated into AuthenticatedLayout for all authenticated pages
- Uses Heroicons for check/error/close icons"
```

---

## PHASE 9: Update Navigation

### Step 9.1: Add Tickets Link to Navigation
**File to edit:** `resources/js/Layouts/AuthenticatedLayout.jsx`

**Find the navigation section and add the Tickets link:**

Look for the section with `Dashboard` link and add:

```jsx
<NavLink href={route('tickets.index')} active={route().current('tickets.*')}>
    Tickets
</NavLink>
```

**Explanation:**
- `route().current('tickets.*')` highlights the nav link when on any ticket route
- Provides clear navigation to ticket management area

**Git commit:**
```bash
git add .
git commit -m "feat: add Tickets navigation link

- Added Tickets link to main navigation in AuthenticatedLayout
- Link highlights when viewing any ticket page (index, create, show, edit)
- Uses route().current('tickets.*') for active state detection
- Provides consistent navigation throughout the app"
```

---

## PHASE 10: Testing Locally

Now test everything locally before deployment.

### Step 10.1: Start Development Server
**Commands to run:**
```bash
cd laravel
php artisan serve
```

**In a second terminal:**
```bash
cd laravel
npm run dev
```

### Step 10.2: Test Checklist

**Authentication:**
- [ ] Register a new account
- [ ] Log in with the account
- [ ] Access dashboard

**Create Ticket:**
- [ ] Click "Create New Ticket"
- [ ] Try submitting empty form (should show validation errors)
- [ ] Try title with less than 5 characters (should show error)
- [ ] Try description with less than 10 characters (should show error)
- [ ] Fill form correctly and submit
- [ ] Verify success message appears
- [ ] Verify redirected to tickets list

**View Tickets:**
- [ ] See created ticket in list
- [ ] Verify badges show correct colors
- [ ] Click "View" button
- [ ] See full ticket details

**Edit Ticket:**
- [ ] Click "Edit" from show page or list
- [ ] Change some fields
- [ ] Submit and verify success message
- [ ] Verify changes saved

**Delete Ticket:**
- [ ] Click "Delete" button
- [ ] Verify confirmation modal appears
- [ ] Click "Delete" in modal
- [ ] Verify success message
- [ ] Verify ticket removed from list

**Responsive Design:**
- [ ] Resize browser to mobile width
- [ ] Verify tickets display as stacked cards
- [ ] Verify forms work on mobile
- [ ] Test navigation on mobile

**Authorization:**
- [ ] Open browser dev tools
- [ ] Go to a ticket URL (e.g., `/tickets/1`)
- [ ] Try changing the ID in URL to non-existent ticket
- [ ] Should see 404 or redirect
- [ ] Log in with another account and try accessing first user's ticket URL
- [ ] Should see 403 Forbidden

---

## PHASE 11: Prepare for Deployment

### Step 11.1: Update .env.example
**File to edit:** `laravel/.env.example`

**Update these values:**
```
DB_CONNECTION=mysql
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=

APP_ENV=production
APP_DEBUG=false
```

**Explanation:**
- This file shows what environment variables are needed
- Real values go in `.env` (which is gitignored)
- Deployment platform will use these as templates

### Step 11.2: Create Deployment Configuration
**File to create:** `railway.json` (in workspace root, not laravel folder)

**Content:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "composer install --optimize-autoloader --no-dev && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache && php-fpm -y /assets/php-fpm.conf & nginx -c /assets/nginx.conf",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Explanation:**
- `buildCommand`: Installs dependencies and builds assets
- `startCommand`: Runs migrations and starts the server
- `--force` flag allows migrations to run in production

**Git commit:**
```bash
git add .
git commit -m "chore: prepare for deployment

- Updated .env.example with production database configuration
- Created railway.json deployment configuration
- Build command installs Composer and NPM dependencies
- Build command compiles frontend assets with npm run build
- Deploy command runs migrations with --force flag
- Deploy command caches config, routes, and views for performance
- Ready for Railway deployment with MySQL database"
```

---

## PHASE 12: Deploy to Railway

Now you'll deploy manually. Here are the instructions:

### Step 12.1: Push to GitHub
**Commands:**
```bash
git push origin main
```

### Step 12.2: Create Railway Project
1. Go to https://railway.app/
2. Sign up or log in
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your repository
6. Railway will detect it's a Laravel app

### Step 12.3: Add MySQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "MySQL"
3. Wait for it to provision

### Step 12.4: Configure Environment Variables
1. Click on your Laravel service
2. Go to "Variables" tab
3. Add these variables (Railway will auto-generate database credentials):
   - `APP_KEY`: (run `php artisan key:generate --show` locally and copy the value)
   - `APP_ENV`: `production`
   - `APP_DEBUG`: `false`
   - `APP_URL`: (will be provided by Railway, format: `https://your-app.railway.app`)
   - Database credentials are auto-linked from MySQL service

### Step 12.5: Connect Database
1. Click on your Laravel service
2. Go to "Settings"
3. Under "Service Variables", click "Add Service Reference"
4. Select your MySQL database
5. Railway will automatically inject database credentials

### Step 12.6: Deploy
1. Railway will automatically deploy
2. Wait for build to complete (5-10 minutes)
3. Click on the generated URL to access your app

### Step 12.7: Create Demo Account
1. Visit your deployed URL
2. Register a new account for demo purposes
3. Create a few sample tickets

### Step 12.8: Final Verification
- [ ] App loads over HTTPS
- [ ] Can register and log in
- [ ] Can create tickets
- [ ] Can view, edit, delete tickets
- [ ] Flash messages work
- [ ] Responsive design works
- [ ] No console errors

---

## Final Git Commit
```bash
git add .
git commit -m "docs: add deployment URL to README

Live deployment: [YOUR_RAILWAY_URL]
Demo account: [provide credentials if needed]"
git push origin main
```

---

## Summary of What We Built

**Backend (Laravel):**
- ✅ Ticket model with proper relationships and mass-assignment protection
- ✅ Migration with all required fields and foreign key constraints
- ✅ Form Request classes for validation (StoreTicketRequest, UpdateTicketRequest)
- ✅ TicketPolicy for authorization (view, update, delete)
- ✅ TicketController with full CRUD operations
- ✅ Route protection with auth middleware
- ✅ Flash messages via HandleInertiaRequests middleware

**Frontend (React + Inertia):**
- ✅ Tickets/Index.jsx - Paginated list with responsive design
- ✅ Tickets/Create.jsx - Form with validation and useForm hook
- ✅ Tickets/Show.jsx - Detail view with delete confirmation
- ✅ Tickets/Edit.jsx - Pre-filled edit form
- ✅ FlashMessage component for notifications
- ✅ Navigation link to tickets section

**Security:**
- ✅ Authentication required for all ticket routes
- ✅ Password hashing with Laravel defaults
- ✅ Policy-based authorization (users can only access their own tickets)
- ✅ Mass-assignment protection via $fillable
- ✅ CSRF protection enabled
- ✅ user_id set from auth(), never from form input
- ✅ Validation using Rule::in() for enums
- ✅ .env file gitignored

**UI/UX:**
- ✅ Tailwind CSS for all styling
- ✅ Responsive design (desktop table, mobile cards)
- ✅ Color-coded priority and status badges
- ✅ Pagination (10 tickets per page)
- ✅ Flash messages with auto-dismiss
- ✅ Empty state when no tickets
- ✅ Inline validation errors
- ✅ Disabled buttons during form submission
- ✅ Delete confirmation modal

**Deployment:**
- ✅ Live HTTPS URL on Railway
- ✅ Connected to MySQL database
- ✅ Migrations run in production
- ✅ Frontend assets built and served
- ✅ Environment variables configured
- ✅ Demo account created

---

## Code Explanation Notes for Defense

**Key concepts to understand:**

1. **Inertia.js**: Bridges Laravel and React without building an API. Server renders data via `Inertia::render()`, React components receive it as props.

2. **useForm Hook**: Manages form state, validation errors, and processing state. Automatically handles CSRF tokens and provides `processing` boolean.

3. **Route Model Binding**: `Ticket $ticket` in controller automatically queries the database by ID from URL.

4. **Policy Authorization**: `$this->authorize('view', $ticket)` checks TicketPolicy. Returns 403 if unauthorized.

5. **Mass Assignment**: `$fillable` array whitelists which fields can be set via `create()` or `update()`. Prevents security vulnerabilities.

6. **Validation**: Form Request classes validate before controller methods run. Validation errors automatically return to form without page reload.

7. **Relationships**: `$user->tickets()` and `$ticket->user()` use Eloquent relationships to link models.

8. **Middleware**: `auth` middleware redirects unauthenticated users to login.

9. **Flash Messages**: `->with('success', 'message')` stores data in session for one request. Retrieved via `session()->get()` in middleware.

10. **SPA Navigation**: Inertia intercepts `<Link>` clicks and uses XHR to fetch new pages without full reload.

Good luck with your exam! 🎯
