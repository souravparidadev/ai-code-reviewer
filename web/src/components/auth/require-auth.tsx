"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

type User = {
  userId: string
  username: string
}

type MeResponse = {
  message: string
  user: User
}

export function RequireAuth({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<MeResponse>("/me")
      .then((data) => {
        setUser(data.user)
      })
      .catch(() => {
        // api() handles 401 by redirecting to GitHub OAuth
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Checking authentication...
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}