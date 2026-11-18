import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';

const fields = [
    ['name', 'Nama lengkap', 'text', 'name'],
    ['username', 'Nama pengguna', 'text', 'username'],
    ['email', 'Email', 'email', 'email'],
    ['password', 'Kata sandi', 'password', 'new-password'],
    ['password_confirmation', 'Ulangi kata sandi', 'password', 'new-password'],
];

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({ name: '', username: '', email: '', password: '', password_confirmation: '' });
    function submit(event) {
        event.preventDefault();
        post('/register');
    }

    return (
        <PublicLayout>
            <Head title="Daftar penulis" />
            <div className="page-wash px-5 py-10 sm:px-8 sm:py-16">
                <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-ink/5 bg-white shadow-[0_24px_80px_rgba(21,35,30,0.09)] sm:grid-cols-[0.92fr_1.08fr]">
                    <div className="relative hidden flex-col justify-between overflow-hidden bg-[#e9ede3] p-10 text-forest sm:flex lg:p-14">
                        <div aria-hidden="true" className="absolute -bottom-20 -right-20 size-80 rounded-full border border-forest/10" />
                        <div aria-hidden="true" className="absolute -bottom-10 -right-10 size-60 rounded-full border border-forest/10" />
                        <Link href="/" className="relative inline-flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-forest font-serif text-xl font-bold text-white">B.</span><span className="font-semibold tracking-tight">BlogVerse <span className="text-ink/75">Pro</span></span></Link>
                        <div className="relative max-w-md"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-coral">Mulai berbagi</p><h1 className="mt-5 font-serif text-5xl leading-[1.08] tracking-tight">Buat ruang untuk tulisan Anda.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-ink/75">Bergabung dengan penulis lain dan terbitkan gagasan yang layak dibaca.</p></div>
                        <p className="relative text-xs text-ink/75">Satu akun. Banyak gagasan.</p>
                    </div>
                    <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
                        <div className="w-full max-w-md">
                            <div className="mb-7 sm:hidden"><Link href="/" className="inline-flex items-center gap-3 font-semibold text-forest"><span className="grid size-10 place-items-center rounded-xl bg-forest font-serif text-xl text-white">B.</span>BlogVerse Pro</Link></div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-coral">Daftar penulis</p>
                            <h2 className="mt-3 font-serif text-4xl tracking-tight text-forest">Mulai menulis</h2>
                            <p className="mt-3 text-sm leading-6 text-ink/75">Buat akun untuk menyimpan dan menerbitkan karya Anda.</p>
                            <form onSubmit={submit} className="mt-7 space-y-4">
                                {fields.map(([key, label, type, autocomplete]) => <div key={key}><label htmlFor={key} className="mb-2 block text-sm font-semibold text-ink">{label}</label><input id={key} type={type} autoComplete={autocomplete} value={data[key]} onChange={(event) => setData(key, event.target.value)} className="form-control" />{errors[key] && <p className="mt-1.5 text-sm text-red-600">{errors[key]}</p>}</div>)}
                                <button disabled={processing} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 font-semibold text-white shadow-lg shadow-forest/15 transition hover:-translate-y-0.5 hover:bg-forest/90 disabled:opacity-60">{processing ? 'Memproses…' : 'Buat akun'} <span aria-hidden="true">→</span></button>
                            </form>
                            <p className="mt-6 text-sm text-ink/75">Sudah punya akun? <Link href="/login" className="font-semibold text-forest hover:text-coral">Masuk</Link></p>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
