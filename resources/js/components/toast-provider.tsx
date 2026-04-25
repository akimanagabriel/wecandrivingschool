// resources/js/components/toast-provider.tsx
import { toast } from 'sonner';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export function ToastProvider() {
    const { flash } = usePage().props as { flash?: FlashMessages };

    useEffect(() => {
        if (!flash) return;

        const messages = [
            { type: 'success', message: flash.success },
            { type: 'error', message: flash.error },
            { type: 'warning', message: flash.warning },
            { type: 'info', message: flash.info },
        ];

        messages.forEach(({ type, message }) => {
            if (message) {
                switch (type) {
                    case 'success':
                        toast.success(message);
                        break;
                    case 'error':
                        toast.error(message);
                        break;
                    case 'warning':
                        toast.warning(message);
                        break;
                    case 'info':
                        toast.info(message);
                        break;
                }
            }
        });
    }, [flash]);

    return null;
}
