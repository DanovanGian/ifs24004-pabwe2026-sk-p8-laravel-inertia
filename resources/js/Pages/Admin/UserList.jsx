import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function UserList({ users, search }) {
    const [query, setQuery] = useState(search ?? '');
    useEffect(() => setQuery(search ?? ''), [search]);
    useEffect(() => {
        if (query === (search ?? '')) return undefined;
        const timer = setTimeout(() => router.get('/admin/users', { search: query || undefined }, { preserveState: true, replace: true }), 250);
        return () => clearTimeout(timer);
    }, [query]);
    return <AppLayout title="Pengguna" admin><Head title="Pengguna" /><section className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-coral">Komunitas</p><h2 className="mt-2 font-serif text-3xl text-forest">Pengguna terdaftar</h2></div><div className="overflow-hidden rounded-2xl border border-ink/10 bg-white"><div className="border-b border-ink/10 p-4"><input aria-label="Cari pengguna" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, username, atau email..." className="min-h-11 w-full rounded-xl border border-ink/15 px-4 text-sm sm:max-w-md" /></div><div className="divide-y divide-ink/10">{users.data.map((user) => <div key={user.id} className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center"><div className="grid size-11 place-items-center rounded-full bg-mint font-bold text-forest">{user.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><h3 className="font-semibold text-forest">{user.name} <span className="ml-2 rounded-full bg-paper px-2 py-1 text-[10px] uppercase tracking-wide text-ink/75">{user.role}</span></h3><p className="mt-1 text-sm text-ink/75">@{user.username} · {user.email}</p></div><span className="text-sm text-ink/75">{user.posts_count} artikel</span><Link href={`/admin/users/${user.id}/posts`} className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-forest hover:bg-mint">Lihat artikel</Link></div>)}</div><div className="flex justify-center gap-2 border-t border-ink/10 p-4">{users.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-forest text-white' : 'bg-paper text-ink'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : null)}</div></div></section></AppLayout>;
}
