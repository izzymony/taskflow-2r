'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { login, register } from '@/lib/api/auth'

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter()
  const signup = mode === 'signup'
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const result = signup
        ? await register({ fullname, email, password })
        : await login({ email, password })

      if (!result.success) {
        setError(result.message ?? 'Unable to continue')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the server')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] p-5">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#172033]/10 lg:grid-cols-2">
        <div className="hidden bg-[#172033] p-12 text-white lg:block">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-[#ff8b88]">task</span>flow
          </Link>
          <div className="mt-32">
            <p className="mb-4 text-sm font-medium text-[#ff8b88]">WORK, SIMPLIFIED</p>
            <h1 className="text-4xl font-bold leading-tight">Bring your best work together.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#aeb9cc]">
              Tasks, clients, conversations, and company knowledge in one calm workspace.
            </p>
          </div>
        </div>
        <div className="p-7 sm:p-12">
          <Link href="/" className="text-xl font-bold lg:hidden">
            <span className="text-[#ff646b]">task</span>flow
          </Link>
          <div className="mt-10 lg:mt-16">
            <h2 className="text-3xl font-bold">{signup ? 'Create your account' : 'Welcome back'}</h2>
            <p className="mt-2 text-sm text-[#8b96a9]">
              {signup ? 'Start organizing your work today.' : 'Sign in to continue to your workspace.'}
            </p>
            {error ? (
              <div className="mt-10 rounded-2xl bg-[#fdeceb] p-5 text-sm text-[#b42318]">{error}</div>
            ) : null}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {signup && (
                <label className="field">
                  <UserRound className="size-4" />
                  <input
                    required
                    minLength={2}
                    name="fullname"
                    placeholder="Full name"
                    value={fullname}
                    onChange={(event) => setFullname(event.target.value)}
                  />
                </label>
              )}
              <label className="field">
                <Mail className="size-4" />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="field">
                <LockKeyhole className="size-4" />
                <input
                  required
                  minLength={signup ? 8 : 1}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button disabled={pending} className="primary-button mt-3 w-full justify-center disabled:opacity-60">
                {pending ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
          <p className="mt-8 text-center text-sm text-[#8b96a9]">
            {signup ? 'Already have an account?' : 'New to taskflow?'}{' '}
            <Link href={signup ? '/signin' : '/signup'} className="font-semibold text-[#ff646b]">
              {signup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
