'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { login } from '@/lib/api/auth'

export function SignInForm() {
  const router = useRouter()
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
      await login({ email, password })
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

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#6355ff] shadow-lg shadow-[#6355ff]/30 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to continue to your workspace.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">
              <div className="mt-0.5 size-4 shrink-0 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="block size-2 rounded-full bg-red-500" />
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="signin-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signin-email"
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
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="signin-password" className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button type="button" className="text-xs font-medium text-[#6355ff] hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signin-password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6355ff] text-sm font-semibold text-white shadow-md shadow-[#6355ff]/25 transition-all hover:bg-[#5244e8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-[#6355ff] hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        {/* Tagline */}
        <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="size-3 text-[#6355ff]" />
          Work, simplified. Powered by TaskFlow.
        </p>
      </div>
    </div>
  )
}
