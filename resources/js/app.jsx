import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import GlobalFeedback from './Components/GlobalFeedback';

const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
    title: (title) => (title ? `${title} · BlogVerse Pro` : 'BlogVerse Pro'),
    resolve: async (name) => {
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Halaman Inertia tidak ditemukan: ${name}`);
        }
        return page();
    },
    setup({ el, App, props }) {
        createRoot(el).render(<><GlobalFeedback /><App {...props} /></>);
    },
    progress: {
        color: '#0f766e',
        showSpinner: false,
    },
});
