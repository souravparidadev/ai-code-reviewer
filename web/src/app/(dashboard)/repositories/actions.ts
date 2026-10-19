'use server'

import { revalidatePath } from 'next/cache'
import { setRepositoryEnabled } from '@/lib/data'

export async function toggleRepository(repoId: string, enabled: boolean) {
  if (typeof repoId !== 'string' || typeof enabled !== 'boolean') {
    throw new Error('Invalid input')
  }
  const repo = await setRepositoryEnabled(repoId, enabled)
  revalidatePath('/repositories')
  revalidatePath('/dashboard')
  return repo
}
