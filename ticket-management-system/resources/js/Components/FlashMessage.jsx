import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [show, setShow] = useState(false);
    const message = flash.success || flash.error;

    useEffect(() => {
        if (message) {
            setShow(true);
            const timer = setTimeout(() => setShow(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!show || !message) return null;

    const color = flash.success
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';

    return (
        <div className={`mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-md px-4 py-3 ${color}`}>
            <span>{message}</span>
            <button onClick={() => setShow(false)} className="font-bold">✕</button>
        </div>
    );
}