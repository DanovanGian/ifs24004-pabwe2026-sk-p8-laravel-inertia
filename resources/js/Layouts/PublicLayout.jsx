import { Link, usePage } from '@inertiajs/react';

export default function PublicLayout({ children, isAuthenticated = false }) {
    const { auth } = usePage().props;
    const dashboardHref = auth?.user?.role === 'admin' ? '/admin/posts' : '/dashboard/posts';
    const dashboardLabel = auth?.user?.role === 'admin' ? 'Panel Admin' : 'Dashboard Penulis';

    return (
        <div className="min-h-screen bg-paper text-ink">
            <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                    <Link href="/" className="flex items-center gap-3 text-forest no-underline">
                        <span className="grid size-10 place-items-center rounded-full bg-forest text-sm font-bold text-white">B.</span>
                        <span className="font-serif text-xl font-semibold tracking-tight">BlogVerse <span className="text-coral">Pro</span></span>
                    </Link>
                    <div className="hidden items-center gap-8 text-sm font-medium text-ink/70 sm:flex">
                        <Link href="/articles" className="transition hover:text-forest">Jelajahi Artikel</Link>
                        <a href="#tentang" className="transition hover:text-forest">Tentang</a>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <Link href={dashboardHref} className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest/90">{dashboardLabel}</Link>
                        ) : (
                            <>
                                <Link href="/login" className="rounded-full px-4 py-2.5 text-sm font-semibold text-forest transition hover:bg-mint/60">Masuk</Link>
                                <Link href="/register" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest/90">Daftar</Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>
            <main>{children}</main>
            <footer id="tentang" className="border-t border-ink/10 bg-[#eeeee7]">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
                    <div>
                        <p className="font-serif text-lg font-semibold text-forest">BlogVerse Pro</p>
                        <p className="mt-1 text-sm text-ink/60">Ruang untuk gagasan yang layak dibaca.</p>
                    </div>
                    <div className="flex flex-wrap gap-5 text-sm text-ink/70">
                        <Link href="/" className="hover:text-forest">Beranda</Link>
                        <Link href="/login" className="hover:text-forest">Masuk</Link>
                        <Link href="/register" className="hover:text-forest">Daftar</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
