import { SectionHeading } from './section-heading'

const STEPS = [
  {
    number: '01',
    title: 'Connect repo',
    description: 'Sign in with GitHub and choose the repositories you want reviewed.',
  },
  {
    number: '02',
    title: 'Open PR',
    description: 'Push a branch and open a pull request the way you already do.',
  },
  {
    number: '03',
    title: 'Bot reviews',
    description: 'Line-level comments with severity land on the PR within minutes.',
  },
] as const

export function HowItWorksSection() {
  return (
    <section aria-labelledby="how-it-works-heading" className="border-t border-zinc-800">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8 md:py-24">
        <SectionHeading id="how-it-works-heading" eyebrow="How it works" title="Three steps. No config." />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.number} className="flex flex-col bg-zinc-900 p-6">
              <span className="font-mono text-sm text-zinc-500">{step.number}</span>
              <h3 className="mt-6 text-base font-medium text-zinc-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
