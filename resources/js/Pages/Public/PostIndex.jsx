import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PublicLayout from '../../Layouts/PublicLayout';

function ArticleVisual({ post, featured = false }) {
    return post.cover_image_path ? (
        <img src={`/storage/${post.cover_image_path}`} alt="" className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.035] ${featured ? 'absolute inset-0' : 'aspect-[1.58]'}`} />
    ) : (
        <div className={`relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br from-[#244f42] via-[#3d7864] to-[#d89570] ${featured ? 'absolute inset-0' : 'aspect-[1.58]'}`}>
            <div aria-hidden="true" className="absolute -right-14 -top-20 size-72 rounded-full border border-white/25" />
            <div aria-hidden="true" className="absolute -right-4 -top-10 size-52 rounded-full border border-white/20" />
            <span className={`relative font-serif italic text-white/90 ${featured ? 'text-8xl sm:text-[10rem]' : 'text-6xl'}`}>B.</span>
        </div>
    );
}

function ArticleMeta({ post, light = false }) {
    return <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${light ? 'text-white/65' : 'text-ink/50'}`}><span className="font-semibold">{post.user?.name}</span><span aria-hidden="true" className="size-1 rounded-full bg-current opacity-50" /><time>{post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</time></div>;
}

export default function PostIndex({ posts, filters, categories, isAuthenticated }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const featured = posts.data[0];
    const remaining = posts.data.slice(1);

    useEffect(() => {
        setSearch(filters.search ?? '');
        setCategory(filters.category ?? '');
    }, [filters.search, filters.category]);

    function updateFilters(nextSearch = search, nextCategory = category) {
        router.get('/articles', { search: nextSearch || undefined, category: nextCategory || undefined }, { preserveState: true, replace: true, preserveScroll: true });
    }

    return (
        <PublicLayout isAuthenticated={isAuthenticated}>
            <Head title="Beranda" />
            <div className="page-wash">
                <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12">
                    <div className="relative isolate overflow-hidden rounded-[2rem] bg-forest px-6 py-10 text-white shadow-[0_28px_80px_rgba(22,59,49,0.18)] sm:rounded-[2.5rem] sm:px-12 sm:py-14 lg:px-16 lg:py-16">
                        <div aria-hidden="true" className="editorial-grid absolute inset-0 -z-10 opacity-50" />
                        <div aria-hidden="true" className="absolute -right-24 -top-40 -z-10 size-[32rem] rounded-full bg-[#5b9178]/30 blur-3xl" />
                        <div aria-hidden="true" className="absolute -bottom-36 right-[16%] -z-10 size-72 rounded-full bg-coral/30 blur-3xl" />
                        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75"><span className="size-1.5 rounded-full bg-[#ef9a7e]" />Ruang editorial komunitas</span>
                                <h1 className="mt-6 font-serif text-[2.8rem] leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.5rem]">Gagasan baik<br className="hidden sm:block" /> menemukan <span className="italic text-[#f0a78e]">pembacanya.</span></h1>
                                <p className="mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">Cerita, pengetahuan, dan perspektif segar dari penulis Indonesia. Baca dengan tenang, bagikan dengan bebas.</p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <a href="#artikel" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-forest shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#f1f3ec]">Jelajahi tulisan <span aria-hidden="true">↓</span></a>
                                    {!isAuthenticated && <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Daftar sebagai penulis <span aria-hidden="true">↗</span></Link>}
                                </div>
                                <div className="mt-10 flex items-center gap-4 border-t border-white/12 pt-5 text-xs text-white/55"><span className="font-serif text-2xl font-semibold text-white">{posts.total}</span><span>artikel pilihan dari<br />berbagai sudut pandang</span><span className="ml-2 hidden h-8 w-px bg-white/15 sm:block" /><span className="hidden sm:block">Baca. Renungkan.<br />Bagikan kembali.</span></div>
                            </div>
                            <div className="relative mx-auto hidden w-full max-w-md lg:block">
                                <div className="absolute -left-5 top-8 z-10 rounded-2xl border border-white/15 bg-[#f5f4ef] p-4 text-forest shadow-xl shadow-black/10"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-coral">Catatan redaksi</p><p className="mt-2 max-w-[8rem] font-serif text-lg leading-tight">Selalu ada cerita di balik ide.</p></div>
                                <div className="relative ml-auto grid aspect-[0.82] w-[78%] place-items-center overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#d7a080] via-[#638774] to-[#193d32] shadow-2xl shadow-black/20">
                                    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_55%_38%,rgba(248,230,196,0.62),transparent_28%),linear-gradient(150deg,transparent_35%,rgba(14,39,31,0.8))]" />
                                    <div aria-hidden="true" className="absolute -bottom-10 -left-12 size-72 rounded-full border border-white/25" />
                                    <div aria-hidden="true" className="absolute -bottom-2 -left-4 size-56 rounded-full border border-white/20" />
                                    <span className="relative -translate-y-4 font-serif text-[10rem] italic leading-none text-white/90">B.</span>
                                    <div className="absolute inset-x-0 bottom-0 p-6"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">BlogVerse Pro</p><p className="mt-2 font-serif text-2xl leading-tight">Tulis dari rasa ingin tahu.</p></div>
                                </div>
                                <div className="absolute -bottom-5 right-0 rounded-2xl border border-white/15 bg-white p-4 text-forest shadow-xl shadow-black/10"><p className="font-serif text-3xl">{String(Object.keys(categories).length).padStart(2, '0')}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-ink/45">Kategori tulisan</p></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="artikel" className="mx-auto max-w-7xl scroll-mt-32 px-5 pb-16 sm:px-8 sm:pb-24">
                    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-coral">Bacaan terbaru</p><h2 className="mt-2 font-serif text-3xl tracking-tight text-forest sm:text-4xl">Dari meja para penulis</h2><p className="mt-2 text-sm text-ink/55">Temukan tulisan yang membuatmu berhenti sejenak dan berpikir.</p></div>
                        <p className="text-xs font-semibold text-ink/45">{posts.total} artikel tersedia</p>
                    </div>
                    <div className="surface-card mb-8 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:p-4">
                        <label className="relative min-w-0 flex-1"><span className="sr-only">Cari artikel</span><span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink/35">⌕</span><input id="article-search" value={search} onChange={(event) => { setSearch(event.target.value); updateFilters(event.target.value, category); }} placeholder="Cari judul, topik, atau kata kunci..." className="form-control border-transparent bg-transparent pl-11 shadow-none focus:border-forest/15 focus:bg-white" /></label>
                        <label className="sr-only" htmlFor="article-category">Pilih kategori</label><select id="article-category" value={category} onChange={(event) => { setCategory(event.target.value); updateFilters(search, event.target.value); }} className="form-control w-full sm:w-56"><option value="">Semua kategori</option>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    </div>

                    {featured ? <>
                        <Link href={`/articles/${featured.slug}`} className="group surface-card relative mb-7 grid overflow-hidden rounded-[1.75rem] text-inherit no-underline transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(21,35,30,0.12)] md:grid-cols-[0.95fr_1.05fr]">
                            <div className="group relative min-h-64 overflow-hidden md:min-h-[24rem]"><ArticleVisual post={featured} featured /><div className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">Pilihan minggu ini</div></div>
                            <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-clay px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a503b]">{featured.category}</span><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/35">Artikel unggulan</span></div><h3 className="mt-5 font-serif text-3xl leading-[1.12] tracking-tight text-forest transition group-hover:text-coral sm:text-4xl lg:text-[2.7rem]">{featured.title}</h3>{featured.excerpt && <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-7 text-ink/60">{featured.excerpt}</p>}<div className="mt-7 flex items-center justify-between gap-3"><ArticleMeta post={featured} /><span className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-lg text-white transition group-hover:rotate-45 group-hover:bg-coral">↗</span></div></div>
                        </Link>
                        {remaining.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{remaining.map((post) => <article key={post.id} className="group surface-card overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(21,35,30,0.11)]"><Link href={`/articles/${post.slug}`} className="text-inherit no-underline"><div className="relative overflow-hidden"><ArticleVisual post={post} /><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-forest backdrop-blur">{post.category}</span></div><div className="p-5 sm:p-6"><h3 className="line-clamp-2 font-serif text-2xl leading-snug text-forest transition group-hover:text-coral">{post.title}</h3>{post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/55">{post.excerpt}</p>}<div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/8 pt-4"><ArticleMeta post={post} /><span aria-hidden="true" className="text-lg text-forest transition group-hover:translate-x-1 group-hover:text-coral">→</span></div></div></Link></article>)}</div>}
                    </> : <div className="surface-card rounded-[1.75rem] px-6 py-16 text-center sm:py-20"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint font-serif text-3xl text-forest">B.</span><p className="mt-5 font-serif text-3xl text-forest">Belum ada artikel yang cocok.</p><p className="mt-2 text-sm text-ink/55">Coba kata kunci atau kategori lain, atau jadilah penulis pertama.</p><Link href="/register" className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest/90">Mulai menulis <span className="ml-2">↗</span></Link></div>}

                    <div className="mt-9 flex flex-wrap justify-center gap-2">{posts.links.map((link, index) => link.url ? <Link key={index} href={link.url} preserveScroll aria-current={link.active ? 'page' : undefined} className={`min-w-10 rounded-full px-4 py-2.5 text-center text-xs font-bold transition ${link.active ? 'bg-forest text-white shadow-md shadow-forest/15' : 'border border-ink/10 bg-white text-ink/65 hover:border-forest/20 hover:text-forest'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : null)}</div>
                </section>

                {!isAuthenticated && <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24"><div className="relative isolate overflow-hidden rounded-[2rem] bg-[#e9ede3] px-6 py-9 sm:px-10 sm:py-12"><div aria-hidden="true" className="absolute -right-16 -top-24 size-80 rounded-full border border-forest/10" /><div aria-hidden="true" className="absolute -right-4 -top-12 size-56 rounded-full border border-forest/10" /><div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-coral">Punya cerita untuk dibagikan?</p><h2 className="mt-3 max-w-xl font-serif text-3xl tracking-tight text-forest sm:text-4xl">Jadikan idemu bacaan berikutnya.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-ink/55">Bergabunglah dengan komunitas penulis dan terbitkan gagasanmu.</p></div><Link href="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest/10 transition hover:-translate-y-0.5 hover:bg-forest/90">Daftar sebagai penulis <span>↗</span></Link></div></div></section>}
            </div>
        </PublicLayout>
    );
}
