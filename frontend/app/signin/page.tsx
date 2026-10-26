import type { Metadata } from 'next'
import { SignInForm } from '@/components/signin-form'

export const metadata: Metadata = {
  title: 'Sign In — Taskflow',
  description: 'Sign in to your Taskflow workspace to manage tasks, clients, and projects.',
}

export default function SignInPage() {
  return <SignInForm />
}
