/* type Task = {
  title: string
  client: string
  assignee: string
  tags: string[]
  meta?: string
} */

  interface Task  {
  title: string
  client: string
  assignee: string
  tags: string[]
  meta?: string
}

const tagColors: Record<string, string> = {
  Web: 'bg-sky-50 text-sky-600',
  SaaS: 'bg-amber-50 text-amber-600',
  Mobile: 'bg-fuchsia-50 text-fuchsia-6000 text-800',
}

function getTagColor(tag: string): string {
  return tagColors[tag] ?? 'bg-fuchsia-50 text-fuchsia-600'
}

function TaskCard({ task }: { task: Task }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-[9px] text-slate-400">Client: {task.client}</p>
      <h3 className="mt-1 text-[11px] font-semibold leading-4 text-slate-800">
        {task.title}
      </h3>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[7px] font-bold text-violet-700">
            SC
          </span>
          <span className="truncate text-[9px] text-slate-500">{task.assignee}</span>
        </div>
        <div className="flex gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded px-1 py-0.5 text-[8px] font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400">
        <span>◌ {task.meta}</span>
        <span>◷ 4d</span>
      </div>
    </article>
  )
}

export { TaskCard, type Task, getTagColor }
