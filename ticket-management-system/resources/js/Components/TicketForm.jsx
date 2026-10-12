import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm } from '@inertiajs/react';

export default function TicketForm({ ticket, options }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: ticket?.title ?? '',
        description: ticket?.description ?? '',
        priority: ticket?.priority ?? 'Medium',
        status: ticket?.status ?? 'Open',
        category: ticket?.category ?? options.categories[0],
    });

    const submit = (e) => {
        e.preventDefault();

        if (ticket) {
            put(route('tickets.update', ticket.id));
        } else {
            post(route('tickets.store'));
        }
    };

    const selects = [
        { name: 'priority', label: 'Priority', items: options.priorities },
        { name: 'status', label: 'Status', items: options.statuses },
        { name: 'category', label: 'Category', items: options.categories },
    ];

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel htmlFor="title" value="Title" />
                <TextInput
                    id="title"
                    className="mt-1 block w-full"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                />
                <InputError message={errors.title} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="description" value="Description" />
                <textarea
                    id="description"
                    rows="5"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

            {selects.map((select) => (
                <div key={select.name}>
                    <InputLabel htmlFor={select.name} value={select.label} />
                    <select
                        id={select.name}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data[select.name]}
                        onChange={(e) => setData(select.name, e.target.value)}
                    >
                        {select.items.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                    <InputError message={errors[select.name]} className="mt-2" />
                </div>
            ))}

            <div className="flex items-center gap-4">
                <PrimaryButton disabled={processing}>
                    {ticket ? 'Update Ticket' : 'Create Ticket'}
                </PrimaryButton>
                <Link href={route('tickets.index')} className="text-sm text-gray-600 hover:underline">
                    Cancel
                </Link>
            </div>
        </form>
    );
}