import { Fragment } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { SectionHeading } from './section-heading'

const PIPELINE = ['Webhook', 'Redis Queue', 'Worker', 'LLM + Pinecone Context', 'PR Comment'] as const

export function ArchitectureSection() {
  return (
    <section aria-labelledby="architecture-heading" className="border-t border-zinc-800">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8 md:py-24">
        <SectionHeading
          id="architecture-heading"
          eyebrow="Architecture"
          title="Built like infrastructure."
          description="GitHub webhooks are queued and processed by background workers, which retrieve relevant repository context before posting the review back to the pull request."
        />
        <ol
          aria-label="Review pipeline"
          className="mt-12 flex flex-col items-stretch gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4 md:flex-row md:items-center md:justify-between md:gap-3 md:p-5"
        >
          {PIPELINE.map((stage, index) => (
            <Fragment key={stage}>
              <li className="flex items-center justify-center rounded-md border border-zinc-800 bg-[#0a0a0a] px-3 py-2 text-center font-mono text-xs text-zinc-300 md:whitespace-nowrap">
                {stage}
              </li>
              {index < PIPELINE.length - 1 && (
                <li aria-hidden="true" className="flex justify-center text-zinc-600">
                  <ArrowRight className="hidden size-4 md:block" />
                  <ArrowDown className="size-4 md:hidden" />
                </li>
              )}
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
  )
}
