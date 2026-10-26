import type { Metadata } from 'next'
import { SignUpForm } from '@/components/signup-form'

export const metadata: Metadata = {
  title: 'Create Account — Taskflow',
  description: 'Create a free Taskflow account to start managing your tasks, clients, and projects.',
}

export default function SignUpPage() {
  return <SignUpForm />
}
