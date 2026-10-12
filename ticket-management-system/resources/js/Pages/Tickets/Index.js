import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import { Head, Link } from '@inertiajs/react';

export default function Index({ tickets }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">My Tickets</h2>}
        >
            <Head title="Tickets" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {tickets.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-10 text-center shadow">
                            <p className="text-gray-600">You have no tickets yet.</p>
                            <Link
                                href={route('tickets.create')}
                                className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                Create your first ticket
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {tickets.data.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('tickets.show', ticket.id)}
                                                        className="font-medium text-indigo-600 hover:underline"
                                                    >
                                                        {ticket.title}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{ticket.category}</td>
                                                <td className="px-6 py-4"><Badge label={ticket.priority} /></td>
                                                <td className="px-6 py-4"><Badge label={ticket.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-4 md:hidden">
                                {tickets.data.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        href={route('tickets.show', ticket.id)}
                                        className="block rounded-lg bg-white p-4 shadow"
                                    >
                                        <p className="font-semibold text-gray-900">{ticket.title}</p>
                                        <p className="text-sm text-gray-500">{ticket.category}</p>
                                        <div className="mt-2 flex gap-2">
                                            <Badge label={ticket.priority} />
                                            <Badge label={ticket.status} />
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                {tickets.prev_page_url ? (
                                    <Link href={tickets.prev_page_url} className="rounded-md bg-white px-4 py-2 text-sm shadow hover:bg-gray-50">
                                        Previous
                                    </Link>
                                ) : (
                                    <span className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-400">Previous</span>
                                )}

                                <span className="text-sm text-gray-600">
                                    Page {tickets.current_page} of {tickets.last_page}
                                </span>

                                {tickets.next_page_url ? (
                                    <Link href={tickets.next_page_url} className="rounded-md bg-white px-4 py-2 text-sm shadow hover:bg-gray-50">
                                        Next
                                    </Link>
                                ) : (
                                    <span className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-400">Next</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}