"use server"

import { redirect } from "next/navigation"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function signOut() {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {
    // Even if the backend is unavailable, send the user back home.
  })

  redirect("/")
}