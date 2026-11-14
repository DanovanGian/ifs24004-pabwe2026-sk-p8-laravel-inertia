import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PublicLayout from '../../Layouts/PublicLayout';

export default function PostIndex({ posts, filters, categories, isAuthenticated }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');

    useEffect(() => {
        setSearch(filters.search ?? '');
        setCategory(filters.category ?? '');
    }, [filters.search, filters.category]);

    function updateFilters(nextSearch = search, nextCategory = category) {
        router.get('/articles', { search: nextSearch || undefined, category: nextCategory || undefined }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    }

    return (
        <PublicLayout isAuthenticated={isAuthenticated}>
            <Head title="Artikel" />
            <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
                <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Tulisan dari berbagai sudut pandang</p>
                    <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight text-forest sm:text-7xl">Ide baik layak<br className="hidden sm:block" /> dibagikan.</h1>
                    <p className="mt-6 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">Temukan cerita, pengetahuan, dan pemikiran baru dari para penulis di BlogVerse.</p>
                    {!isAuthenticated && <div className="mt-7 flex flex-wrap gap-3"><Link href="/login" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Masuk</Link><Link href="/register" className="rounded-full border border-forest/20 px-6 py-3 text-sm font-semibold text-forest">Daftar penulis</Link></div>}
                </div>
                <div className="mt-11 flex flex-col gap-3 border-y border-ink/10 py-5 sm:flex-row sm:items-center">
                    <label className="sr-only" htmlFor="article-search">Cari artikel</label>
                    <input id="article-search" value={search} onChange={(event) => { setSearch(event.target.value); updateFilters(event.target.value, category); }} placeholder="Cari judul atau isi artikel..." className="min-h-12 w-full rounded-full border border-ink/15 bg-white px-5 text-sm outline-none transition placeholder:text-ink/40 focus:border-forest sm:max-w-md" />
                    <label className="sr-only" htmlFor="article-category">Kategori</label>
                    <select id="article-category" value={category} onChange={(event) => { setCategory(event.target.value); updateFilters(search, event.target.value); }} className="min-h-12 rounded-full border border-ink/15 bg-white px-5 text-sm outline-none focus:border-forest">
                        <option value="">Semua kategori</option>
                        {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <span className="text-sm text-ink/50 sm:ml-auto">{posts.total} artikel</span>
                </div>
                {posts.data.length ? (
                    <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post) => (
                            <article key={post.id} className="group flex flex-col border-b border-ink/10 py-7">
                                <Link href={`/articles/${post.slug}`} className="text-inherit no-underline">
                                    {post.cover_image_path ? <img src={`/storage/${post.cover_image_path}`} alt="" className="mb-5 aspect-[1.7] w-full rounded-2xl object-cover" /> : <div className="mb-5 grid aspect-[1.7] place-items-center rounded-2xl bg-mint text-4xl text-forest">✳</div>}
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">{post.category}</p>
                                    <h2 className="mt-3 font-serif text-2xl leading-snug text-forest transition group-hover:text-coral">{post.title}</h2>
                                    {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65">{post.excerpt}</p>}
                                </Link>
                                <div className="mt-5 flex items-center justify-between text-xs text-ink/50">
                                    <span>{post.user?.name}</span>
                                    <time>{post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</time>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <p className="font-serif text-3xl text-forest">Belum ada artikel yang cocok.</p>
                        <p className="mt-3 text-ink/60">Coba kata kunci atau kategori lain, atau jadilah penulis pertama.</p>
                        <Link href="/register" className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Mulai menulis</Link>
                    </div>
                )}
                <div className="mt-10 flex justify-center gap-2">
                    {posts.links.map((link, index) => link.url ? <Link key={index} href={link.url} preserveScroll className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-forest text-white' : 'bg-white text-ink hover:bg-mint'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : null)}
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
                <div className="flex flex-col justify-between gap-6 rounded-[2rem] bg-forest p-8 text-white sm:flex-row sm:items-center sm:p-12">
                    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a9d5bb]">Punya cerita untuk dibagikan?</p><h2 className="mt-3 max-w-xl font-serif text-3xl sm:text-4xl">Jadikan idemu bacaan berikutnya.</h2></div>
                    <Link href="/register" className="w-fit rounded-full bg-[#e9f1e9] px-6 py-3 text-sm font-bold text-forest">Daftar sebagai penulis</Link>
                </div>
            </section>
        </PublicLayout>
    );
}
