import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GlobalFeedback() {
    const [processing, setProcessing] = useState(false);
    useEffect(() => {
        const removeStart = router.on('start', () => setProcessing(true));
        const removeFinish = router.on('finish', () => setProcessing(false));
        return () => { removeStart(); removeFinish(); };
    }, []);
    if (!processing) return null;
    return <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-forest px-5 py-3 text-xs font-semibold text-white shadow-2xl"><span className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" />Memproses tindakan...</div>;
}
