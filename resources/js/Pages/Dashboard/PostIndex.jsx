import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import MarkdownEditor from '../../Components/MarkdownEditor';

const emptyPost = { title: '', category: 'Umum', excerpt: '', content: '' };

function Stat({ label, value, tone }) {
    return <div className={`rounded-2xl border p-5 ${tone}`}><p className="text-sm font-medium opacity-70">{label}</p><p className="mt-3 font-serif text-4xl">{value}</p></div>;
}

export default function PostIndex({ posts, stats, search, categories }) {
    const [query, setQuery] = useState(search ?? '');
    const [modal, setModal] = useState(null);
    const form = useForm(emptyPost);

    useEffect(() => setQuery(search ?? ''), [search]);
    useEffect(() => {
        if (query === (search ?? '')) return undefined;
        const timer = setTimeout(() => router.get('/dashboard/posts', { search: query || undefined }, { preserveState: true, preserveScroll: true, replace: true }), 250);
        return () => clearTimeout(timer);
    }, [query]);

    function openCreate() {
        form.clearErrors();
        form.setData(emptyPost);
        setModal({ mode: 'create' });
    }
    function openEdit(post) {
        form.clearErrors();
        form.setData({ title: post.title, category: post.category, excerpt: post.excerpt ?? '', content: post.content });
        setModal({ mode: 'edit', post });
    }
    function submit(event) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setModal(null) };
        if (modal.mode === 'edit') form.put(`/dashboard/posts/${modal.post.id}`, options);
        else form.post('/dashboard/posts', options);
    }
    function remove(post) {
        if (window.confirm(`Hapus artikel “${post.title}”?`)) router.delete(`/dashboard/posts/${post.id}`, { preserveScroll: true });
    }
    function toggle(post) {
        router.patch(`/dashboard/posts/${post.id}/publish`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout title="Artikel saya">
            <Head title="Artikel saya" />
            <section className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">
                <div className="grid gap-4 sm:grid-cols-3"><Stat label="Total artikel" value={stats.total} tone="border-ink/10 bg-white text-forest" /><Stat label="Dipublikasikan" value={stats.published} tone="border-[#c8ded0] bg-mint text-forest" /><Stat label="Draf" value={stats.drafts} tone="border-[#f1d0c7] bg-[#f9e8e2] text-[#9a4937]" /></div>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-coral">Perpustakaan tulisan</p><h2 className="mt-2 font-serif text-3xl text-forest">Semua artikel</h2></div><button onClick={openCreate} className="cursor-pointer rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest/90">+ Tulis artikel</button></div>
                <div className="overflow-visible rounded-2xl border border-ink/10 bg-white">
                    <div className="border-b border-ink/10 p-4"><input type="search" aria-label="Cari artikel" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul artikel..." className="min-h-11 w-full rounded-xl border border-ink/15 px-4 text-sm outline-none focus:border-forest sm:max-w-sm" /></div>
                    <div className="divide-y divide-ink/10">
                        {posts.data.length ? posts.data.map((post) => (
                            <div key={post.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
                                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-coral">{post.category}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${post.is_published ? 'bg-mint text-forest' : 'bg-[#f1f0e9] text-ink/55'}`}>{post.is_published ? 'Terbit' : 'Draf'}</span></div><h3 className="mt-2 truncate font-serif text-xl text-forest">{post.title}</h3><p className="mt-1 text-xs text-ink/45">Diperbarui {new Date(post.updated_at).toLocaleDateString('id-ID')}</p></div>
                                <div className="flex items-center gap-2"><button onClick={() => toggle(post)} className="cursor-pointer rounded-full border border-ink/15 px-3 py-2 text-xs font-semibold text-forest hover:bg-mint">{post.is_published ? 'Jadikan draf' : 'Publikasikan'}</button><details className="relative"><summary aria-label={`Tindakan untuk ${post.title}`} className="grid size-10 cursor-pointer list-none place-items-center rounded-full text-xl text-ink/60 hover:bg-paper">⋮</summary><div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-ink/10 bg-white p-1 shadow-xl"><Link href={`/dashboard/posts/${post.id}`} className="block rounded-lg px-3 py-2 text-sm text-forest hover:bg-mint">◉ &nbsp; Detail</Link><button onClick={() => openEdit(post)} className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-forest hover:bg-mint">✎ &nbsp; Ubah</button><button onClick={() => remove(post)} className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">▱ &nbsp; Hapus</button></div></details></div>
                            </div>
                        )) : <div className="px-6 py-16 text-center"><p className="font-serif text-2xl text-forest">Belum ada artikel</p><p className="mt-2 text-sm text-ink/55">Mulai dengan membuat tulisan pertama Anda.</p></div>}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 border-t border-ink/10 p-4">{posts.links.map((link, index) => link.url ? <Link key={index} href={link.url} preserveScroll className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-forest text-white' : 'bg-paper text-ink hover:bg-mint'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : null)}</div>
                </div>
                <div className="flex flex-wrap gap-3"><a href="/dashboard/posts/export" className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-forest hover:bg-mint">Ekspor Excel</a><label className="cursor-pointer rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-forest hover:bg-mint">Impor Excel<input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(event) => { const data = new FormData(); data.append('file', event.target.files[0]); router.post('/dashboard/posts/import', data, { forceFormData: true }); }} /></label><Link href="/dashboard/posts/ai" className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-forest hover:bg-mint">Buat dengan AI</Link></div>
            </section>
            {modal && <div className="fixed inset-0 z-50 flex flex-col bg-paper">
                <div className="flex items-center justify-between bg-forest px-5 py-5 text-white sm:px-10"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a9d5bb]">Editor artikel</p><h2 className="mt-1 font-serif text-2xl">{modal.mode === 'edit' ? 'Ubah artikel' : 'Artikel baru'}</h2></div><button onClick={() => setModal(null)} className="cursor-pointer rounded-full px-4 py-2 text-sm text-white/80 hover:bg-white/10">Tutup ×</button></div>
                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col"><div className="mx-auto w-full max-w-5xl flex-1 space-y-5 overflow-y-auto px-5 py-7 sm:px-10"><div className="grid gap-5 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold">Judul</label><input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4" />{form.errors.title && <p className="mt-1 text-sm text-red-600">{form.errors.title}</p>}</div><div><label className="mb-2 block text-sm font-semibold">Kategori</label><select value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4">{Object.entries(categories).map(([key, label]) => <option key={key}>{label}</option>)}</select></div></div><div><label className="mb-2 block text-sm font-semibold">Ringkasan</label><textarea rows="2" value={form.data.excerpt} onChange={(event) => form.setData('excerpt', event.target.value)} className="w-full rounded-xl border border-ink/15 bg-white p-4" placeholder="Satu atau dua kalimat yang mengundang pembaca." /></div><div><label className="mb-2 block text-sm font-semibold">Isi artikel · Markdown</label><MarkdownEditor value={form.data.content} onChange={(value) => form.setData('content', value)} height="min(48vh, 520px)" />{form.errors.content && <p className="mt-1 text-sm text-red-600">{form.errors.content}</p>}</div></div><div className="flex justify-end gap-3 border-t border-ink/10 bg-[#e9ece3] px-5 py-4 sm:px-10"><button type="button" onClick={() => setModal(null)} className="cursor-pointer rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold">Batal</button><button disabled={form.processing} className="cursor-pointer rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{form.processing ? 'Menyimpan…' : 'Simpan draf'}</button></div></form>
            </div>}
        </AppLayout>
    );
}
