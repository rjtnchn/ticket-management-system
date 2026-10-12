import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TicketForm from '@/Components/TicketForm';
import { Head } from '@inertiajs/react';

export default function Edit({ ticket, options }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">New Ticket</h2>}
        >
            <Head title="New Ticket" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <TicketForm options={options} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}