import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';

export default function Login() {
    const { csrfToken, errors } = usePage().props;

    return (
        <PublicLayout>
            <Head title="Masuk" />
            <div className="page-wash px-5 py-10 sm:px-8 sm:py-16">
                <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-ink/5 bg-white shadow-[0_24px_80px_rgba(21,35,30,0.09)] sm:min-h-[36rem] sm:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative hidden flex-col justify-between overflow-hidden bg-forest p-10 text-white sm:flex lg:p-14">
                        <div aria-hidden="true" className="editorial-grid absolute inset-0 opacity-40" />
                        <div aria-hidden="true" className="absolute -bottom-20 -right-20 size-80 rounded-full border border-white/15" />
                        <div aria-hidden="true" className="absolute -bottom-10 -right-10 size-60 rounded-full border border-white/15" />
                        <Link href="/" className="relative inline-flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white font-serif text-xl font-bold text-forest">B.</span><span className="font-semibold tracking-tight">BlogVerse <span className="text-white/90">Pro</span></span></Link>
                        <div className="relative max-w-md"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f0a78e]">Ruang menulis Anda</p><h1 className="mt-5 font-serif text-5xl leading-[1.08] tracking-tight">Kembali ke ide yang ingin Anda bagikan.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-white/90">Cerita yang baik dimulai dari satu paragraf. Lanjutkan dari tempat Anda berhenti.</p></div>
                        <p className="relative text-xs text-white/90">Baca. Renungkan. Bagikan kembali.</p>
                    </div>
                    <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
                        <div className="w-full max-w-md">
                            <div className="mb-8 sm:hidden"><Link href="/" className="inline-flex items-center gap-3 font-semibold text-forest"><span className="grid size-10 place-items-center rounded-xl bg-forest font-serif text-xl text-white">B.</span>BlogVerse Pro</Link></div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-coral">Selamat datang kembali</p>
                            <h2 className="mt-3 font-serif text-4xl tracking-tight text-forest">Masuk ke akun</h2>
                            <p className="mt-3 text-sm leading-6 text-ink/75">Lanjutkan menulis dan mengelola artikel Anda.</p>
                            <form method="post" action="/login" className="mt-8 space-y-5">
                                <input type="hidden" name="_token" value={csrfToken} />
                                <div><label htmlFor="login-username" className="mb-2 block text-sm font-semibold text-ink">Nama pengguna</label><input id="login-username" name="username" autoComplete="username" className="form-control" />{errors?.username && <p className="mt-1.5 text-sm text-red-600">{errors.username}</p>}</div>
                                <div><label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-ink">Kata sandi</label><input id="login-password" name="password" type="password" autoComplete="current-password" className="form-control" />{errors?.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}</div>
                                <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-ink/75"><input type="checkbox" name="remember" value="1" className="size-4 rounded accent-forest" /> Ingat saya</label>
                                <button id="login-submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 font-semibold text-white shadow-lg shadow-forest/15 transition hover:-translate-y-0.5 hover:bg-forest/90">Masuk <span aria-hidden="true">→</span></button>
                            </form>
                            <p className="mt-7 text-sm text-ink/75">Belum punya akun? <Link href="/register" className="font-semibold text-forest hover:text-coral">Daftar sebagai penulis</Link></p>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
