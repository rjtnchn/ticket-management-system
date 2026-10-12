import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ ticket }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this ticket?')) {
            router.delete(route('tickets.destroy', ticket.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Ticket Details</h2>}
        >
            <Head title={ticket.title} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="text-2xl font-bold text-gray-900">{ticket.title}</h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge label={ticket.priority} />
                            <Badge label={ticket.status} />
                            <span className="text-sm text-gray-500">{ticket.category}</span>
                        </div>

                        <p className="mt-6 whitespace-pre-line text-gray-700">{ticket.description}</p>

                        <div className="mt-8 flex gap-3">
                            <Link
                                href={route('tickets.edit', ticket.id)}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                            >
                                Delete
                            </button>
                            <Link
                                href={route('tickets.index')}
                                className="px-4 py-2 text-sm text-gray-600 hover:underline"
                            >
                                Back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}