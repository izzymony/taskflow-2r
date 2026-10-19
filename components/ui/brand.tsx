function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="relative flex size-8 items-center justify-center overflow-hidden rounded-[10px] bg-slate-950 shadow-sm"
        aria-hidden="true"
      >
        <span className="absolute left-[7px] top-[8px] h-[3px] w-[14px] -rotate-45 rounded-full bg-violet-300" />
        <span className="absolute left-[9px] top-[14px] h-[3px] w-[12px] rotate-45 rounded-full bg-violet-500" />
        <span className="absolute left-[12px] top-[18px] h-[3px] w-[10px] -rotate-45 rounded-full bg-violet-700" />
        <span className="absolute bottom-1.5 right-1.5 size-1.5 rounded-full bg-white" />
      </span>
      <span className="font-bold tracking-tight">TaskFlow</span>
    </div>
  )
}

export { Brand }
