import type { Metadata } from 'next'
import { RepositoriesPage } from '@/components/repositories/repositories-page'
import { getRepositories } from '@/lib/data'
import { toggleRepository } from './actions'

export const metadata: Metadata = { title: 'Repositories' }

export default async function Page() {
  const repos = await getRepositories()
  return <RepositoriesPage repos={repos} onToggle={toggleRepository} />
}
