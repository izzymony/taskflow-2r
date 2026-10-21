import Link from 'next/link'
import type { ReactNode } from 'react'

export function AuthShell({ children, footer }: { children: ReactNode; footer: ReactNode }) {
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
          {children}
          {footer}
        </div>
      </div>
    </main>
  )
}
