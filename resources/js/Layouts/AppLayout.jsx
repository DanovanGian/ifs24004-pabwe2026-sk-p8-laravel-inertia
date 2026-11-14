import { Link, router, usePage } from '@inertiajs/react';

export default function AppLayout({ children, title, admin = false }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const links = admin
        ? [['/admin/posts', 'Artikel'], ['/admin/users', 'Pengguna']]
        : [['/dashboard/posts', 'Artikel saya'], ['/profile', 'Profil']];

    function logout() {
        router.post('/logout');
    }

    return (
        <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[250px_1fr]">
            <aside className="flex flex-col border-b border-ink/10 bg-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
                <Link href="/" className="flex items-center gap-3 px-5 py-4 text-forest no-underline lg:px-2 lg:py-0">
                    <span className="grid size-10 place-items-center rounded-full bg-forest text-sm font-bold text-white">B.</span>
                    <span className="font-serif text-lg font-semibold">BlogVerse <span className="text-coral">Pro</span></span>
                </Link>
                <div className="hidden px-2 pt-12 lg:block"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/40">{admin ? 'Panel admin' : 'Ruang penulis'}</p><p className="mt-2 font-semibold">{user?.name}</p><p className="text-xs text-ink/50">@{user?.username}</p></div>
                <nav className="flex gap-2 overflow-x-auto px-5 pb-4 lg:mt-8 lg:flex-col lg:px-0 lg:pb-0">
                    {links.map(([href, label]) => <Link key={href} href={href} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${window.location.pathname === href ? 'bg-mint text-forest' : 'text-ink/60 hover:bg-paper hover:text-forest'}`}>{label}</Link>)}
                    <Link href="/" className="rounded-xl px-4 py-3 text-sm font-semibold text-ink/60 transition hover:bg-paper hover:text-forest">Lihat blog</Link>
                </nav>
                <button onClick={logout} className="hidden cursor-pointer rounded-xl px-4 py-3 text-left text-sm font-semibold text-ink/55 transition hover:bg-paper hover:text-forest lg:mt-auto lg:block">Keluar</button>
            </aside>
            <div className="min-w-0">
                <header className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4 sm:px-8">
                    <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">{admin ? 'Administrasi' : 'Dashboard penulis'}</p><h1 className="mt-1 font-serif text-xl text-forest">{title}</h1></div>
                    <div className="flex items-center gap-3"><span className="hidden text-sm text-ink/60 sm:inline">{user?.name}</span><span className="grid size-10 place-items-center rounded-full bg-mint font-bold text-forest">{user?.name?.slice(0, 1)?.toUpperCase()}</span><button onClick={logout} className="cursor-pointer text-sm font-semibold text-ink/50 hover:text-forest lg:hidden">Keluar</button></div>
                </header>
                <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8">{flash?.success && <p role="status" className="rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-forest">{flash.success}</p>}{flash?.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{flash.error}</p>}</div>
                {children}
            </div>
        </div>
    );
}
