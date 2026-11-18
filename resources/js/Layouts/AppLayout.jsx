import { Link, router, usePage } from '@inertiajs/react';

function BrandMark() {
    return <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-white/10 font-serif text-xl font-bold text-white ring-1 ring-white/15">B.</span>;
}

export default function AppLayout({ children, title, admin = false }) {
    const { auth, flash, url } = usePage();
    const user = auth?.user;
    const links = admin
        ? [['/admin/posts', 'Monitoring artikel', '01'], ['/admin/users', 'Pengguna', '02']]
        : [['/dashboard/posts', 'Artikel saya', '01'], ['/dashboard/posts/ai', 'Generator AI', '02'], ['/profile', 'Profil', '03']];

    function logout() {
        router.post('/logout');
    }

    function isActive(href) {
        return href === '/dashboard/posts' ? url === href : url?.startsWith(href);
    }

    return (
        <div className="min-h-screen bg-[#f4f5f1] text-ink lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
            <aside className="relative z-20 flex flex-col overflow-hidden bg-forest text-white lg:min-h-screen">
                <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-28 size-72 rounded-full border border-white/5" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-40 size-48 rounded-full border border-white/5" />
                <Link href="/" className="relative flex items-center gap-3 px-5 py-5 text-white no-underline lg:px-7 lg:py-7">
                    <BrandMark />
                    <span className="font-serif text-lg font-semibold">BlogVerse <span className="text-[#ef9a7e]">Pro</span></span>
                </Link>
                <div className="relative hidden px-7 pt-7 lg:block">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{admin ? 'Ruang administrasi' : 'Ruang penulis'}</p>
                    <div className="mt-5 flex items-center gap-3">
                        {user?.profile_photo_path ? <img src={`/storage/${user.profile_photo_path}`} alt="" className="size-11 rounded-full object-cover ring-2 ring-white/20" /> : <span className="grid size-11 place-items-center rounded-full bg-[#d9e8dd] font-serif text-lg font-bold text-forest">{user?.name?.slice(0, 1)?.toUpperCase()}</span>}
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user?.name}</p><p className="mt-0.5 truncate text-xs text-white/50">@{user?.username}</p></div>
                    </div>
                </div>
                <div className="relative mt-2 hidden px-7 pt-8 lg:block"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Menu utama</p></div>
                <nav aria-label="Navigasi dashboard" className="relative flex gap-2 overflow-x-auto px-5 pb-4 lg:mt-3 lg:flex-col lg:px-4 lg:pb-0">
                    {links.map(([href, label, number]) => {
                        const active = isActive(href);
                        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`group flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? 'bg-white text-forest shadow-lg shadow-black/10' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}><span className={`grid size-7 place-items-center rounded-lg text-[10px] font-bold ${active ? 'bg-mint text-forest' : 'bg-white/10 text-white/45 group-hover:text-white/80'}`}>{number}</span>{label}</Link>;
                    })}
                    <Link href="/" className="group flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"><span className="grid size-7 place-items-center rounded-lg bg-white/10 text-[10px] font-bold text-white/45">↗</span>Lihat blog</Link>
                </nav>
                <div className="relative mt-auto hidden p-4 lg:block">
                    <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs font-semibold text-white/80">Terus berbagi gagasan</p><p className="mt-1 text-[11px] leading-5 text-white/45">Tulisanmu dapat menjadi awal percakapan baru.</p></div>
                    <button type="button" onClick={logout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/55 transition hover:bg-white/10 hover:text-white"><span className="text-base">↪</span>Keluar</button>
                </div>
            </aside>
            <div className="min-w-0">
                <header className="sticky top-0 z-10 flex min-h-[78px] items-center justify-between border-b border-ink/8 bg-white/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-coral">{admin ? 'Administrasi' : 'Dashboard penulis'}</p><h1 className="mt-1 font-serif text-xl font-semibold tracking-tight text-forest sm:text-2xl">{title}</h1></div>
                    <div className="flex items-center gap-3"><span className="hidden text-sm font-medium text-ink/60 sm:inline">{user?.name}</span>{user?.profile_photo_path ? <img src={`/storage/${user.profile_photo_path}`} alt="Foto profil" className="size-10 rounded-full object-cover ring-2 ring-mint" /> : <span className="grid size-10 place-items-center rounded-full bg-mint font-serif text-lg font-bold text-forest">{user?.name?.slice(0, 1)?.toUpperCase()}</span>}<button type="button" onClick={logout} className="cursor-pointer rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/55 transition hover:border-coral/30 hover:text-coral lg:hidden">Keluar</button></div>
                </header>
                <main>
<div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8 lg:px-10">{flash?.success && <p role="status" className="rounded-xl border border-forest/10 bg-mint px-4 py-3 text-sm font-semibold text-forest shadow-sm">{flash.success}</p>}{flash?.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{flash.error}</p>}</div>
                {children}
</main>
            </div>
        </div>
    );
}
