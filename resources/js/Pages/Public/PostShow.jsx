import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import Viewer from '@toast-ui/editor/viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import PublicLayout from '../../Layouts/PublicLayout';

export default function PostShow({ post, isAuthenticated }) {
    const contentRef = useRef(null);

    useEffect(() => {
        if (!contentRef.current) return undefined;
        const viewer = new Viewer({ el: contentRef.current, initialValue: post.content ?? '' });
        return () => viewer.destroy();
    }, [post.content]);

    return (
        <PublicLayout isAuthenticated={isAuthenticated}>
            <Head title={post.title}><meta name="description" content={post.excerpt ?? post.title} /></Head>
            <article className="mx-auto max-w-5xl px-5 pb-20 pt-12 sm:px-8 sm:pt-20">
                <Link href="/articles" className="text-sm font-semibold text-forest hover:text-coral">← Semua artikel</Link>
                <header className="mx-auto max-w-3xl py-12 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">{post.category}</p>
                    <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-forest sm:text-6xl">{post.title}</h1>
                    {post.excerpt && <p className="mt-6 text-lg leading-8 text-ink/65">{post.excerpt}</p>}
                    <p className="mt-7 text-sm text-ink/55">Oleh <span className="font-semibold text-ink">{post.user?.name}</span> · {new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </header>
                {post.cover_image_path && <img src={`/storage/${post.cover_image_path}`} alt="" className="mb-12 max-h-[34rem] w-full rounded-3xl object-cover" />}
                <div ref={contentRef} className="mx-auto max-w-3xl rounded-2xl bg-transparent" />
            </article>
            <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
                <div className="flex flex-col justify-between gap-5 rounded-[2rem] bg-mint p-8 sm:flex-row sm:items-center sm:p-10">
                    <div><h2 className="font-serif text-3xl text-forest">Bergabung dalam percakapan.</h2><p className="mt-2 text-ink/65">Tulis dan bagikan gagasan Anda bersama komunitas.</p></div>
                    <div className="flex gap-3"><Link href="/login" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-forest">Masuk</Link><Link href="/register" className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white">Daftar</Link></div>
                </div>
            </section>
        </PublicLayout>
    );
}
