'use client'

import { useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react'

const benefits = ['Unlimited projects and tasks', 'Shared views for every team', 'Insights that keep work moving']

export default function Page() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isSignup = mode === 'signup'

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-slate-950 lg:grid lg:grid-cols-[minmax(380px,0.86fr)_minmax(520px,1.14fr)]">
      <section className="relative hidden overflow-hidden bg-[#17132f] px-10 py-10 text-white lg:flex lg:flex-col xl:px-16">
        <div className="absolute -left-32 top-[-10%] size-[520px] rounded-full bg-violet-500/25 blur-[100px]" />
        <div className="absolute bottom-[-15%] right-[-12%] size-[500px] rounded-full bg-indigo-400/20 blur-[110px]" />
        <div className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-950/30"><Zap className="size-4" fill="currentColor" /></span>
          <span className="text-lg font-bold tracking-tight">TaskFlow</span>
        </div>
        <div className="relative mt-auto max-w-lg pb-12">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">Work, in rhythm</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-6xl">Bring clarity to the work that matters.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-violet-100/70">TaskFlow gives your team one calm, focused place to plan, collaborate, and finish strong.</p>
          <div className="mt-10 flex flex-col gap-4">
            {benefits.map((benefit) => <div key={benefit} className="flex items-center gap-3 text-sm text-violet-50/90"><span className="flex size-5 items-center justify-center rounded-full bg-violet-400/20 text-violet-200"><Check className="size-3" /></span>{benefit}</div>)}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-violet-200/50"><ShieldCheck className="size-4" /> Trusted by focused teams everywhere</div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <header className="flex items-center justify-between lg:justify-end"><div className="flex items-center gap-2 lg:hidden"><span className="flex size-8 items-center justify-center rounded-lg bg-[#6753d6] text-white"><Zap className="size-4" fill="currentColor" /></span><span className="font-bold tracking-tight">TaskFlow</span></div><p className="text-sm text-slate-500">{isSignup ? 'Already have an account?' : 'New to TaskFlow?'} <button onClick={() => { setMode(isSignup ? 'login' : 'signup'); setSubmitted(false) }} className="font-semibold text-violet-700 hover:text-violet-900">{isSignup ? 'Sign in' : 'Create account'}</button></p></header>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <div className="mb-8"><div className="mb-5 inline-flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Sparkles className="size-5" /></div><h2 className="text-3xl font-bold tracking-[-0.04em]">{isSignup ? 'Create your account' : 'Welcome back'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{isSignup ? 'Start organizing your team’s best work today.' : 'Sign in to pick up where you left off.'}</p></div>
          <div className="grid grid-cols-2 gap-3"><button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm transition hover:border-slate-300 hover:bg-slate-50"><span className="font-bold">G</span> Google</button><button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm transition hover:border-slate-300 hover:bg-slate-50"><span className="text-base font-bold"></span> Apple</button></div>
          <div className="my-7 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div>
          <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="flex flex-col gap-4">
            {isSignup && <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">Full name<input required placeholder="Alex Morgan" className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /></label>}
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">Work email<div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" /><input required type="email" placeholder="you@company.com" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /></div></label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">Password<div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" /><input required minLength={8} type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 rounded-md p-1 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
            {isSignup && <label className="flex items-start gap-2 text-xs leading-5 text-slate-500"><input required type="checkbox" className="mt-1 accent-violet-600" />I agree to the <button type="button" className="text-violet-700 underline underline-offset-2">Terms of Service</button> and Privacy Policy.</label>}
            <button type="submit" className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6753d6] text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-[#5744c2]">{isSignup ? 'Create account' : 'Sign in'}<ArrowRight className="size-4" /></button>
          </form>
          {submitted && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">You’re all set. Welcome to TaskFlow.</p>}
          {!isSignup && <button className="mt-5 w-full text-center text-xs font-medium text-slate-500 hover:text-violet-700">Forgot your password?</button>}
          <p className="mt-10 text-center text-xs leading-5 text-slate-400">By continuing, you agree to TaskFlow&apos;s Terms and acknowledge the Privacy Policy.</p>
        </div>
        <footer className="flex justify-between text-xs text-slate-400"><span>© 2026 TaskFlow</span><span>Support · Privacy</span></footer>
      </section>
    </main>
  )
}
