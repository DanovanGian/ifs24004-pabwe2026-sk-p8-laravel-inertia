import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ username: '', password: '', remember: false });
    function submit(event) {
        event.preventDefault();
        post('/login');
    }

    return (
        <PublicLayout>
            <Head title="Masuk" />
            <section className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-12 px-5 py-14 sm:grid-cols-2 sm:px-8">
                <div className="hidden min-h-[30rem] flex-col justify-between rounded-[2rem] bg-forest p-10 text-white sm:flex">
                    <span className="font-serif text-2xl">BlogVerse Pro</span>
                    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a9d5bb]">Ruang menulis Anda</p><h1 className="mt-4 font-serif text-5xl leading-tight">Kembali ke ide yang ingin Anda bagikan.</h1></div>
                    <p className="text-sm text-white/60">Cerita yang baik dimulai dari satu paragraf.</p>
                </div>
                <div className="mx-auto w-full max-w-md">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Selamat datang kembali</p>
                    <h1 className="mt-3 font-serif text-4xl text-forest">Masuk ke akun</h1>
                    <p className="mt-3 text-sm text-ink/60">Lanjutkan menulis dan mengelola artikel Anda.</p>
                    <form onSubmit={submit} className="mt-8 space-y-5">
                        <div><label htmlFor="login-username" className="mb-2 block text-sm font-semibold">Nama pengguna</label><input id="login-username" autoComplete="username" value={data.username} onChange={(event) => setData('username', event.target.value)} className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 outline-none focus:border-forest" />{errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}</div>
                        <div><label htmlFor="login-password" className="mb-2 block text-sm font-semibold">Kata sandi</label><input id="login-password" type="password" autoComplete="current-password" value={data.password} onChange={(event) => setData('password', event.target.value)} className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 outline-none focus:border-forest" />{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}</div>
                        <label className="flex items-center gap-2 text-sm text-ink/65"><input type="checkbox" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} className="accent-forest" /> Ingat saya</label>
                        <button id="login-submit" disabled={processing} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-forest font-semibold text-white transition hover:bg-forest/90 disabled:opacity-60">{processing ? 'Memproses…' : 'Masuk'}</button>
                    </form>
                    <p className="mt-6 text-sm text-ink/60">Belum punya akun? <Link href="/register" className="font-semibold text-forest hover:text-coral">Daftar sebagai penulis</Link></p>
                </div>
            </section>
        </PublicLayout>
    );
}
