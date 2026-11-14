import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function PostList({ posts, search }) {
    const [query, setQuery] = useState(search ?? '');
    useEffect(() => setQuery(search ?? ''), [search]);
    useEffect(() => {
        if (query === (search ?? '')) return undefined;
        const timer = setTimeout(() => router.get('/admin/posts', { search: query || undefined }, { preserveState: true, preserveScroll: true, replace: true }), 250);
        return () => clearTimeout(timer);
    }, [query]);
    return <AppLayout title="Monitoring artikel" admin><Head title="Monitoring artikel" /><section className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-coral">Seluruh sistem</p><h2 className="mt-2 font-serif text-3xl text-forest">Artikel komunitas</h2></div><a href="/admin/posts/export" className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-forest hover:bg-mint">Ekspor semua ke Excel</a></div><div className="overflow-hidden rounded-2xl border border-ink/10 bg-white"><div className="border-b border-ink/10 p-4"><input aria-label="Cari artikel" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul atau isi..." className="min-h-11 w-full rounded-xl border border-ink/15 px-4 text-sm sm:max-w-sm" /></div><div className="divide-y divide-ink/10">{posts.data.length ? posts.data.map((post) => <div key={post.id} className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-coral"><span>{post.category}</span><span className="text-ink/35">·</span><span className={post.is_published ? 'text-forest' : 'text-ink/45'}>{post.is_published ? 'Terbit' : 'Draf'}</span></div><h3 className="mt-2 truncate font-serif text-xl text-forest">{post.title}</h3><p className="mt-1 text-xs text-ink/50">oleh {post.user?.name} · @{post.user?.username ?? ''}</p></div><time className="text-xs text-ink/45">{new Date(post.updated_at).toLocaleDateString('id-ID')}</time></div>) : <p className="p-12 text-center text-ink/55">Belum ada artikel.</p>}</div><div className="flex justify-center gap-2 border-t border-ink/10 p-4">{posts.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-forest text-white' : 'bg-paper text-ink'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : null)}</div></div></section></AppLayout>;
}
