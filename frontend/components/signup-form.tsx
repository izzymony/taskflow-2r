'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { register } from '@/lib/api/auth'

const perks = [
  'Free 14-day trial — no credit card required',
  'Unlimited tasks and projects',
  'Invite your entire team',
]

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null
  const strength =
    value.length >= 12 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)
      ? 4
      : value.length >= 10 && /[A-Z0-9]/.test(value)
        ? 3
        : value.length >= 8
          ? 2
          : 1

  const colors = ['', 'bg-red-500', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="mt-2 flex items-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`h-1 flex-1 rounded-full transition-colors ${n <= strength ? colors[strength] : 'bg-slate-100'}`}
        />
      ))}
      <span className="text-[11px] font-medium text-slate-500">{labels[strength]}</span>
    </div>
  )
}

export function SignUpForm() {
  const router = useRouter()
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await register({ fullname, email, password })
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the server')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-gradient-to-br from-[#6355ff]/10 to-[#9061f9]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[500px] rounded-full bg-gradient-to-tr from-[#3b82f6]/8 to-[#6355ff]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_60px_rgba(15,23,42,0.10)] lg:grid lg:grid-cols-2">

          {/* Left panel */}
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#1a0f6b] via-[#2d1b8e] to-[#4a2abf] p-10 text-white lg:flex overflow-hidden">
            {/* Pattern overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-[-80px] top-[-80px] size-80 rounded-full bg-white/5 blur-2xl" />
              <div className="absolute bottom-[-60px] left-[-60px] size-64 rounded-full bg-[#6355ff]/30 blur-2xl" />
              {/* Grid dots */}
              <svg className="absolute inset-0 size-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>

            {/* Logo */}
            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur ring-1 ring-white/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-xl font-bold tracking-tight">TaskFlow</span>
              </Link>
            </div>

            {/* Hero text */}
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <Sparkles className="size-3" />
                Work, simplified
              </div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight">
                Bring your best<br />work together.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Tasks, clients, conversations, and company knowledge — all in one calm, focused workspace built for modern teams.
              </p>

              {/* Perks */}
              <ul className="mt-8 space-y-3">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2.5 text-sm text-white/75">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonial */}
            <div className="relative rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <p className="text-sm italic leading-relaxed text-white/70">
                &ldquo;TaskFlow completely changed how our agency manages clients. We ship twice as fast now.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">JM</div>
                <div>
                  <p className="text-xs font-semibold text-white">Jamie Moore</p>
                  <p className="text-[11px] text-white/50">Head of Operations, Studio Nova</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel — Form */}
          <div className="flex flex-col justify-center p-8 sm:p-10">
            {/* Mobile logo */}
            <div className="mb-6 flex items-center gap-2.5 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#6355ff] text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</span>
              </Link>
            </div>

            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
              <p className="mt-1.5 text-sm text-slate-500">Get started — it&apos;s free for 14 days.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">
                <div className="mt-0.5 size-4 shrink-0 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="block size-2 rounded-full bg-red-500" />
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label htmlFor="signup-fullname" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Full name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-fullname"
                    required
                    minLength={2}
                    name="fullname"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-[#f8fafc] pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:border-[#6355ff] focus:bg-white focus:ring-4 focus:ring-[#6355ff]/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Work email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-email"
                    required
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-[#f8fafc] pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:border-[#6355ff] focus:bg-white focus:ring-4 focus:ring-[#6355ff]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-password"
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-[#f8fafc] pl-10 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:border-[#6355ff] focus:bg-white focus:ring-4 focus:ring-[#6355ff]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <PasswordStrength value={password} />
              </div>

              {/* Terms */}
              <p className="text-xs text-slate-400">
                By creating an account you agree to our{' '}
                <span className="text-[#6355ff] cursor-pointer hover:underline">Terms of Service</span> and{' '}
                <span className="text-[#6355ff] cursor-pointer hover:underline">Privacy Policy</span>.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6355ff] text-sm font-semibold text-white shadow-md shadow-[#6355ff]/25 transition-all hover:bg-[#5244e8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create free account
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/signin" className="font-semibold text-[#6355ff] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
