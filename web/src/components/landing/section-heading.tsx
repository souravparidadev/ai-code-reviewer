interface SectionHeadingProps {
  id: string
  eyebrow: string
  title: string
  description?: string
}

export function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-xl">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-balance text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-400">{description}</p>}
    </div>
  )
}
