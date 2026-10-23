'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { login } from '@/lib/api/auth'
import { AuthShell } from '@/components/auth-shell'

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <AuthShell
      footer={
        <p className="mt-8 text-center text-sm text-[#8b96a9]">
          New to taskflow?{' '}
          <Link href="/signup" className="font-semibold text-[#ff646b]">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="mt-10 lg:mt-16">
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="mt-2 text-sm text-[#8b96a9]">Sign in to continue to your workspace.</p>
        {error ? (
          <div className="mt-10 rounded-2xl bg-[#fdeceb] p-5 text-sm text-[#b42318]">{error}</div>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              minLength={1}
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button disabled={pending} className="primary-button mt-3 w-full justify-center disabled:opacity-60">
            {pending ? 'Please wait…' : 'Sign in'}
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
