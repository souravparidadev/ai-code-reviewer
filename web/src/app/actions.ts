'use server'

import { redirect } from 'next/navigation'

export async function signOut() {
  // Clear the session with your auth provider here.
  redirect('/')
}
