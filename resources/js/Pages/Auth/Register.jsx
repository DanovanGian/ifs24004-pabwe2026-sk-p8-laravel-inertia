import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({ name: '', username: '', email: '', password: '', password_confirmation: '' });
    function submit(event) {
        event.preventDefault();
        post('/register');
    }

    return (
        <PublicLayout>
            <Head title="Daftar penulis" />
            <section className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-12 px-5 py-14 sm:grid-cols-2 sm:px-8">
                <div className="hidden min-h-[30rem] flex-col justify-between rounded-[2rem] bg-[#e6e9dc] p-10 text-forest sm:flex">
                    <span className="font-serif text-2xl">BlogVerse Pro</span>
                    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Mulai berbagi</p><h1 className="mt-4 font-serif text-5xl leading-tight">Buat ruang untuk tulisan Anda.</h1></div>
                    <p className="text-sm text-ink/60">Satu akun. Banyak gagasan.</p>
                </div>
                <div className="mx-auto w-full max-w-md">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Daftar penulis</p>
                    <h1 className="mt-3 font-serif text-4xl text-forest">Mulai menulis</h1>
                    <form onSubmit={submit} className="mt-8 space-y-4">
                        {[
                            ['name', 'Nama lengkap', 'text'], ['username', 'Nama pengguna', 'text'], ['email', 'Email', 'email'], ['password', 'Kata sandi', 'password'], ['password_confirmation', 'Ulangi kata sandi', 'password'],
                        ].map(([key, label, type]) => <div key={key}><label htmlFor={key} className="mb-2 block text-sm font-semibold">{label}</label><input id={key} type={type} autoComplete={key === 'password_confirmation' ? 'new-password' : key} value={data[key]} onChange={(event) => setData(key, event.target.value)} className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 outline-none focus:border-forest" />{errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key]}</p>}</div>)}
                        <button disabled={processing} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-forest font-semibold text-white transition hover:bg-forest/90 disabled:opacity-60">{processing ? 'Memproses…' : 'Buat akun'}</button>
                    </form>
                    <p className="mt-6 text-sm text-ink/60">Sudah punya akun? <Link href="/login" className="font-semibold text-forest hover:text-coral">Masuk</Link></p>
                </div>
            </section>
        </PublicLayout>
    );
}
