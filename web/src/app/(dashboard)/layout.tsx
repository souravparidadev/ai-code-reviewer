import { Suspense } from "react"
import { signOut } from "@/app/actions"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { getCurrentUser } from "@/lib/data"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <>
      <Suspense fallback={null}>
        <AppSidebar user={user} signOutAction={signOut} />
      </Suspense>

      <div className="flex min-h-svh flex-col md:pl-60">
        <Suspense fallback={null}>
          <TopBar />
        </Suspense>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-10 md:py-12">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}