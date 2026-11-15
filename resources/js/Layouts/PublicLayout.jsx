import { Link, usePage } from '@inertiajs/react';

export default function PublicLayout({ children, isAuthenticated = false }) {
    const { auth, url } = usePage();
    const isAdmin = auth?.user?.role === 'admin';
    const dashboardHref = isAdmin ? '/admin/posts' : '/dashboard/posts';
    const dashboardLabel = isAdmin ? 'Panel admin' : 'Dashboard penulis';
    const onArticles = url?.startsWith('/articles');

    return (
        <div className="min-h-screen bg-paper text-ink">
            <div className="hidden bg-forest px-5 py-2 text-center text-[11px] font-semibold tracking-[0.12em] text-white/80 sm:block">
                IDE, CERITA, DAN PERSPEKTIF DARI KOMUNITAS PENULIS INDONESIA
            </div>
            <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
                <nav aria-label="Navigasi utama" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                    <Link href="/" className="group flex shrink-0 items-center gap-3 text-forest no-underline">
                        <span className="grid size-10 place-items-center rounded-[14px] bg-forest font-serif text-xl font-bold text-white shadow-sm transition group-hover:-rotate-3">B.</span>
                        <span className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">BlogVerse <span className="text-coral">Pro</span></span>
                    </Link>
                    <div className="hidden items-center gap-1 rounded-full border border-ink/8 bg-white/70 p-1 md:flex">
                        <Link href="/" className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!onArticles ? 'bg-mint text-forest' : 'text-ink/65 hover:text-forest'}`}>Beranda</Link>
                        <Link href="/articles" className={`rounded-full px-4 py-2 text-sm font-semibold transition ${onArticles ? 'bg-mint text-forest' : 'text-ink/65 hover:text-forest'}`}>Jelajahi artikel</Link>
                        <a href="#tentang" className="rounded-full px-4 py-2 text-sm font-semibold text-ink/65 transition hover:text-forest">Tentang</a>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        {isAuthenticated ? (
                            <Link href={dashboardHref} className="rounded-full bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-forest/90 sm:px-5 sm:text-sm">{dashboardLabel}</Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-forest transition hover:bg-mint/60 sm:inline-flex">Masuk</Link>
                                <Link href="/register" className="rounded-full bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-forest/90 sm:px-5 sm:text-sm">Mulai menulis <span aria-hidden="true" className="ml-1">↗</span></Link>
                            </>
                        )}
                    </div>
                </nav>
                <nav aria-label="Navigasi seluler" className="flex gap-5 overflow-x-auto border-t border-ink/5 px-5 py-2.5 text-xs font-semibold text-ink/65 md:hidden">
                    <Link href="/" className="whitespace-nowrap">Beranda</Link>
                    <Link href="/articles" className="whitespace-nowrap">Jelajahi artikel</Link>
                    {!isAuthenticated && <Link href="/login" className="whitespace-nowrap">Masuk</Link>}
                    <a href="#tentang" className="whitespace-nowrap">Tentang</a>
                </nav>
            </header>
            <main>{children}</main>
            <footer id="tentang" className="bg-forest text-white">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr] md:py-16">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 text-white no-underline">
                            <span className="grid size-10 place-items-center rounded-[14px] border border-white/20 bg-white/10 font-serif text-xl font-bold">B.</span>
                            <span className="font-serif text-xl font-semibold">BlogVerse Pro</span>
                        </Link>
                        <p className="mt-5 max-w-md text-sm leading-7 text-white/65">Ruang editorial digital untuk gagasan yang layak dibaca, ditulis, dan dibagikan.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 md:justify-self-end md:gap-16">
                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Jelajahi</p><div className="mt-4 flex flex-col gap-3 text-sm text-white/75"><Link href="/" className="transition hover:text-white">Beranda</Link><Link href="/articles" className="transition hover:text-white">Semua artikel</Link></div></div>
                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Komunitas</p><div className="mt-4 flex flex-col gap-3 text-sm text-white/75"><Link href="/login" className="transition hover:text-white">Masuk</Link><Link href="/register" className="transition hover:text-white">Daftar penulis</Link></div></div>
                    </div>
                </div>
                <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© {new Date().getFullYear()} BlogVerse Pro</span><span>Ditulis dengan pikiran terbuka.</span></div></div>
            </footer>
        </div>
    );
}
