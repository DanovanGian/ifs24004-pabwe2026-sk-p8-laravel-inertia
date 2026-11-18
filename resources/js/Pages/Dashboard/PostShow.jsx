import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Viewer from '@toast-ui/editor/viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import AppLayout from '../../Layouts/AppLayout';
import MarkdownEditor from '../../Components/MarkdownEditor';

export default function PostShow({ post, categories }) {
    const [editing, setEditing] = useState(false);
    const viewerRef = useRef(null);
    const form = useForm({ title: post.title, category: post.category, excerpt: post.excerpt ?? '', content: post.content });
    useEffect(() => {
        if (editing || !viewerRef.current) return undefined;
        const viewer = new Viewer({ el: viewerRef.current, initialValue: post.content ?? '' });
        return () => viewer.destroy();
    }, [editing, post.content]);

    function submit(event) {
        event.preventDefault();
        form.put(`/dashboard/posts/${post.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) });
    }

    return (
        <AppLayout title="Detail artikel">
            <Head title={post.title} />
            <section className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-8">
                <Link href="/dashboard/posts" className="text-sm font-semibold text-forest hover:text-coral">← Kembali ke daftar</Link>
                <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[0.16em] text-coral">{post.category} · {post.is_published ? 'Terbit' : 'Draf'}</span><h2 className="mt-3 font-serif text-4xl text-forest">{post.title}</h2></div><div className="flex gap-2"><button onClick={() => setEditing((value) => !value)} className="cursor-pointer rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-forest">{editing ? 'Batal ubah' : 'Ubah artikel'}</button><button onClick={() => router.patch(`/dashboard/posts/${post.id}/publish`)} className="cursor-pointer rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-white">{post.is_published ? 'Jadikan draf' : 'Publikasikan'}</button></div></div>
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="min-w-0 rounded-2xl border border-ink/10 bg-white p-5 sm:p-8">
                        {editing ? <form onSubmit={submit} className="space-y-5"><div><label className="mb-2 block text-sm font-semibold">Judul</label><input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} className="min-h-12 w-full rounded-xl border border-ink/15 px-4" /></div><div><label className="mb-2 block text-sm font-semibold">Kategori</label><select value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} className="min-h-12 w-full rounded-xl border border-ink/15 px-4">{Object.entries(categories).map(([key, label]) => <option key={key}>{label}</option>)}</select></div><div><label className="mb-2 block text-sm font-semibold">Ringkasan</label><textarea value={form.data.excerpt} onChange={(event) => form.setData('excerpt', event.target.value)} className="w-full rounded-xl border border-ink/15 p-4" /></div><div><label className="mb-2 block text-sm font-semibold">Isi artikel · Markdown</label><MarkdownEditor value={form.data.content} onChange={(value) => form.setData('content', value)} height="480px" /></div><div className="flex justify-end"><button disabled={form.processing} className="cursor-pointer rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white">Simpan perubahan</button></div></form> : <><p className="mb-8 border-l-4 border-coral pl-4 text-lg leading-8 text-ink/65">{post.excerpt}</p><div ref={viewerRef} /></>}
                    </div>
                    <aside className="space-y-4"><div className="rounded-2xl border border-ink/10 bg-white p-5"><h3 className="font-semibold text-forest">Sampul</h3>{post.cover_image_path && <img src={`/storage/${post.cover_image_path}`} alt="Sampul artikel" className="mt-4 aspect-video w-full rounded-xl object-cover" />}<form className="mt-4" onSubmit={(event) => { event.preventDefault(); form.post(`/dashboard/posts/${post.id}/cover`, { forceFormData: true, preserveScroll: true }); }}><input type="file" aria-label="Unggah gambar sampul" accept="image/jpeg,image/png,image/webp" onChange={(event) => form.setData('cover', event.target.files[0])} className="block w-full text-xs" /><button className="mt-3 w-full cursor-pointer rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-white">Unggah sampul</button></form>{post.cover_image_path && <button onClick={() => router.delete(`/dashboard/posts/${post.id}/cover`)} className="mt-2 w-full cursor-pointer rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600">Hapus sampul</button>}</div><div className="rounded-2xl bg-mint p-5 text-sm text-forest"><p className="font-semibold">Tautan artikel</p>{post.is_published ? <a href={`/articles/${post.slug}`} target="_blank" rel="noreferrer" className="mt-2 block break-all underline">/articles/{post.slug}</a> : <p className="mt-2 text-forest/65">Publikasikan artikel untuk melihat tautan publik.</p>}</div></aside>
                </div>
            </section>
        </AppLayout>
    );
}
