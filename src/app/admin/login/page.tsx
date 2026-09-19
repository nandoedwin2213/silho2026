import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return <main className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center"><div className="w-full"><p className="text-center font-heading text-3xl tracking-[0.25em] text-navy">SILHO</p><p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-gold">Acceso administrativo</p><div className="mt-8"><LoginForm /></div></div></main>;
}
